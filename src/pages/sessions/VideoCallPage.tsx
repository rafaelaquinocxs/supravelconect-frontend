import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  User,
  Clock,
  AlertCircle,
  Loader,
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import io, { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system';
}

interface Participant {
  userId: string;
  name: string;
  role: 'requester' | 'helper';
  joinedAt: Date;
}

interface VideoCallSession {
  sessionId: string;
  status: 'waiting' | 'connecting' | 'active' | 'ended';
  participants: {
    requester: {
      userId: string;
      name: string;
      email: string;
    };
    helper: {
      userId: string;
      name: string;
      email: string;
    };
  };
  appointment: {
    title: string;
    description: string;
    scheduledTime: string;
  };
  chatMessages: ChatMessage[];
}

const VideoCallPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Refs para elementos de vídeo
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Estados da videochamada
  const [session, setSession] = useState<VideoCallSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  // Estados de controles
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Estados da interface
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Configuração WebRTC
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  // Inicializar videochamada
  useEffect(() => {
    if (!sessionId || !user) return;

    initializeVideoCall();

    return () => {
      cleanup();
    };
  }, [sessionId, user]);

  // Timer da chamada
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (startTime && connectionStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration(Date.now() - startTime.getTime());
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, connectionStatus]);

  const initializeVideoCall = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Carregar dados da sessão
      await loadSessionData();

      // 2. Conectar ao Socket.IO
      await connectSocket();

      // 3. Inicializar mídia local
      await initializeLocalMedia();

      // 4. Configurar WebRTC
      setupWebRTC();

      // 5. Entrar na sala
      joinVideoCallRoom();

    } catch (error: any) {
      console.error('❌ Erro ao inicializar videochamada:', error);
      setError(error.message || 'Erro ao conectar à videochamada');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionData = async () => {
    try {
      const response = await api.get(`/api/videocall/session/${sessionId}`);
      
      if (response.data.success) {
        const sessionData = response.data.data.videoCall;
        setSession(sessionData);
        setChatMessages(sessionData.chatMessages || []);
      } else {
        throw new Error(response.data.message || 'Sessão não encontrada');
      }
    } catch (error: any) {
      // Fallback para dados mock se API não estiver disponível
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        console.log('🔄 API indisponível, carregando dados de exemplo...');
        setSession({
          sessionId: sessionId!,
          status: 'waiting',
          participants: {
            requester: {
              userId: 'user_001',
              name: 'João Silva',
              email: 'joao@empresa.com'
            },
            helper: {
              userId: 'user_002',
              name: 'Maria Santos',
              email: 'maria@tecnico.com'
            }
          },
          appointment: {
            title: 'Problema com Empilhadeira Elétrica',
            description: 'Empilhadeira não está carregando corretamente',
            scheduledTime: new Date().toISOString()
          },
          chatMessages: []
        });
        setChatMessages([]);
      } else {
        throw error;
      }
    }
  };

  const connectSocket = async () => {
    return new Promise<void>((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        socketRef.current = io(socketUrl, {
          auth: { token },
          transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
          console.log('✅ Socket conectado');
          setConnectionStatus('connected');
          resolve();
        });

        socket.on('connect_error', (error) => {
          console.error('❌ Erro de conexão Socket:', error);
          // Continuar mesmo sem Socket (modo offline)
          resolve();
        });

        socket.on('videocall-joined', (data) => {
          console.log('📹 Entrou na videochamada:', data);
          setParticipants(data.participants || []);
        });

        socket.on('participant-joined', (data) => {
          console.log('👤 Participante entrou:', data);
          addSystemMessage(`${data.userName} entrou na videochamada`);
        });

        socket.on('participant-left', (data) => {
          console.log('👤 Participante saiu:', data);
          addSystemMessage(`${data.userName} saiu da videochamada`);
        });

        socket.on('videocall-ready', () => {
          console.log('🚀 Videochamada pronta para iniciar');
          setStartTime(new Date());
        });

        socket.on('chat-message', (message: ChatMessage) => {
          setChatMessages(prev => [...prev, message]);
        });

        socket.on('webrtc-offer', handleWebRTCOffer);
        socket.on('webrtc-answer', handleWebRTCAnswer);
        socket.on('webrtc-ice-candidate', handleWebRTCIceCandidate);

        socket.on('error', (error) => {
          console.error('❌ Erro do Socket:', error);
          setError(error.message);
        });

        // Timeout para conexão
        setTimeout(() => {
          if (!socket.connected) {
            console.log('⏰ Timeout na conexão Socket, continuando offline...');
            resolve();
          }
        }, 5000);

      } catch (error) {
        console.error('❌ Erro ao conectar Socket:', error);
        resolve(); // Continuar mesmo sem Socket
      }
    });
  };

  const initializeLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Mídia local inicializada');
    } catch (error) {
      console.error('❌ Erro ao acessar mídia:', error);
      throw new Error('Não foi possível acessar câmera/microfone. Verifique as permissões.');
    }
  };

  const setupWebRTC = () => {
    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = peerConnection;

    // Adicionar stream local
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Receber stream remoto
    peerConnection.ontrack = (event) => {
      console.log('📺 Stream remoto recebido');
      remoteStreamRef.current = event.streams[0];
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc-ice-candidate', {
          sessionId,
          candidate: event.candidate,
          targetUserId: getOtherParticipantId()
        });
      }
    };

    // Estado da conexão
    peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Estado da conexão:', peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'connected') {
        setConnectionStatus('connected');
        if (!startTime) setStartTime(new Date());
      } else if (peerConnection.connectionState === 'disconnected' || 
                 peerConnection.connectionState === 'failed') {
        setConnectionStatus('disconnected');
      }
    };
  };

  const joinVideoCallRoom = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-videocall', { sessionId });
    } else {
      // Modo offline - simular entrada
      console.log('📹 Entrando em modo offline');
      setConnectionStatus('connected');
      setStartTime(new Date());
    }
  };

  const handleWebRTCOffer = async (data: { offer: RTCSessionDescriptionInit; fromUserId: string }) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(data.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('webrtc-answer', {
          sessionId,
          answer,
          targetUserId: data.fromUserId
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar offer:', error);
    }
  };

  const handleWebRTCAnswer = async (data: { answer: RTCSessionDescriptionInit }) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(data.answer);
    } catch (error) {
      console.error('❌ Erro ao processar answer:', error);
    }
  };

  const handleWebRTCIceCandidate = async (data: { candidate: RTCIceCandidateInit }) => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      await peerConnection.addIceCandidate(data.candidate);
    } catch (error) {
      console.error('❌ Erro ao adicionar ICE candidate:', error);
    }
  };

  const createOffer = async () => {
    try {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('webrtc-offer', {
          sessionId,
          offer,
          targetUserId: getOtherParticipantId()
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar offer:', error);
    }
  };

  const getOtherParticipantId = () => {
    if (!session || !user) return '';
    
    const isRequester = session.participants.requester.userId === user.id;
    return isRequester ? session.participants.helper.userId : session.participants.requester.userId;
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
    setChatMessages(prev => [...prev, systemMessage]);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        
        if (socketRef.current) {
          socketRef.current.emit('media-control', {
            sessionId,
            type: 'video',
            enabled: !isVideoEnabled
          });
        }
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        
        if (socketRef.current) {
          socketRef.current.emit('media-control', {
            sessionId,
            type: 'audio',
            enabled: !isAudioEnabled
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

        // Substituir track de vídeo
        const peerConnection = peerConnectionRef.current;
        if (peerConnection) {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }

        // Atualizar vídeo local
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);

        // Detectar quando usuário para o compartilhamento
        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };

      } else {
        stopScreenShare();
      }
    } catch (error) {
      console.error('❌ Erro no compartilhamento de tela:', error);
    }
  };

  const stopScreenShare = async () => {
    try {
      // Voltar para câmera
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });

      // Substituir track de vídeo
      const peerConnection = peerConnectionRef.current;
      if (peerConnection) {
        const sender = peerConnection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoStream.getVideoTracks()[0]);
        }
      }

      // Atualizar vídeo local
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = videoStream;
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error('❌ Erro ao parar compartilhamento:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    // Adicionar localmente
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');

    // Enviar via Socket
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat-message', {
        sessionId,
        message: newMessage.trim()
      });
    }

    // Tentar salvar via API
    try {
      await api.post(`/api/videocall/chat/${sessionId}`, {
        message: newMessage.trim()
      });
    } catch (error) {
      console.log('Chat salvo apenas localmente (API indisponível)');
    }
  };

  const endCall = async () => {
    if (!confirm('Tem certeza que deseja encerrar a videochamada?')) return;

    try {
      // Notificar via Socket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('leave-videocall', { sessionId });
      }

      // Notificar via API
      try {
        await api.post(`/api/videocall/leave/${sessionId}`);
      } catch (error) {
        console.log('Encerramento registrado apenas localmente');
      }

      // Cleanup e navegação
      cleanup();
      navigate('/app/sessions');

    } catch (error) {
      console.error('❌ Erro ao encerrar chamada:', error);
      // Encerrar mesmo com erro
      cleanup();
      navigate('/app/sessions');
    }
  };

  const cleanup = () => {
    // Parar streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
    }

    // Fechar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Desconectar socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Conectando à videochamada...</p>
          <p className="text-gray-400 text-sm mt-2">Verificando permissões de câmera e microfone</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-white text-xl font-semibold mb-2">Erro na Videochamada</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate('/app/sessions')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/sessions')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div>
              <h1 className="text-white font-semibold">
                {session?.appointment.title || 'Videochamada'}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDuration(callDuration)}
                </span>
                <span className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  {connectionStatus === 'connected' ? 'Conectado' : 
                   connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-lg transition-colors ${
                showChat ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-lg transition-colors ${
                showSettings ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Área principal de vídeo */}
      <div className="relative w-full h-full">
        
        {/* Vídeo remoto (tela cheia) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
        />

        {/* Placeholder se não há vídeo remoto */}
        {!remoteStreamRef.current && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-white text-lg">Aguardando outro participante...</p>
              <p className="text-gray-400 text-sm mt-2">A videochamada iniciará quando ambos estiverem conectados</p>
            </div>
          </div>
        )}

        {/* Vídeo local (picture-in-picture) */}
        <div className="absolute top-20 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
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
      </div>

      {/* Controles */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center space-x-4">
          
          {/* Controle de vídeo */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-200 ${
              isVideoEnabled 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Controle de áudio */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all duration-200 ${
              isAudioEnabled 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Compartilhamento de tela */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 ${
              isScreenSharing 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isScreenSharing ? (
              <MonitorOff className="w-6 h-6 text-white" />
            ) : (
              <Monitor className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Controle de som remoto */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all duration-200 ${
              isMuted 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Encerrar chamada */}
          <button
            onClick={endCall}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-200"
          >
            <Phone className="w-6 h-6 text-white transform rotate-135" />
          </button>
        </div>
      </div>

      {/* Chat lateral */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-gray-900/95 backdrop-blur border-l border-gray-700 z-40">
          <div className="flex flex-col h-full">
            
            {/* Header do chat */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`${
                    message.type === 'system' 
                      ? 'text-center' 
                      : message.senderId === user?.id 
                        ? 'text-right' 
                        : 'text-left'
                  }`}
                >
                  {message.type === 'system' ? (
                    <p className="text-xs text-gray-400 italic">
                      {message.message}
                    </p>
                  ) : (
                    <div className={`inline-block max-w-xs ${
                      message.senderId === user?.id
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-white'
                    } rounded-lg px-3 py-2`}>
                      <p className="text-xs text-gray-300 mb-1">
                        {message.senderName}
                      </p>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-400 text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;