import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Tipos
interface Session {
  id: string;
  clientId: string;
  clientName: string;
  technicianId: string;
  technicianName: string;
  specialtyId: string;
  specialtyName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  recording?: string;
}

const VideoCallPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar dados da sessão
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const response = await api.get(`/api/sessions/${sessionId}`);
        setSession(response.data);
        
        if (response.data.status === 'completed') {
          setIsCallEnded(true);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da sessão:', error);
        toast.error('Não foi possível carregar os dados da sessão');
        navigate('/app/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId, navigate]);

  // Iniciar timer quando a chamada começar
  useEffect(() => {
    if (session?.status === 'in-progress' && !timerRef.current) {
      const startTime = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
      
      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session]);

  // Configurar WebRTC quando a sessão estiver carregada e o socket conectado
  useEffect(() => {
    if (!session || !isConnected || !socket) return;

    const setupWebRTC = async () => {
      try {
        // Configurar conexão WebRTC
        const configuration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        };
        
        peerConnectionRef.current = new RTCPeerConnection(configuration);
        
        // Obter mídia local
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Adicionar tracks à conexão peer
        stream.getTracks().forEach(track => {
          if (peerConnectionRef.current) {
            peerConnectionRef.current.addTrack(track, stream);
          }
        });
        
        // Configurar handlers de eventos
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              sessionId,
              candidate: event.candidate,
              userId: user?.id
            });
          }
        };
        
        peerConnectionRef.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
        
        // Sinalização via Socket.io
        socket.on('offer', async (data) => {
          if (data.sessionId !== sessionId || !peerConnectionRef.current) return;
          
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          socket.emit('answer', {
            sessionId,
            answer,
            userId: user?.id
          });
        });
        
        socket.on('answer', async (data) => {
          if (data.sessionId !== sessionId || !peerConnectionRef.current) return;
          
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        });
        
        socket.on('ice-candidate', async (data) => {
          if (data.sessionId !== sessionId || !peerConnectionRef.current) return;
          
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        });
        
        socket.on('call-ended', (data) => {
          if (data.sessionId !== sessionId) return;
          
          endCall();
        });
        
        // Iniciar a chamada
        if (user?.role === 'client') {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          
          socket.emit('offer', {
            sessionId,
            offer,
            userId: user.id
          });
        }
        
        // Iniciar gravação
        socket.emit('start-recording', { sessionId });
        setIsRecording(true);
        
        // Atualizar status da sessão
        if (session.status !== 'in-progress') {
          await api.put(`/api/sessions/${sessionId}/status`, { status: 'in-progress' });
          
          // Atualizar o estado local
          setSession(prev => prev ? { ...prev, status: 'in-progress', startedAt: new Date().toISOString() } : null);
        }
      } catch (error) {
        console.error('Erro ao configurar WebRTC:', error);
        toast.error('Não foi possível iniciar a chamada de vídeo');
      }
    };

    setupWebRTC();

    // Cleanup
    return () => {
      if (socket) {
        socket.off('offer');
        socket.off('answer');
        socket.off('ice-candidate');
        socket.off('call-ended');
      }
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [session, isConnected, socket, sessionId, user]);

  // Função para encerrar a chamada
  const endCall = async () => {
    try {
      // Parar a gravação
      if (socket && isRecording) {
        socket.emit('stop-recording', { sessionId });
        setIsRecording(false);
      }
      
      // Atualizar status da sessão
      await api.put(`/api/sessions/${sessionId}/status`, { status: 'completed' });
      
      // Limpar recursos
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      // Atualizar estado
      setIsCallEnded(true);
      
      // Notificar o outro participante
      if (socket) {
        socket.emit('call-ended', { sessionId, userId: user?.id });
      }
    } catch (error) {
      console.error('Erro ao encerrar chamada:', error);
      toast.error('Erro ao encerrar a chamada');
    }
  };

  // Função para alternar microfone
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Função para alternar câmera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Função para compartilhar tela
  const toggleScreenShare = async () => {
    if (!peerConnectionRef.current) return;
    
    try {
      if (!isScreenSharing) {
        // Iniciar compartilhamento de tela
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Substituir a track de vídeo
        const videoTrack = screenStream.getVideoTracks()[0];
        
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(sender => 
          sender.track?.kind === 'video'
        );
        
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
        
        // Atualizar vídeo local
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Adicionar handler para quando o usuário parar o compartilhamento
        videoTrack.onended = () => {
          toggleScreenShare();
        };
        
        setIsScreenSharing(true);
      } else {
        // Parar compartilhamento de tela
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(sender => 
            sender.track?.kind === 'video'
          );
          
          if (videoSender && videoTrack) {
            videoSender.replaceTrack(videoTrack);
          }
          
          // Restaurar vídeo local
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
      toast.error('Não foi possível compartilhar a tela');
    }
  };

  // Função para enviar avaliação
  const submitFeedback = async () => {
    if (!sessionId || rating === 0) {
      toast.error('Por favor, selecione uma avaliação');
      return;
    }
    
    setSubmittingFeedback(true);
    
    try {
      await api.post(`/api/sessions/${sessionId}/feedback`, {
        rating,
        feedback
      });
      
      toast.success('Avaliação enviada com sucesso!');
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      toast.error('Não foi possível enviar a avaliação');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Formatar tempo decorrido
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-400">
        <h2 className="text-2xl font-bold mb-4">Sessão não encontrada</h2>
        <p className="text-gray-400 mb-6">
          A sessão que você está procurando não existe ou foi removida.
        </p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/app/dashboard')}
        >
          Voltar para o Dashboard
        </button>
      </div>
    );
  }

  // Tela de avaliação após o término da chamada
  if (isCallEnded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-400 p-4">
        <div className="bg-dark-300 rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Chamada Finalizada</h2>
          
          <div className="mb-6 text-center">
            <p className="text-gray-300 mb-2">
              {user?.role === 'client' 
                ? `Sessão com ${session.technicianName}`
                : `Sessão com ${session.clientName}`}
            </p>
            <p className="text-gray-400">
              {session.specialtyName}
            </p>
            {session.duration && (
              <p className="text-gray-400 mt-2">
                Duração: {Math.floor(session.duration / 60)} minutos
              </p>
            )}
          </div>
          
          {user?.role === 'client' && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Como foi sua experiência?</h3>
              
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="mx-1 focus:outline-none"
                    onClick={() => setRating(star)}
                  >
                    <svg 
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-500' : 'text-gray-600'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              
              <textarea
                className="input mb-4"
                rows={4}
                placeholder="Deixe um comentário sobre sua experiência..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              ></textarea>
              
              <button
                className="btn btn-primary w-full"
                onClick={submitFeedback}
                disabled={rating === 0 || submittingFeedback}
              >
                {submittingFeedback ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar Avaliação'
                )}
              </button>
            </div>
          )}
          
          <button 
            className="btn btn-outline w-full mt-4"
            onClick={() => navigate('/app/dashboard')}
          >
            Voltar para o Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Tela da chamada de vídeo
  return (
    <div className="flex flex-col h-screen bg-dark-900">
      {/* Cabeçalho */}
      <div className="bg-dark-300 p-4 flex justify-between items-center">
        <div>
          <h1 className="font-semibold">
            {user?.role === 'client' 
              ? `Sessão com ${session.technicianName}`
              : `Sessão com ${session.clientName}`}
          </h1>
          <p className="text-gray-400 text-sm">{session.specialtyName}</p>
        </div>
        
        <div className="flex items-center">
          {isRecording && (
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-red-400 text-sm">REC</span>
            </div>
          )}
          
          <div className="bg-dark-200 px-3 py-1 rounded-full">
            <span className="font-mono">{formatElapsedTime(elapsedTime)}</span>
          </div>
        </div>
      </div>
      
      {/* Área de vídeo */}
      <div className="flex-grow relative bg-dark-900">
        {/* Vídeo remoto (tela principal) */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        ></video>
        
        {/* Vídeo local (miniatura) */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-xs">
          <video
            ref={localVideoRef}
            className="w-full rounded-lg border-2 border-dark-300 shadow-lg"
            autoPlay
            playsInline
            muted
          ></video>
        </div>
      </div>
      
      {/* Controles */}
      <div className="bg-dark-300 p-4 flex justify-center">
        <div className="flex space-x-4">
          <button
            className={`p-3 rounded-full ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-dark-200 hover:bg-dark-100'}`}
            onClick={toggleMute}
          >
            {isMuted ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
          
          <button
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-dark-200 hover:bg-dark-100'}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          
          <button
            className={`p-3 rounded-full ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-dark-200 hover:bg-dark-100'}`}
            onClick={toggleScreenShare}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button
            className="p-3 rounded-full bg-red-600 hover:bg-red-700"
            onClick={endCall}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
