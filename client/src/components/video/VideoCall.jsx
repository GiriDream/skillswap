import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ]
};

function VideoCall({ targetId, onClose }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  
  // Ref tracking to resolve WebRTC race conditions
  const isLocalReady = useRef(false);
  const pendingCandidates = useRef([]);
  const pendingOffer = useRef(null);
  const localStream = useRef(null);
  
  const [connecting, setConnecting] = useState(true);

  const isCaller = user._id < targetId;

  const makeOffer = async () => {
    if (!peerConnection.current) return;
    try {
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('callUser', { targetId, offer, callerId: user._id });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  const handleIncomingCall = async (offer, callerId) => {
    if (callerId !== targetId) return;
    
    // If local stream & pc are not ready yet, store it in ref to process later
    if (!isLocalReady.current || !peerConnection.current) {
      pendingOffer.current = offer;
      return;
    }
    
    try {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process any candidates queued before the remote description was set
      pendingCandidates.current.forEach((c) => {
        peerConnection.current.addIceCandidate(c).catch((err) => {
          console.error("Error adding queued ice candidate:", err);
        });
      });
      pendingCandidates.current = [];
      
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit('answerCall', { targetId: callerId, answer });
    } catch (err) {
      console.error('Error handling incoming call:', err);
    }
  };

  useEffect(() => {
    if (!socket) return;
    let isMounted = true;
    
    // 1. Initialize RTCPeerConnection synchronously on mount to receive candidates immediately
    try {
      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
      
      peerConnection.current.ontrack = (event) => {
        if (!isMounted) return;
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setConnecting(false);
        }
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('iceCandidate', { targetId, candidate: event.candidate });
        }
      };
    } catch (err) {
      console.error('Failed to create RTCPeerConnection:', err);
    }

    // 2. Set up socket event listeners synchronously
    socket.on('callReady', ({ callerId }) => {
      if (callerId !== targetId) return;
      if (isCaller && isLocalReady.current) {
        makeOffer();
      }
    });

    socket.on('incomingCall', async ({ offer, callerId }) => {
      await handleIncomingCall(offer, callerId);
    });

    socket.on('callAnswered', async ({ answer }) => {
      if (!peerConnection.current) return;
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        
        pendingCandidates.current.forEach((c) => {
          peerConnection.current.addIceCandidate(c).catch((err) => {
            console.error("Error adding queued ice candidate:", err);
          });
        });
        pendingCandidates.current = [];
      } catch (err) {
        console.error('Error handling callAnswered:', err);
      }
    });

    socket.on('iceCandidate', async ({ candidate }) => {
      if (!peerConnection.current) return;
      try {
        const iceCandidate = new RTCIceCandidate(candidate);
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(iceCandidate);
        } else {
          pendingCandidates.current.push(iceCandidate);
        }
      } catch (err) {
        console.error('Error adding ice candidate:', err);
      }
    });

    // 3. Request user media asynchronously and add tracks
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        
        localStream.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (peerConnection.current) {
          stream.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, stream);
          });
        }

        isLocalReady.current = true;

        // Notify the remote peer that we are ready for the call
        socket.emit('callReady', { targetId });

        // If an offer arrived before our media was ready, handle it now
        if (pendingOffer.current) {
          await handleIncomingCall(pendingOffer.current, targetId);
          pendingOffer.current = null;
        } else if (isCaller) {
          // If we are the caller and no offer is pending, send the initial offer
          await makeOffer();
        }

      } catch (err) {
        console.error('Error accessing media devices:', err);
        if (isMounted) {
          alert('Could not access camera or microphone. Please make sure permissions are granted.');
          onClose();
        }
      }
    };

    initMedia();

    return () => {
      isMounted = false;
      
      // Clean up socket listeners
      socket.off('callReady');
      socket.off('incomingCall');
      socket.off('callAnswered');
      socket.off('iceCandidate');

      // Stop all tracks of local stream to prevent camera resource leak
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      
      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, [socket, targetId]);

  const handleEndCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="relative w-full h-full">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-chalk text-sm">Connecting...</p>
          </div>
        )}

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-20 right-3 w-24 h-32 md:bottom-4 md:right-4 md:w-40 md:h-28 rounded-lg border-2 border-white object-cover"
        />
      </div>

      <button
        onClick={handleEndCall}
        className="absolute bottom-6 bg-vermilion text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full text-sm md:text-base font-medium"
      >
        End Call
      </button>
    </div>
  );
}

export default VideoCall;