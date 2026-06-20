import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // free public STUN server
};

function VideoCall({ targetId, onClose }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [callStarted, setCallStarted] = useState(false);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection(ICE_SERVERS);
      stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('iceCandidate', { targetId, candidate: event.candidate });
        }
      };

      // Caller: create + send offer
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      socket.emit('callUser', { targetId, offer, callerId: user._id });
    };

    init();

    socket.on('callAnswered', async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      setCallStarted(true);
    });

    socket.on('iceCandidate', async ({ candidate }) => {
      try {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    });

    return () => {
      peerConnection.current?.close();
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
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border-2 border-white object-cover" />
      </div>
      <button onClick={handleEndCall} className="absolute bottom-6 bg-red-600 text-white px-6 py-3 rounded-full">
        End Call
      </button>
    </div>
  );
}

export default VideoCall;