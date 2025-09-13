import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff,
  Phone,
  MessageCircle,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Users,
  Clock,
  AlertCircle,
  Loader,
  ArrowLeft,
  User,
  X,
  PhoneOff
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';
import io, { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface VideoCallStats {
  duration: number;
  quality: 'excellent' | 'good' | 'poor';
  participants: number;
}

interface Participant {
  id: string;
  name: string;
  role: 'client' | 'technician';
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
}

interface SessionData {
  _id: string;
  title: string;
  description: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
  };
  technicianId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  scheduledDate: string;
  scheduledTime: string;
}

const VideoCallPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados principais
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Estados de mídia
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Estados da interface
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Estados do chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Estados da sessão
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [callStats, setCallStats] = useState<VideoCallStats>({
    duration: 0,
    quality: 'good',
    participants: 0
  });

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Configuração WebRTC
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // ==================== INICIALIZAÇÃO ====================

  useEffect(() => {
    if (!sessionId || !user) {
      navigate('/app/sessions');
      return;
    }

    initializeVideoCall();
    
    return () => {
      cleanup();
    };
  }, [sessionId, user]);

  const initializeVideoCall = async () => {
    try {
      console.log('🎥 Inicializando videochamada para sessão:', sessionId);
      
      // 1. Carregar dados da sessão
      await loadSessionData();
      
      // 2. Conectar ao socket
      await connectSocket();
      
      // 3. Inicializar mídia local
      await initializeLocalMedia();
      
      // 4. Configurar WebRTC
      setupWebRTC();
      
      setIsConnecting(false);
      
    } catch (error: any) {
      console.error('❌ Erro ao inicializar videochamada:', error);
      setConnectionError(error.message || 'Erro ao conectar à videochamada');
      setIsConnecting(false);
    }
  };

  const loadSessionData = async () => {
    try {
      const response = await api.get(`/api/sessions/${sessionId}`);
      
      if (response.data.success) {
        const session = response.data.data;
        setSessionData(session);
        
        // Verificar se o usuário tem permissão para esta sessão
        const isParticipant = session.clientId._id === user?.id || session.technicianId._id === user?.id;
        
        if (!isParticipant) {
          throw new Error('Você não tem permissão para acessar esta videochamada');
        }
        
        // Verificar se a sessão está em andamento
        if (session.status !== 'IN_PROGRESS') {
          throw new Error('Esta sessão não está em andamento');
        }
        
        console.log('✅ Dados da sessão carregados:', session);
        
      } else {
        throw new Error('Sessão não encontrada');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar sessão:', error);
      throw error;
    }
  };

  const connectSocket = async () => {
    try {
      // Conectar ao socket do backend
      const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token'),
          sessionId: sessionId,
          userId: user?.id
        }
      });

      socketRef.current = socket;

      // Eventos do socket
      socket.on('connect', () => {
        console.log('✅ Socket conectado');
        socket.emit('join-session', { sessionId, userId: user?.id });
      });

      socket.on('user-joined', (data) => {
        console.log('👤 Usuário entrou na sessão:', data);
        addSystemMessage(`${data.userName} entrou na videochamada`);
        updateParticipants(data.participants);
      });

      socket.on('user-left', (data) => {
        console.log('👋 Usuário saiu da sessão:', data);
        addSystemMessage(`${data.userName} saiu da videochamada`);
        updateParticipants(data.participants);
      });

      socket.on('offer', async (data) => {
        console.log('📞 Recebendo offer:', data);
        await handleOffer(data);
      });

      socket.on('answer', async (data) => {
        console.log('✅ Recebendo answer:', data);
        await handleAnswer(data);
      });

      socket.on('ice-candidate', async (data) => {
        console.log('🧊 Recebendo ICE candidate:', data);
        await handleIceCandidate(data);
      });

      socket.on('chat-message', (data) => {
        console.log('💬 Nova mensagem:', data);
        addChatMessage(data);
      });

      socket.on('media-state-changed', (data) => {
        console.log('🎛️ Estado de mídia alterado:', data);
        updateParticipantMediaState(data);
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket desconectado');
        setIsConnected(false);
      });

      socket.on('error', (error) => {
        console.error('❌ Erro no socket:', error);
        toast.error('Erro de conexão: ' + error.message);
      });

    } catch (error: any) {
      console.error('❌ Erro ao conectar socket:', error);
      throw error;
    }
  };

  const initializeLocalMedia = async () => {
    try {
      console.log('🎥 Inicializando mídia local...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Mídia local inicializada');
      
    } catch (error: any) {
      console.error('❌ Erro ao acessar mídia:', error);
      
      if (error.name === 'NotAllowedError') {
        throw new Error('Permissão negada para acessar câmera/microfone');
      } else if (error.name === 'NotFoundError') {
        throw new Error('Câmera ou microfone não encontrados');
      } else {
        throw new Error('Erro ao acessar mídia: ' + error.message);
      }
    }
  };

  const setupWebRTC = () => {
    try {
      console.log('🔗 Configurando WebRTC...');
      
      const peerConnection = new RTCPeerConnection(rtcConfiguration);
      peerConnectionRef.current = peerConnection;

      // Adicionar stream local
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStreamRef.current!);
        });
      }

      // Eventos do peer connection
      peerConnection.ontrack = (event) => {
        console.log('🎵 Recebendo stream remoto:', event);
        
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        
        setIsConnected(true);
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log('🧊 Enviando ICE candidate');
          socketRef.current.emit('ice-candidate', {
            sessionId,
            candidate: event.candidate
          });
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Estado da conexão:', peerConnection.connectionState);
        
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
          toast.success('Conectado à videochamada!');
        } else if (peerConnection.connectionState === 'disconnected') {
          setIsConnected(false);
          toast.warning('Conexão perdida');
        } else if (peerConnection.connectionState === 'failed') {
          setIsConnected(false);
          toast.error('Falha na conexão');
        }
      };

      console.log('✅ WebRTC configurado');
      
    } catch (error: any) {
      console.error('❌ Erro ao configurar WebRTC:', error);
      throw error;
    }
  };

  // ==================== HANDLERS WEBRTC ====================

  const handleOffer = async (data: any) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('answer', {
          sessionId,
          answer: answer
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar offer:', error);
    }
  };

  const handleAnswer = async (data: any) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
      console.error('❌ Erro ao processar answer:', error);
    }
  };

  const handleIceCandidate = async (data: any) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error('❌ Erro ao processar ICE candidate:', error);
    }
  };

  // ==================== CONTROLES DE MÍDIA ====================

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Notificar outros participantes
        if (socketRef.current) {
          socketRef.current.emit('media-state-changed', {
            sessionId,
            userId: user?.id,
            isVideoEnabled: videoTrack.enabled,
            isAudioEnabled: isAudioEnabled
          });
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Notificar outros participantes
        if (socketRef.current) {
          socketRef.current.emit('media-state-changed', {
            sessionId,
            userId: user?.id,
            isVideoEnabled: isVideoEnabled,
            isAudioEnabled: audioTrack.enabled
          });
        }
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Iniciar compartilhamento de tela
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const peerConnection = peerConnectionRef.current;
        if (peerConnection && localStreamRef.current) {
          // Substituir track de vídeo
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
          
          // Atualizar stream local
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          localStreamRef.current.removeTrack(oldVideoTrack);
          localStreamRef.current.addTrack(videoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          
          setIsScreenSharing(true);
          
          // Quando parar o compartilhamento
          videoTrack.onended = () => {
            stopScreenShare();
          };
        }
      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('❌ Erro no compartilhamento de tela:', error);
      toast.error('Erro ao compartilhar tela');
    }
  };

  const stopScreenShare = async () => {
    try {
      // Voltar para câmera
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = videoStream.getVideoTracks()[0];
      
      const peerConnection = peerConnectionRef.current;
      if (peerConnection && localStreamRef.current) {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        // Atualizar stream local
        const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(oldVideoTrack);
        localStreamRef.current.addTrack(videoTrack);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('❌ Erro ao parar compartilhamento:', error);
    }
  };

  // ==================== CHAT ====================

  const addChatMessage = (messageData: any) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      message: messageData.message,
      timestamp: new Date(messageData.timestamp),
      type: 'text'
    };
    
    setMessages(prev => [...prev, message]);
    
    if (!showChat) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Scroll para baixo
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'system',
      senderName: 'Sistema',
      message,
      timestamp: new Date(),
      type: 'system'
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;
    
    const messageData = {
      sessionId,
      senderId: user?.id,
      senderName: user?.name,
      message: newMessage.trim(),
      timestamp: new Date()
    };
    
    socketRef.current.emit('chat-message', messageData);
    setNewMessage('');
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      setUnreadCount(0);
    }
  };

  // ==================== UTILITÁRIOS ====================

  const updateParticipants = (participantsData: any[]) => {
    setParticipants(participantsData);
    setCallStats(prev => ({
      ...prev,
      participants: participantsData.length
    }));
  };

  const updateParticipantMediaState = (data: any) => {
    setParticipants(prev => prev.map(p => 
      p.id === data.userId 
        ? { ...p, isVideoEnabled: data.isVideoEnabled, isAudioEnabled: data.isAudioEnabled }
        : p
    ));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = async () => {
    try {
      // Notificar o backend que a chamada terminou
      if (socketRef.current) {
        socketRef.current.emit('leave-session', { sessionId, userId: user?.id });
      }
      
      cleanup();
      navigate(`/app/sessions/${sessionId}`);
      
    } catch (error) {
      console.error('❌ Erro ao encerrar chamada:', error);
      navigate(`/app/sessions/${sessionId}`);
    }
  };

  const cleanup = () => {
    // Parar streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Fechar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Desconectar socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    // Limpar timeouts
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  // ==================== TIMER DOS CONTROLES ====================

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isConnected) {
      interval = setInterval(() => {
        setCallStats(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showChat && !showSettings) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleKeyPress = () => resetControlsTimeout();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);
    
    resetControlsTimeout();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showChat, showSettings]);

  // ==================== RENDER ====================

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Conectando à videochamada...</h2>
          <p className="text-gray-400">Aguarde enquanto configuramos tudo para você</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Erro na Conexão</h2>
          <p className="text-gray-400 mb-6">{connectionError}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate('/app/sessions')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Vídeos */}
      <div className="relative w-full h-full">
        {/* Vídeo remoto (principal) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Vídeo local (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Informações da sessão */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-white">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatDuration(callStats.duration)}</span>
          </div>
          {sessionData && (
            <div className="text-sm text-gray-300 mt-1">
              {sessionData.title}
            </div>
          )}
        </div>

        {/* Status de conexão */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500'
              : 'bg-yellow-500 bg-opacity-20 text-yellow-300 border border-yellow-500'
          }`}>
            {isConnected ? 'Conectado' : 'Conectando...'}
          </div>
        </div>

        {/* Controles */}
        {showControls && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-black bg-opacity-70 rounded-full px-6 py-3 flex items-center space-x-4">
              {/* Toggle Áudio */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Toggle Vídeo */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              {/* Compartilhar Tela */}
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              </button>

              {/* Chat */}
              <button
                onClick={toggleChat}
                className="relative p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Encerrar Chamada */}
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Chat */}
        {showChat && (
          <div className="absolute right-4 top-20 bottom-20 w-80 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
            {/* Header do Chat */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-medium">Chat</h3>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensagens */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${
                    message.type === 'system' 
                      ? 'text-center text-gray-400 text-sm'
                      : message.senderId === user?.id
                        ? 'text-right'
                        : 'text-left'
                  }`}
                >
                  {message.type === 'text' && (
                    <div className={`inline-block max-w-xs p-2 rounded-lg ${
                      message.senderId === user?.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 text-white'
                    }`}>
                      <div className="text-xs opacity-75 mb-1">
                        {message.senderName}
                      </div>
                      <div>{message.message}</div>
                    </div>
                  )}
                  {message.type === 'system' && (
                    <div>{message.message}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;
