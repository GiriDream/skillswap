import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function VideoCall({ targetId, onClose }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const pendingCandidates = useRef([]);
  const [connecting, setConnecting] = useState(true);

  const isCaller = user._id < targetId;

  useEffect(() => {
    let stream;
    let isMounted = true;

    const init = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (!isMounted) return;
      localVideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
      stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnecting(false);
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('iceCandidate', { targetId, candidate: event.candidate });
        }
      };

      // Listeners registered ONLY after peerConnection is ready — fixes the null error
      socket.on('incomingCall', async ({ offer, callerId }) => {
        if (callerId !== targetId || !peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        pendingCandidates.current.forEach((c) => peerConnection.current.addIceCandidate(c));
        pendingCandidates.current = [];
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit('answerCall', { targetId: callerId, answer });
      });

      socket.on('callAnswered', async ({ answer }) => {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        pendingCandidates.current.forEach((c) => peerConnection.current.addIceCandidate(c));
        pendingCandidates.current = [];
      });

      socket.on('iceCandidate', async ({ candidate }) => {
        if (!peerConnection.current) return;
        const iceCandidate = new RTCIceCandidate(candidate);
        if (peerConnection.current.remoteDescription) {
          await peerConnection.current.addIceCandidate(iceCandidate);
        } else {
          pendingCandidates.current.push(iceCandidate);
        }
      });

      if (isCaller) {
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('callUser', { targetId, offer, callerId: user._id });
      }
    };

    init();

    return () => {
      isMounted = false;
      stream?.getTracks().forEach((t) => t.stop());
      peerConnection.current?.close();
      peerConnection.current = null;
      socket.off('incomingCall');
      socket.off('callAnswered');
      socket.off('iceCandidate');
    };
  }, []);

  const handleEndCall = () => {
    peerConnection.current?.close();
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