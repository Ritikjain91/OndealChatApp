import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  X,
  ArrowDown,
  Check,
  CheckCheck,
  Users,
  PhoneOff,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  LogOut,
  MessageCircle,
  Camera,
  Shuffle,
  UserPlus
} from "lucide-react";
import { io } from "socket.io-client";

const API_URL = "https://ondealchatapp.onrender.com";
const SOCKET_URL = "https://ondealchatapp.onrender.com";

export default function ModernChat() {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Random chat states
  const [isFindingRandom, setIsFindingRandom] = useState(false);
  const [randomChatAvailable, setRandomChatAvailable] = useState(false);
  const [randomMatch, setRandomMatch] = useState(null);
  const [isInRandomChat, setIsInRandomChat] = useState(false);

  // Call states
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callParticipants, setCallParticipants] = useState([]);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [callStatus, setCallStatus] = useState("");
  const [callDuration, setCallDuration] = useState(0);

  const messagesEndRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const callRoomIdRef = useRef(null);
  const callTimerRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
    ]
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Call duration timer
  useEffect(() => {
    if (inCall && callStatus === 'Connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
    };
  }, [inCall, callStatus]);

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // Start random chat
  const startRandomChat = useCallback(() => {
    if (!socketRef.current || !currentUser) return;
    
    setIsFindingRandom(true);
    setRandomMatch(null);
    setIsInRandomChat(true);
    setMessages([]);
    socketRef.current.emit('start-random-chat', {
      userId: currentUser._id,
      username: currentUser.username
    });
  }, [currentUser]);

  // Stop random chat
  const stopRandomChat = useCallback(() => {
    if (!socketRef.current || !currentUser) return;
    
    setIsFindingRandom(false);
    setRandomMatch(null);
    setIsInRandomChat(false);
    setSelectedUser(null);
    setMessages([]);
    socketRef.current.emit('stop-random-chat', {
      userId: currentUser._id
    });
  }, [currentUser]);

  // Auto-start random chat when partner leaves
  const autoReconnectRandomChat = useCallback(() => {
    if (isInRandomChat && currentUser) {
      console.log("Auto-reconnecting to new random chat...");
      setTimeout(() => {
        startRandomChat();
      }, 1000);
    }
  }, [isInRandomChat, currentUser, startRandomChat]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/me`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          initSocket(token, data.user);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      cleanupMediaStreams();
    };
  }, [getToken]);

  const cleanupMediaStreams = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach(pc => {
      try { pc.close(); } catch(e) {}
    });
    peerConnectionsRef.current = {};
    remoteVideosRef.current = {};
    callRoomIdRef.current = null;
  }, []);

  const createPeerConnection = useCallback((userId) => {
    console.log(`Creating peer connection for: ${userId}`);
    
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          pc.addTrack(track, localStreamRef.current);
        } catch (err) {
          console.warn('Error adding track to pc', err);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: userId,
          roomId: callRoomIdRef.current
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteVideosRef.current[userId] = event.streams[0];
        setCallParticipants(prev => [...prev]);
        setCallStatus("Connected");
      }
    };

    pc.onconnectionstatechange = () => {
      const status = pc.connectionState.charAt(0).toUpperCase() + pc.connectionState.slice(1);
      setCallStatus(status);
    };

    peerConnectionsRef.current[userId] = pc;
    return pc;
  }, []);

  const initSocket = useCallback((token, user) => {
    if (socketRef.current) return;
    if (!token) return;

    try {
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        if (user && user._id) {
          socket.emit("register", user._id);
          socket.emit('check-random-chat-availability');
        }
      });
      
      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        if (error && error.message && error.message.includes("auth")) {
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      });

      // Message handling
      socket.on("receiveMessage", (message) => {
        if (selectedUser && message.sender._id === selectedUser._id) {
          const formatted = {
            id: message._id,
            sender: "them",
            name: message.sender.username,
            avatar: message.sender.username.substring(0, 2).toUpperCase(),
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "delivered"
          };
          setMessages(prev => [...prev, formatted]);
        }
      });

      socket.on("messageSent", (payload) => {
        const { tempId, message } = payload || {};
        if (tempId && message) {
          setMessages(prev => prev.map(msg =>
            msg.id === tempId ? {
              ...msg,
              id: message._id,
              status: "delivered",
              time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            } : msg
          ));
        }
      });

      socket.on("onlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("userTyping", ({ userId }) => {
        if (selectedUser && userId === selectedUser._id) setIsTyping(true);
      });
      
      socket.on("userStoppedTyping", ({ userId }) => {
        if (selectedUser && userId === selectedUser._id) setIsTyping(false);
      });

      // Random chat events
      socket.on("random-chat-available", (available) => {
        setRandomChatAvailable(available);
      });

      socket.on("random-match-found", (matchedUser) => {
        setIsFindingRandom(false);
        setRandomMatch(matchedUser);
        setSelectedUser(matchedUser);
        setMessages([]);
        console.log("Random match found:", matchedUser.username);
      });

      socket.on("random-match-left", () => {
        setRandomMatch(null);
        setIsFindingRandom(false);
        setMessages([]);
        
        // Auto-reconnect to new random person
        if (isInRandomChat) {
          alert("Your chat partner has left. Finding someone new...");
          autoReconnectRandomChat();
        }
      });

      socket.on("random-chat-waiting", (data) => {
        console.log("Waiting for random match...", data);
      });

      socket.on("random-chat-error", (data) => {
        setIsFindingRandom(false);
        alert(data.message || "Error finding random chat");
      });

      socket.on("random-chat-stopped", () => {
        setIsFindingRandom(false);
        setRandomMatch(null);
        setIsInRandomChat(false);
      });

      // Call events
      socket.on("incoming-call", ({ from, callType: type, roomId, caller }) => {
        const c = caller || { _id: from, username: "Random User" };
        setIncomingCall({ caller: c, callType: type, roomId });
      });

      socket.on("call-accepted", async ({ from, roomId }) => {
        setCallStatus("Connecting...");
        const userObj = { _id: from, username: 'Random User' };
        if (!callParticipants.find(p => p._id === from)) {
          setCallParticipants(prev => [...prev, userObj]);
        }
        
        const pc = createPeerConnection(from);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          socket.emit('webrtc-offer', {
            offer,
            to: from,
            roomId
          });
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      });

      socket.on("call-rejected", ({ from }) => {
        alert(`User rejected the call`);
        endCall();
      });

      socket.on("call-ended", ({ from }) => {
        alert(`User ended the call`);
        endCall();
      });

      socket.on("webrtc-offer", async ({ offer, from, roomId }) => {
        try {
          const pc = createPeerConnection(from);
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          
          socket.emit('webrtc-answer', {
            answer,
            to: from,
            roomId
          });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });

      socket.on("webrtc-answer", async ({ answer, from }) => {
        const pc = peerConnectionsRef.current[from];
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (error) {
            console.error("Error setting remote description:", error);
          }
        }
      });

      socket.on("ice-candidate", async ({ candidate, from }) => {
        const pc = peerConnectionsRef.current[from];
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      });

    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  }, [currentUser, callParticipants, createPeerConnection, selectedUser, isInRandomChat, autoReconnectRandomChat]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !currentUser) return;
      
      try {
        const token = getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/messages/${selectedUser._id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          credentials: "include"
        });
        
        if (response.ok) {
          const data = await response.json();
          const formattedMessages = data.map(msg => ({
            id: msg._id,
            sender: msg.sender._id === currentUser._id ? "me" : "them",
            name: msg.sender._id === currentUser._id ? "You" : msg.sender.username,
            avatar: msg.sender.username.substring(0, 2).toUpperCase(),
            text: msg.text,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "delivered"
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser, getToken]);

  useEffect(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      if (isNearBottom) {
        listRef.current.scrollTo({ top: scrollHeight, behavior: "smooth" });
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }
  }, [messages]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages;
    return messages.filter((m) =>
      m.text.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [messages, search]);

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text || !selectedUser || !currentUser) return;

    const tempId = 'temp-' + Date.now();
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const tempMessage = {
      id: tempId,
      sender: "me",
      name: "You",
      avatar: currentUser.username.substring(0, 2).toUpperCase(),
      text,
      time: timeString,
      status: "sending"
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageInput("");

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sendMessage', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text,
        tempId
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current.emit('stopTyping', {
        senderId: currentUser._id,
        receiverId: selectedUser._id
      });
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (!selectedUser || !currentUser || !socketRef.current) return;

    socketRef.current.emit('typing', {
      senderId: currentUser._id,
      receiverId: selectedUser._id
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('stopTyping', {
          senderId: currentUser._id,
          receiverId: selectedUser._id
        });
      }
    }, 2000);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearch("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setSelectedUser(null);
    setMessages([]);
    setRandomMatch(null);
    setIsInRandomChat(false);
    setIsFindingRandom(false);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    cleanupMediaStreams();
  };

  const startCall = async (type) => {
    if (!selectedUser || !currentUser) {
      alert("Please start a chat first");
      return;
    }

    try {
      console.log("Starting call...");
      setCallStatus("Starting call...");
      setCallDuration(0);

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        try {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          await localVideoRef.current.play();
        } catch (err) {
          console.warn("Could not autoplay local video:", err);
        }
      }

      const roomId = `call-${currentUser._id}-${Date.now()}`;
      callRoomIdRef.current = roomId;

      setCallType(type);
      setInCall(true);
      setCallParticipants([selectedUser]);
      setCallStatus("Calling...");

      if (socketRef.current) {
        socketRef.current.emit('initiate-call', {
          to: selectedUser._id,
          from: currentUser._id,
          callType: type,
          roomId
        });
      }

    } catch (error) {
      console.error("Error starting call:", error);
      
      if (error.name === 'NotAllowedError') {
        alert("Camera/microphone access was denied. Please check your browser permissions.");
      } else if (error.name === 'NotFoundError') {
        alert("No camera/microphone found. Please check your device connections.");
      } else if (error.name === 'NotReadableError') {
        alert("Camera/microphone is already in use by another application.");
      } else {
        alert("Could not access camera/microphone. Please check permissions and try again.");
      }
      
      setCallStatus("Failed to start call");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("Accepting call...");
      setCallStatus("Accepting call...");
      setCallDuration(0);

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: incomingCall.callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        try {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.muted = true;
          await localVideoRef.current.play();
        } catch (err) {
          console.warn("Could not autoplay local video:", err);
        }
      }

      callRoomIdRef.current = incomingCall.roomId;

      setCallType(incomingCall.callType);
      setInCall(true);
      setCallParticipants([incomingCall.caller]);
      setCallStatus("Connecting...");

      if (socketRef.current) {
        socketRef.current.emit('accept-call', {
          to: incomingCall.caller._id,
          from: currentUser._id,
          roomId: incomingCall.roomId
        });
      }

      setIncomingCall(null);

    } catch (error) {
      console.error("Error accepting call:", error);
      alert("Could not access camera/microphone. Please check permissions.");
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    if (socketRef.current) {
      socketRef.current.emit('reject-call', {
        to: incomingCall.caller._id,
        from: currentUser._id
      });
    }

    setIncomingCall(null);
  };

  const endCall = () => {
    console.log("Ending call...");
    
    if (socketRef.current && callRoomIdRef.current) {
      socketRef.current.emit('end-call', {
        to: callParticipants.map(p => p._id).filter(id => id !== currentUser._id),
        from: currentUser._id
      });
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    cleanupMediaStreams();
    setInCall(false);
    setCallType(null);
    setCallParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setShowChatPanel(false);
    setCallStatus("");
    setCallDuration(0);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newState = !audioTracks[0].enabled;
        audioTracks.forEach(t => t.enabled = newState);
        setIsMuted(!newState);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const newState = !videoTracks[0].enabled;
        videoTracks.forEach(t => t.enabled = newState);
        setIsVideoOff(!newState);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        });
      }

      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: "always" },
          audio: true 
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        
        Object.values(peerConnectionsRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading Chat...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-slate-400 mb-6">Please log in to continue chatting</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all transform hover:scale-105 font-semibold shadow-lg"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // Main random chat interface
  if (!isInRandomChat && !randomMatch) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="text-center max-w-md px-4">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Shuffle className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Random Chat</h2>
          <p className="text-slate-300 mb-2">Chat with random people online</p>
          <p className="text-slate-400 text-sm mb-8">
            {randomChatAvailable 
              ? "Connect instantly with someone new" 
              : "Waiting for more users to come online..."}
          </p>
          
          <button
            onClick={startRandomChat}
            disabled={!randomChatAvailable || isFindingRandom}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 rounded-2xl transition-all transform hover:scale-105 font-semibold text-lg shadow-2xl mb-4"
          >
            {isFindingRandom ? (
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Finding Someone...
              </div>
            ) : (
              "Start Random Chat"
            )}
          </button>
          
          <p className="text-slate-500 text-xs">
            {randomChatAvailable 
              ? `${onlineUsers.length} people online` 
              : "Be the first to join!"}
          </p>
        </div>
      </div>
    );
  }

  // Show loading while finding match
  if (isFindingRandom) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="text-center max-w-md px-4">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-pulse">
            <Shuffle className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Finding Someone...</h2>
          <p className="text-slate-300 mb-2">Looking for a random chat partner</p>
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <button
            onClick={stopRandomChat}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 max-w-md w-full shadow-2xl border border-cyan-500/30">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-8 animate-pulse shadow-2xl">
                {incomingCall.caller.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-3xl font-bold mb-2 text-white">{incomingCall.caller.username}</h3>
              <p className="text-slate-300 mb-3">is calling you</p>
              <div className="flex items-center justify-center space-x-3 mb-8 bg-slate-800/50 rounded-xl py-3 px-4">
                {incomingCall.callType === 'video' ? (
                  <>
                    <Video className="w-5 h-5 text-cyan-400" />
                    <p className="text-cyan-400 font-semibold">Video Call</p>
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5 text-cyan-400" />
                    <p className="text-cyan-400 font-semibold">Audio Call</p>
                  </>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-xl font-semibold"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-xl font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Interface */}
      {inCall && (
        <div className="fixed inset-0 bg-slate-950 z-40 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-8 py-6 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-white text-xl">{selectedUser.username}</h3>
                <div className="flex items-center space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    callStatus === 'Connected' ? 'bg-emerald-400' : 
                    callStatus === 'Connecting' ? 'bg-amber-400 animate-pulse' : 'bg-slate-400'
                  } shadow-lg`}></div>
                  <p className="text-sm text-slate-300">
                    {callType === 'video' ? 'Video call' : 'Audio call'} • {callStatus || 'Connecting...'}
                  </p>
                  {callStatus === 'Connected' && (
                    <span className="ml-4 text-sm font-mono text-cyan-400 bg-slate-800/50 px-3 py-1 rounded-lg">{formatDuration(callDuration)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowChatPanel(!showChatPanel)}
                className={`p-3 rounded-xl transition-all shadow-lg ${
                  showChatPanel 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={endCall}
                className="p-3 text-red-400 hover:bg-red-600/30 hover:text-red-300 rounded-xl transition-all shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Video Content */}
          <div className="flex-1 flex gap-6 p-6 overflow-hidden">
            <div className="flex-1">
              {callType === 'video' ? (
                <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                  {/* Local Video */}
                  <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl">
                    {isVideoOff ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 shadow-lg">
                            <Camera className="w-10 h-10" />
                          </div>
                          <p className="text-white font-semibold">Camera Off</p>
                        </div>
                      </div>
                    ) : (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover bg-slate-900"
                      />
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 rounded-full text-sm backdrop-blur-md border border-slate-700/50 shadow-lg">
                      <span className="font-semibold text-white">You</span>
                      {isMuted && <span className="ml-2 text-red-400">🔇</span>}
                    </div>
                  </div>

                  {/* Remote Videos */}
                  {callParticipants.map(participant => (
                    <div key={participant._id} className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden border-2 border-slate-700 hover:border-cyan-500/50 transition-all shadow-2xl group">
                      {remoteVideosRef.current[participant._id] ? (
                        <video
                          ref={(el) => {
                            if (!el) return;
                            const s = remoteVideosRef.current[participant._id];
                            if (s && el.srcObject !== s) {
                              try {
                                el.srcObject = s;
                                el.play().catch(() => {});
                              } catch (err) {
                                console.error('Error attaching remote stream to element', err);
                              }
                            }
                          }}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover bg-slate-900"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg animate-pulse">
                              {participant.username.substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-white font-semibold">{participant.username}</p>
                            <p className="text-slate-400 text-sm mt-2">Connecting...</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-black/80 px-4 py-2 rounded-full text-sm backdrop-blur-md border border-slate-700/50 shadow-lg">
                        <span className="font-semibold text-white">{participant.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-12">
                    {/* Local Audio Avatar */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-36 h-36 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-5xl mb-8 shadow-2xl">
                        {currentUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-2xl font-bold mb-3">You</p>
                      <div className="flex items-center justify-center space-x-3 bg-slate-800/50 rounded-xl px-4 py-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${isMuted ? 'bg-red-500' : 'bg-emerald-400'}`}></div>
                        <p className="text-slate-300">{isMuted ? 'Muted' : 'Speaking'}</p>
                      </div>
                    </div>

                    {/* Remote Audio Avatar(s) */}
                    {callParticipants.map(participant => (
                      <div key={participant._id} className="flex flex-col items-center justify-center text-center">
                        <div className="w-36 h-36 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-5xl mb-8 shadow-2xl animate-pulse">
                          {participant.username.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-2xl font-bold mb-3">{participant.username}</p>
                        <div className="flex items-center justify-center space-x-2 text-emerald-400">
                          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                          <p className="text-slate-300">Connected</p>
                        </div>

                        {/* Hidden/visible element to play audio if remote stream is present */}
                        {remoteVideosRef.current[participant._id] && (
                          <audio
                            ref={(el) => {
                              if (!el) return;
                              const s = remoteVideosRef.current[participant._id];
                              if (s && el.srcObject !== s) {
                                el.srcObject = s;
                                el.play().catch(() => {});
                              }
                            }}
                            autoPlay
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Panel */}
            {showChatPanel && (
              <div className="w-80 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col shadow-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                  <h3 className="font-bold text-white">Chat</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.slice(-20).map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-xl text-sm ${
                        msg.sender === 'me'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                          : 'bg-slate-800 text-slate-100'
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageInput.trim()}
                    className="p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 rounded-lg transition-all"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-8 shadow-2xl">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-2xl transition-all transform hover:scale-110 shadow-xl ${
                  isMuted
                    ? 'bg-gradient-to-br from-red-600 to-red-700 text-white'
                    : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
                }`}
                title="Toggle Mute"
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-2xl transition-all transform hover:scale-110 shadow-xl ${
                    isVideoOff
                      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
                  }`}
                  title="Toggle Video"
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}

              {callType === 'video' && (
                <button
                  onClick={toggleScreenShare}
                  className={`p-4 rounded-2xl transition-all transform hover:scale-110 shadow-xl ${
                    isScreenSharing
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                      : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700'
                  }`}
                  title="Toggle Screen Share"
                >
                  {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                </button>
              )}

              <button
                onClick={endCall}
                className="p-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-2xl transition-all transform hover:scale-110 shadow-xl"
                title="End Call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center space-x-6 flex-1 min-w-0">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ${
                  randomMatch 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                }`}>
                  {selectedUser?.username.substring(0, 2).toUpperCase()}
                </div>
                {randomMatch && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 border-2 border-slate-900 rounded-full shadow-lg"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-white truncate">
                    {selectedUser?.username}
                    {randomMatch && (
                      <span className="ml-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                        Random Chat
                      </span>
                    )}
                  </h2>
                </div>
                <div className="flex items-center space-x-3">
                  {randomMatch && (
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full shadow-lg"></div>
                  )}
                  <p className="text-sm text-slate-300">
                    {isTyping ? (
                      <span className="text-cyan-400 font-semibold">typing...</span>
                    ) : randomMatch ? (
                      <span className="text-purple-400">connected</span>
                    ) : (
                      <span className="text-slate-400">offline</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {showSearch && (
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-80 px-5 py-3 pl-12 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm backdrop-blur-sm shadow-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                {!showSearch && randomMatch && (
                  <>
                    <button 
                      onClick={() => startCall('audio')}
                      className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all shadow-lg"
                      title="Audio call"
                    >
                      <Phone className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => startCall('video')}
                      className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-all shadow-lg"
                      title="Video call"
                    >
                      <Video className="w-6 h-6" />
                    </button>
                  </>
                )}

                {randomMatch && (
                  <button
                    onClick={stopRandomChat}
                    className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all shadow-lg"
                    title="Leave Chat"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                )}

                <button
                  onClick={toggleSearch}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all shadow-lg"
                >
                  {showSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                </button>

                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all shadow-lg"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {search && (
          <div className="px-8 py-3 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-cyan-700/30 backdrop-blur-sm">
            <p className="text-sm text-cyan-200 font-medium">
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Messages */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 82, 0.8) 50%, rgba(15, 23, 42, 0.95) 100%)'
          }}
        >
          <div className="p-8 space-y-6">
            {randomMatch && messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
                  <UserPlus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Connected with {selectedUser?.username}!</h3>
                <p className="text-slate-400">Start the conversation by saying hello!</p>
                <p className="text-slate-500 text-sm mt-2">When they leave, you'll automatically connect with someone new</p>
              </div>
            )}
            {filteredMessages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                showAvatar={
                  index === 0 ||
                  filteredMessages[index - 1]?.sender !== message.sender
                }
              />
            ))}
            {isTyping && <TypingIndicator avatar={selectedUser?.username.substring(0, 2).toUpperCase()} />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 right-8 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-2xl shadow-2xl transition-all transform hover:scale-110 z-10 backdrop-blur-sm border border-cyan-500/30"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        )}

        {/* Input */}
        <div className="bg-slate-900/80 backdrop-blur-md border-t border-slate-800 shadow-2xl">
          <div className="p-6">
            <div className="flex items-end gap-4">
              <button className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-all shadow-lg">
                <Paperclip className="w-6 h-6" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDown}
                  placeholder={randomMatch ? "Chat with your random match..." : "Type your message..."}
                  rows="1"
                  className="w-full px-5 py-3 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-base max-h-32 overflow-y-auto backdrop-blur-sm shadow-lg"
                  style={{
                    minHeight: '44px',
                    height: 'auto'
                  }}
                />
              </div>

              <button className="p-2.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-all shadow-lg">
                <Smile className="w-6 h-6" />
              </button>

              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className={`p-3 rounded-lg transition-all flex-shrink-0 shadow-lg ${
                  messageInput.trim()
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Message components ---------- */

function MessageRow({ message, showAvatar }) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-3`}>
      {!isMe && showAvatar && (
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-lg">
          {message.avatar}
        </div>
      )}

      {!isMe && !showAvatar && (
        <div className="w-10 h-10 flex-shrink-0" />
      )}

      <MessageBubble message={message} isMe={isMe} showAvatar={showAvatar} />
    </div>
  );
}

function MessageBubble({ message, isMe, showAvatar }) {
  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse" />;
      case "sent":
        return <Check className="w-4 h-4 text-slate-400" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-slate-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-cyan-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-xs sm:max-w-md md:max-w-lg group`}>
      <div
        className={`relative px-5 py-3 rounded-2xl shadow-lg transition-all backdrop-blur-sm border ${
          isMe
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none border-cyan-500/30'
            : 'bg-slate-800/70 text-slate-100 rounded-bl-none border-slate-600/50'
        }`}
      >
        {showAvatar && !isMe && (
          <p className="text-xs font-semibold text-cyan-300 mb-1">{message.name}</p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
        
        <div className={`flex items-center justify-end gap-2 mt-2 ${
          isMe ? 'text-cyan-100' : 'text-slate-400'
        }`}>
          <span className="text-xs">{message.time}</span>
          {isMe && (
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ avatar }) {
  return (
    <div className="flex justify-start items-end gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-lg">
        {avatar}
      </div>
      <div className="bg-slate-800/70 text-slate-100 rounded-2xl rounded-bl-none border border-slate-600/50 shadow-lg">
        <div className="px-5 py-3">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}