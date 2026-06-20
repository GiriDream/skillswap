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

      peerConnection.current.onconnectionstatechange = () => {
        if (!isMounted || !peerConnection.current) return;
        const state = peerConnection.current.connectionState;
        if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          onClose();
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

    socket.on('endCall', () => {
      if (isMounted) onClose();
    });

    socket.on('onlineUsers', (users) => {
      if (isMounted && !users.includes(targetId)) {
        onClose();
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
      socket.off('endCall');
      socket.off('onlineUsers');

      // Send endCall signal to target peer
      socket.emit('endCall', { targetId });

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
    <div className="fixed inset-0 bg-slate flex flex-col items-center justify-center z-50 p-4 md:p-6">
      <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-slate-light rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center border border-chalk/10">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />

        {connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-marigold border-t-transparent rounded-full animate-spin" />
              <p className="text-chalk text-sm font-medium">Connecting to peer...</p>
            </div>
          </div>
        )}

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-28 h-36 md:w-48 md:h-36 rounded-xl border-2 border-marigold shadow-lg object-contain bg-slate"
        />
      </div>

      <div className="mt-4 md:mt-6 flex gap-4">
        <button
          onClick={handleEndCall}
          className="bg-vermilion text-white px-8 py-3 rounded-full text-sm md:text-base font-semibold shadow-lg hover:opacity-90 active:scale-95 transition"
        >
          End Call
        </button>
      </div>
    </div>
  );
}

export default VideoCall;