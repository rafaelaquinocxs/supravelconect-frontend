// 🎥 VideoCall.tsx - VERSÃO TYPESCRIPT CORRIGIDA
// Copie este arquivo para: src/components/VideoCall.tsx

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// 📋 INTERFACES E TIPOS
interface VideoCallProps {
  sessionId: string;
  userId: string;
  userName: string;
  userRole: string;
  onCallEnd: () => void;
}

interface User {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
}

interface Message {
  sessionId: string;
  message: string;
  userName: string;
  timestamp: string;
  socketId: string;
}

interface WebRTCOfferData {
  offer: RTCSessionDescriptionInit;
  from: string;
}

interface WebRTCAnswerData {
  answer: RTCSessionDescriptionInit;
  from: string;
}

interface WebRTCIceCandidateData {
  candidate: RTCIceCandidate;
  from: string;
}

type CallStatus = 'connecting' | 'ready' | 'calling' | 'incoming' | 'active' | 'rejected' | 'ended';

const VideoCall: React.FC<VideoCallProps> = ({ 
  sessionId, 
  userId, 
  userName, 
  userRole,
  onCallEnd 
}) => {
  // Estados principais
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('connecting');
  
  // Estados de controle
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Estados de UI
  const [showChat, setShowChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [participants, setParticipants] = useState<User[]>([]);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ícones SVG
  const Icons = {
    Video: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    VideoOff: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2.586-2.586A2 2 0 0121 7v10a2 2 0 01-2.828 1.828L16 16M14 14l-6-6M8 8H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3" />
      </svg>
    ),
    Mic: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    MicOff: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 5.586A2 2 0 015 7v6a7 7 0 0014 0v-1m-9.5-5.5L19 19M12 3a3 3 0 013 3v6m-3 7v4m0 0H8m4 0h4" />
      </svg>
    ),
    Phone: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    PhoneOff: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2.586-2.586A2 2 0 0121 7v10a2 2 0 01-2.828 1.828L16 16M14 14l-6-6M8 8H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3" />
      </svg>
    ),
    Monitor: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    MessageCircle: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    Users: () => (
      <svg className="w-16 h-16 mx-auto mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    Maximize: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    Minimize: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    X: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };

  // Configuração WebRTC
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Inicializar Socket.IO
  useEffect(() => {
    // 🎯 CONECTAR NA PORTA 5000 (seu backend)
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://seu-dominio.com' 
      : 'http://localhost:5000'; // ← PORTA 5000

    console.log('🔗 Conectando ao servidor:', backendUrl);

    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔗 Conectado ao servidor Socket.IO');
      setIsConnected(true);
      
      newSocket.emit('register-user', {
        userId,
        name: userName,
        role: userRole
      });
      
      newSocket.emit('join-session', {
        sessionId,
        userId,
        userName,
        userRole
      });
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('❌ Erro de conexão Socket.IO:', error);
      setIsConnected(false);
    });

    // Eventos de sessão
    newSocket.on('session-participants', (participantsList: User[]) => {
      console.log('👥 Participantes atualizados:', participantsList);
      setParticipants(participantsList);
    });

    newSocket.on('session-ready', (data: { message: string; participants: number }) => {
      console.log('✅ Sessão pronta:', data.message);
      setCallStatus('ready');
    });

    newSocket.on('user-joined', (userData: User) => {
      console.log(`👤 ${userData.userName} entrou na sessão`);
      setParticipants(prev => [...prev, userData]);
    });

    newSocket.on('user-left', (data: { userId: string; userName: string }) => {
      console.log('👋 Usuário saiu da sessão');
      setParticipants(prev => prev.filter(p => p.socketId !== data.userId));
    });

    // Eventos de chamada
    newSocket.on('incoming-call', (data: { from: User; sessionId: string }) => {
      console.log('📞 Chamada recebida de:', data.from.userName);
      setCallStatus('incoming');
    });

    newSocket.on('call-accepted', () => {
      console.log('✅ Chamada aceita');
      setCallStatus('active');
    });

    newSocket.on('call-rejected', () => {
      console.log('❌ Chamada rejeitada');
      setCallStatus('rejected');
    });

    newSocket.on('call-ended', () => {
      console.log('📴 Chamada finalizada');
      setCallStatus('ended');
      cleanupCall();
    });

    // Eventos WebRTC
    newSocket.on('webrtc-offer', async (data: WebRTCOfferData) => {
      console.log('📨 Oferta WebRTC recebida');
      await handleWebRTCOffer(data.offer);
    });

    newSocket.on('webrtc-answer', async (data: WebRTCAnswerData) => {
      console.log('📨 Resposta WebRTC recebida');
      if (peerConnection) {
        await peerConnection.setRemoteDescription(data.answer);
      }
    });

    newSocket.on('webrtc-ice-candidate', async (data: WebRTCIceCandidateData) => {
      console.log('🧊 ICE candidate recebido');
      if (peerConnection && data.candidate) {
        await peerConnection.addIceCandidate(data.candidate);
      }
    });

    // Eventos de chat
    newSocket.on('new-message', (data: Message) => {
      console.log('💬 Nova mensagem:', data);
      setMessages(prev => [...prev, data]);
      scrollChatToBottom();
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Desconectando Socket.IO');
      newSocket.disconnect();
      cleanupCall();
    };
  }, [sessionId, userId, userName, userRole]);

  // Inicializar mídia local
  useEffect(() => {
    const initializeMedia = async (): Promise<void> => {
      try {
        console.log('🎥 Solicitando acesso à câmera e microfone...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        console.log('✅ Mídia local obtida');
        setStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error('❌ Erro ao acessar mídia:', error);
        alert('Erro ao acessar câmera/microfone. Verifique as permissões.');
      }
    };

    initializeMedia();
  }, []);

  // Criar conexão WebRTC
  const createPeerConnection = (): RTCPeerConnection => {
    console.log('🔗 Criando conexão WebRTC...');
    const pc = new RTCPeerConnection(rtcConfiguration);

    // Adicionar stream local
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('➕ Adicionando track:', track.kind);
        pc.addTrack(track, stream);
      });
    }

    // Receber stream remoto
    pc.ontrack = (event: RTCTrackEvent) => {
      console.log('📺 Stream remoto recebido');
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // ICE candidates
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && socket) {
        console.log('🧊 Enviando ICE candidate');
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          sessionId
        });
      }
    };

    // Estado da conexão
    pc.onconnectionstatechange = () => {
      console.log('🔗 Estado da conexão WebRTC:', pc.connectionState);
    };

    setPeerConnection(pc);
    return pc;
  };

  // Funções WebRTC
  const handleWebRTCOffer = async (offer: RTCSessionDescriptionInit): Promise<void> => {
    console.log('📨 Processando oferta WebRTC...');
    const pc = createPeerConnection();
    
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    
    if (socket) {
      console.log('📤 Enviando resposta WebRTC');
      socket.emit('webrtc-answer', {
        answer: answer,
        sessionId
      });
    }
  };

  // Funções de controle
  const startCall = async (): Promise<void> => {
    if (socket && callStatus === 'ready') {
      console.log('📞 Iniciando videochamada...');
      setCallStatus('calling');
      socket.emit('start-video-call', sessionId);
      
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('📤 Enviando oferta WebRTC');
      socket.emit('webrtc-offer', {
        offer: offer,
        sessionId
      });
    }
  };

  const acceptCall = (): void => {
    if (socket) {
      console.log('✅ Aceitando chamada...');
      socket.emit('accept-call', sessionId);
      setCallStatus('active');
    }
  };

  const rejectCall = (): void => {
    if (socket) {
      console.log('❌ Rejeitando chamada...');
      socket.emit('reject-call', sessionId);
      setCallStatus('rejected');
    }
  };

  const endCall = (): void => {
    if (socket) {
      console.log('📴 Finalizando chamada...');
      socket.emit('end-call', sessionId);
    }
    cleanupCall();
    if (onCallEnd) onCallEnd();
  };

  const cleanupCall = (): void => {
    console.log('🧹 Limpando recursos...');
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setRemoteStream(null);
  };

  // Controles de mídia
  const toggleAudio = (): void => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
        
        console.log(`🔊 Áudio ${audioTrack.enabled ? 'ligado' : 'desligado'}`);
        
        if (socket) {
          socket.emit('toggle-audio', {
            sessionId,
            audioEnabled: audioTrack.enabled
          });
        }
      }
    }
  };

  const toggleVideo = (): void => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
        
        console.log(`📹 Vídeo ${videoTrack.enabled ? 'ligado' : 'desligado'}`);
        
        if (socket) {
          socket.emit('toggle-video', {
            sessionId,
            videoEnabled: videoTrack.enabled
          });
        }
      }
    }
  };

  const toggleScreenShare = async (): Promise<void> => {
    try {
      if (!isScreenSharing) {
        console.log('🖥️ Iniciando compartilhamento de tela...');
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (peerConnection) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
          
          videoTrack.onended = () => {
            console.log('🖥️ Compartilhamento de tela finalizado');
            setIsScreenSharing(false);
            // Voltar para câmera
            if (stream && peerConnection) {
              const cameraTrack = stream.getVideoTracks()[0];
              const sender = peerConnection.getSenders().find(s => 
                s.track && s.track.kind === 'video'
              );
              if (sender && cameraTrack) {
                sender.replaceTrack(cameraTrack);
              }
            }
          };
        }
        
        setIsScreenSharing(true);
      } else {
        console.log('🖥️ Parando compartilhamento de tela...');
        if (peerConnection && stream) {
          const videoTrack = stream.getVideoTracks()[0];
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        }
        
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('❌ Erro no compartilhamento de tela:', error);
    }
  };

  // Funções de chat
  const sendMessage = (): void => {
    if (newMessage.trim() && socket) {
      console.log('💬 Enviando mensagem:', newMessage);
      socket.emit('send-message', {
        sessionId,
        message: newMessage.trim(),
        userName
      });
      setNewMessage('');
    }
  };

  const scrollChatToBottom = (): void => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Função de tela cheia
  const toggleFullscreen = (): void => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Renderização condicional baseada no status
  const renderCallStatus = (): JSX.Element => {
    switch (callStatus) {
      case 'connecting':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg">Conectando à sessão...</p>
              <p className="text-sm text-gray-400">Aguarde um momento</p>
              {!isConnected && (
                <p className="text-xs text-red-400 mt-2">
                  Verificando conexão com o servidor...
                </p>
              )}
            </div>
          </div>
        );
      
      case 'ready':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <Icons.Users />
              <p className="text-lg mb-4">Sessão pronta para iniciar</p>
              <p className="text-sm text-gray-400 mb-6">
                Participantes: {participants.length}/2
              </p>
              <div className="space-y-4">
                <button
                  onClick={startCall}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
                >
                  <Icons.Phone />
                  <span className="ml-2">Iniciar Chamada</span>
                </button>
                <button
                  onClick={onCallEnd}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center mx-auto"
                >
                  <Icons.X />
                  <span className="ml-2">Voltar à Sessão</span>
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'calling':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-pulse mb-4">
                <Icons.Phone />
              </div>
              <p className="text-lg">Chamando...</p>
              <p className="text-sm text-gray-400">Aguardando resposta</p>
              <button
                onClick={endCall}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        );
      
      case 'incoming':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <div className="animate-bounce mb-4">
                <Icons.Phone />
              </div>
              <p className="text-lg mb-4">Chamada recebida</p>
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={acceptCall}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center"
                >
                  <Icons.Phone />
                  <span className="ml-2">Aceitar</span>
                </button>
                <button
                  onClick={rejectCall}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg flex items-center"
                >
                  <Icons.PhoneOff />
                  <span className="ml-2">Rejeitar</span>
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'rejected':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <div className="mb-4">
                <Icons.PhoneOff />
              </div>
              <p className="text-lg mb-4">Chamada rejeitada</p>
              <button
                onClick={onCallEnd}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Voltar à Sessão
              </button>
            </div>
          </div>
        );
      
      case 'ended':
        return (
          <div className="flex items-center justify-center h-full bg-gray-900">
            <div className="text-center text-white">
              <div className="mb-4">
                <Icons.PhoneOff />
              </div>
              <p className="text-lg mb-4">Chamada finalizada</p>
              <button
                onClick={onCallEnd}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Voltar à Sessão
              </button>
            </div>
          </div>
        );
      
      default:
        return <div></div>;
    }
  };

  if (callStatus !== 'active') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900">
        {renderCallStatus()}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-gray-900 overflow-hidden">
      {/* Vídeo principal (remoto) */}
      <div className="absolute inset-0">
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <div className="text-center text-white">
              <div className="mb-4">
                <Icons.VideoOff />
              </div>
              <p>Aguardando vídeo do participante...</p>
            </div>
          </div>
        )}
      </div>

      {/* Vídeo local (picture-in-picture) */}
      <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
        {stream && videoEnabled ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-700">
            <Icons.VideoOff />
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Controle de áudio */}
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              audioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-500 hover:bg-red-600'
            } text-white transition-colors`}
            title={audioEnabled ? 'Desligar microfone' : 'Ligar microfone'}
          >
            {audioEnabled ? <Icons.Mic /> : <Icons.MicOff />}
          </button>

          {/* Controle de vídeo */}
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              videoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-red-500 hover:bg-red-600'
            } text-white transition-colors`}
            title={videoEnabled ? 'Desligar câmera' : 'Ligar câmera'}
          >
            {videoEnabled ? <Icons.Video /> : <Icons.VideoOff />}
          </button>

          {/* Compartilhamento de tela */}
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full ${
              isScreenSharing 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            } text-white transition-colors`}
            title={isScreenSharing ? 'Parar compartilhamento' : 'Compartilhar tela'}
          >
            <Icons.Monitor />
          </button>

          {/* Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Abrir chat"
          >
            <Icons.MessageCircle />
          </button>

          {/* Tela cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
          >
            {isFullscreen ? <Icons.Minimize /> : <Icons.Maximize />}
          </button>

          {/* Finalizar chamada */}
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Finalizar chamada"
          >
            <Icons.PhoneOff />
          </button>
        </div>
      </div>

      {/* Chat lateral */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-gray-800/95 backdrop-blur-sm border-l border-gray-700">
          <div className="flex flex-col h-full">
            {/* Header do chat */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Chat da Sessão</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <Icons.X />
                </button>
              </div>
            </div>

            {/* Mensagens */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">
                  <p>Nenhuma mensagem ainda.</p>
                  <p>Comece a conversa!</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <div className="text-gray-400 text-xs mb-1">
                      {msg.userName} • {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-white bg-gray-700 rounded-lg p-2">
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de conexão */}
      <div className="absolute top-4 left-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>

      {/* Informações da sessão */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
          <span>Sessão: {sessionId}</span>
          {participants.length > 0 && (
            <span className="ml-4">Participantes: {participants.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
