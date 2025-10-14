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
  Menu,
  MessageCircle,
  Camera
} from "lucide-react";
import { io } from "socket.io-client";

const API_URL = "https://ondealchatapp.onrender.com";
const SOCKET_URL = "https://ondealchatapp.onrender.com";

export default function ModernChat() {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [loading, setLoading] = useState(true);

  // Call states
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callParticipants, setCallParticipants] = useState([]);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callStatus, setCallStatus] = useState("");

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

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
    ]
  };

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);

        if (data.length > 0 && (!selectedUser || !data.find(u => u._id === selectedUser._id))) {
          setSelectedUser(data[0]);
        }
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [selectedUser, getToken]);

  // Initialize user and socket
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

  // Cleanup media streams
  const cleanupMediaStreams = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    remoteVideosRef.current = {};
    callRoomIdRef.current = null;
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((userId) => {
    console.log(`🔄 Creating peer connection for: ${userId}`);
    
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current);
          console.log(`✅ Added ${track.kind} track to peer connection`);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log(`🧊 Sending ICE candidate to: ${userId}`);
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: userId,
          roomId: callRoomIdRef.current
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`🎥 Received remote track from: ${userId}`, event.streams[0]);
      if (event.streams && event.streams[0]) {
        remoteVideosRef.current[userId] = event.streams[0];
        console.log(`✅ Remote stream stored for: ${userId}`);
        
        // Force UI update
        setCallParticipants(prev => [...prev]);
        setCallStatus("Connected");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`📡 Connection state for ${userId}: ${pc.connectionState}`);
      setCallStatus(pc.connectionState.charAt(0).toUpperCase() + pc.connectionState.slice(1));
    };

    peerConnectionsRef.current[userId] = pc;
    return pc;
  }, []);

  // Initialize socket connection
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
        console.log("✅ Socket connected:", socket.id);
        if (user && user._id) {
          socket.emit("register", user._id);
          console.log("Registered user with socket:", user._id);
        }
      });
      
      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        if (error.message.includes("auth")) {
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      });

      // Message events
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
        } else {
          fetchUsers();
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
        fetchUsers();
      });

      socket.on("userTyping", ({ userId }) => {
        if (selectedUser && userId === selectedUser._id) setIsTyping(true);
      });
      
      socket.on("userStoppedTyping", ({ userId }) => {
        if (selectedUser && userId === selectedUser._id) setIsTyping(false);
      });

      // Call signaling events - FIXED VERSION
      socket.on("incoming-call", ({ from, callType: type, roomId }) => {
        console.log("📞 Incoming call from:", from);
        const caller = users.find(u => u._id === from) || { _id: from, username: "Unknown User" };
        setIncomingCall({ caller, callType: type, roomId });
      });

      socket.on("call-accepted", async ({ from, roomId }) => {
        console.log("✅ Call accepted by:", from);
        setCallStatus("Connecting...");
        
        const user = users.find(u => u._id === from);
        if (user && !callParticipants.find(p => p._id === from)) {
          setCallParticipants(prev => [...prev, user]);
        }
        
        // Create peer connection for the user who accepted
        const pc = createPeerConnection(from);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          socket.emit('webrtc-offer', {
            offer,
            to: from,
            roomId
          });
          console.log("📨 Sent offer to accepted user:", from);
        } catch (error) {
          console.error("❌ Error creating offer:", error);
        }
      });

      socket.on("call-rejected", ({ from }) => {
        console.log("❌ Call rejected by:", from);
        alert(`${users.find(u => u._id === from)?.username || 'User'} rejected the call`);
        endCall();
      });

      socket.on("call-ended", ({ from }) => {
        console.log("📞 Call ended by:", from);
        alert(`${users.find(u => u._id === from)?.username || 'User'} ended the call`);
        endCall();
      });

      socket.on("webrtc-offer", async ({ offer, from, roomId }) => {
        console.log("📨 Received WebRTC offer from:", from);
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
          console.log("📨 Sent WebRTC answer to:", from);
        } catch (error) {
          console.error("❌ Error handling offer:", error);
        }
      });

      socket.on("webrtc-answer", async ({ answer, from }) => {
        console.log("📨 Received WebRTC answer from:", from);
        const pc = peerConnectionsRef.current[from];
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log("✅ Remote description set for:", from);
          } catch (error) {
            console.error("❌ Error setting remote description:", error);
          }
        }
      });

      socket.on("ice-candidate", async ({ candidate, from }) => {
        console.log("🧊 Received ICE candidate from:", from);
        const pc = peerConnectionsRef.current[from];
        if (pc && candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ ICE candidate added for:", from);
          } catch (error) {
            console.error("❌ Error adding ICE candidate:", error);
          }
        }
      });

    } catch (error) {
      console.error("❌ Failed to initialize socket:", error);
    }
  }, [currentUser, users, callParticipants, createPeerConnection, fetchUsers, selectedUser]);

  // Fetch users when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Fetch messages when selected user changes
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
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, currentUser, getToken]);

  // Auto-scroll to bottom when messages change
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
    const text = value.trim();
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
    setValue("");

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
    setValue(e.target.value);

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

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
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
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    cleanupMediaStreams();
  };

  // Start a call - FIXED VERSION
  const startCall = async (type) => {
    if (!selectedUser || !currentUser) {
      alert("Please select a user to call");
      return;
    }

    try {
      console.log("🎬 Starting call...");
      setCallStatus("Starting call...");

      // Get user media
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

      console.log("📹 Requesting media with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      console.log("✅ Media stream obtained:", {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });

      // Set local video stream
      if (type === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        
        localVideoRef.current.play().catch(error => {
          console.error("❌ Error playing local video:", error);
        });
        
        console.log("🎥 Local video stream set");
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
        console.log("📞 Call initiated to:", selectedUser.username);
      }

    } catch (error) {
      console.error("❌ Error starting call:", error);
      
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

  // Accept incoming call - FIXED VERSION
  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      console.log("✅ Accepting call...");
      setCallStatus("Accepting call...");

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

      console.log("✅ Media stream obtained for call acceptance");

      // Set local video stream
      if (incomingCall.callType === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(console.error);
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
        console.log("✅ Call accepted, notifying caller:", incomingCall.caller._id);
      }

      setIncomingCall(null);

    } catch (error) {
      console.error("❌ Error accepting call:", error);
      alert("Could not access camera/microphone. Please check permissions.");
      rejectCall();
    }
  };

  // Reject incoming call
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

  // End current call
  const endCall = () => {
    console.log("🛑 Ending call...");
    
    if (socketRef.current && callRoomIdRef.current) {
      socketRef.current.emit('end-call', {
        to: callParticipants.map(p => p._id).filter(id => id !== currentUser._id),
        from: currentUser._id
      });
    }

    cleanupMediaStreams();
    setInCall(false);
    setCallType(null);
    setCallParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setShowChatPanel(false);
    setShowParticipants(false);
    setCallStatus("");
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsMuted(!audioTracks[0].enabled);
        console.log(`🔇 Mute: ${!audioTracks[0].enabled}`);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setIsVideoOff(!videoTracks[0].enabled);
        console.log(`📹 Video: ${!videoTracks[0].enabled ? 'off' : 'on'}`);
      }
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      // Switch back to camera
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
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: "always" },
          audio: true 
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track in all peer connections
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
        console.error("❌ Error sharing screen:", error);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading Chat...</p>
        </div>
      </div>
    );
  }

  // No user state
  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 mb-6">Please log in to continue chatting</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all transform hover:scale-105 font-semibold shadow-lg"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // No selected user state
  if (!selectedUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Select a Chat</h2>
          <p className="text-gray-400 mb-6">Choose from {users.length} available user{users.length !== 1 ? 's' : ''}</p>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map(user => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-xl transition-all flex items-center space-x-3 group hover:border-purple-500/50"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-105 transition-transform">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  onlineUsers.includes(user._id) 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="h-screen w-full flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-purple-500/30">
            <div className="text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 animate-pulse shadow-2xl">
                {incomingCall.caller.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">{incomingCall.caller.username}</h3>
              <p className="text-gray-300 mb-2">is calling you with</p>
              <div className="flex items-center justify-center space-x-2 mb-6">
                {incomingCall.callType === 'video' ? (
                  <Video className="w-5 h-5 text-purple-400" />
                ) : (
                  <Phone className="w-5 h-5 text-purple-400" />
                )}
                <p className="text-purple-400 font-semibold">
                  {incomingCall.callType === 'video' ? 'Video Call' : 'Audio Call'}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span className="font-semibold">Decline</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Interface */}
      {inCall && (
        <div className="fixed inset-0 bg-gray-900 z-40 flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">
                  {selectedUser.username}
                  {callParticipants.length > 1 && ` + ${callParticipants.length - 1} others`}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    callStatus === 'Connected' ? 'bg-green-500' : 
                    callStatus === 'Connecting' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}></div>
                  <p className="text-sm text-gray-400">
                    {callType === 'video' ? 'Video call' : 'Audio call'} • {callStatus || 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className={`p-3 rounded-xl transition-all ${
                  showParticipants 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowChatPanel(!showChatPanel)}
                className={`p-3 rounded-xl transition-all ${
                  showChatPanel 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={endCall}
                className="p-3 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-xl transition-all"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Video Grid */}
            <div className={`flex-1 p-6 transition-all duration-300 ${
              showChatPanel || showParticipants ? 'lg:w-3/4' : 'w-full'
            }`}>
              {callType === 'video' ? (
                <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Local Video */}
                  <div className="relative bg-gray-800 rounded-2xl overflow-hidden border-2 border-purple-500/50 group shadow-2xl">
                    {isVideoOff ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                            <Camera className="w-8 h-8" />
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
                        className="w-full h-full object-cover bg-gray-900"
                      />
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-gray-600/50">
                      <span className="font-semibold">You</span>
                      {isMuted && <span className="ml-2">🔇</span>}
                    </div>
                  </div>

                  {/* Remote Videos */}
                  {callParticipants.map(participant => (
                    <div key={participant._id} className="relative bg-gray-800 rounded-2xl overflow-hidden border-2 border-gray-600 group hover:border-purple-500/50 transition-all duration-300 shadow-2xl">
                      {remoteVideosRef.current[participant._id] ? (
                        <video
                          srcObject={remoteVideosRef.current[participant._id]}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover bg-gray-900"
                          onLoadedMetadata={(e) => e.target.play().catch(console.error)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <div className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg">
                              {participant.username.substring(0, 2).toUpperCase()}
                            </div>
                            <p className="text-white font-semibold">{participant.username}</p>
                            <p className="text-gray-400 text-sm mt-2">Connecting...</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 bg-black/70 px-4 py-2 rounded-full text-sm backdrop-blur-sm border border-gray-600/50">
                        <span className="font-semibold">{participant.username}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="grid grid-cols-2 gap-16 mb-12">
                      {/* Local Audio Avatar */}
                      <div className="flex flex-col items-center">
                        <div className="w-36 h-36 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-5xl mb-6 shadow-2xl">
                          {currentUser.username.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-2xl font-semibold mb-2">You</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <p className="text-gray-400">{isMuted ? 'Muted' : 'Speaking'}</p>
                        </div>
                      </div>

                      {/* Remote Audio Avatar */}
                      {callParticipants.map(participant => (
                        <div key={participant._id} className="flex flex-col items-center">
                          <div className="w-36 h-36 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-5xl mb-6 shadow-2xl animate-pulse">
                            {participant.username.substring(0, 2).toUpperCase()}
                          </div>
                          <p className="text-2xl font-semibold mb-2">{participant.username}</p>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            <p className="text-gray-400">Connected</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-8">
            <div className="max-w-4xl mx-auto flex items-center justify-center space-x-8">
              <button
                onClick={toggleMute}
                className={`p-5 rounded-2xl transition-all transform hover:scale-110 shadow-2xl ${
                  isMuted
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                    : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                }`}
              >
                {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-5 rounded-2xl transition-all transform hover:scale-110 shadow-2xl ${
                    isVideoOff
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-7 h-7" /> : <Video className="w-7 h-7" />}
                </button>
              )}

              {callType === 'video' && (
                <button
                  onClick={toggleScreenShare}
                  className={`p-5 rounded-2xl transition-all transform hover:scale-110 shadow-2xl ${
                    isScreenSharing
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
                  }`}
                >
                  {isScreenSharing ? <MonitorOff className="w-7 h-7" /> : <Monitor className="w-7 h-7" />}
                </button>
              )}

              <button
                onClick={endCall}
                className="p-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl transition-all transform hover:scale-110 shadow-2xl"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User List Sidebar */}
      <div className={`w-80 bg-gray-900/90 backdrop-blur-sm border-r border-gray-700 flex flex-col transition-all duration-300 ${
        showUserList ? 'translate-x-0' : '-translate-x-full absolute'
      }`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Chats</h2>
            <button
              onClick={() => setShowUserList(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {users.map(user => (
              <button
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserList(false);
                }}
                className={`w-full p-4 rounded-xl transition-all flex items-center space-x-4 group ${
                  selectedUser._id === user._id
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 shadow-lg'
                    : 'bg-gray-800/30 hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50'
                }`}
              >
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg group-hover:scale-105 transition-transform shadow-lg">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full shadow-lg"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-white text-lg">{user.username}</p>
                  <p className="text-sm text-gray-400">{onlineUsers.includes(user._id) ? 'Online' : 'Offline'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <button
                onClick={() => setShowUserList(true)}
                className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-2xl">
                  {selectedUser.username.substring(0, 2).toUpperCase()}
                </div>
                {isUserOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full shadow-lg"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-white truncate">{selectedUser.username}</h2>
                <div className="flex items-center space-x-3">
                  {isUserOnline && (
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg"></div>
                  )}
                  <p className="text-sm text-gray-300">
                    {isTyping ? (
                      <span className="text-purple-400 font-semibold">typing...</span>
                    ) : isUserOnline ? (
                      <span className="text-green-400">online</span>
                    ) : (
                      <span className="text-gray-400">offline</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {showSearch && (
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="w-80 px-5 py-3 pl-12 pr-10 border border-gray-600 rounded-2xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm backdrop-blur-sm shadow-lg"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-3">
                {!showSearch && (
                  <>
                    <button 
                      onClick={() => startCall('audio')}
                      className="p-3 text-gray-400 hover:text-green-400 hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                      title="Audio call"
                    >
                      <Phone className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => startCall('video')}
                      className="p-3 text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                      title="Video call"
                    >
                      <Video className="w-6 h-6" />
                    </button>
                  </>
                )}

                <button
                  onClick={toggleSearch}
                  className="p-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  {showSearch ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                </button>

                <button 
                  onClick={handleLogout}
                  className="p-3 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {search && (
          <div className="px-8 py-3 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-b border-blue-700/50 backdrop-blur-sm">
            <p className="text-sm text-blue-200 font-medium">
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found for "{search}"
            </p>
          </div>
        )}

        {/* Messages */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 58, 138, 0.7) 50%, rgba(15, 23, 42, 0.9) 100%)'
          }}
        >
          <div className="p-8 space-y-6">
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
            {isTyping && <TypingIndicator avatar={selectedUser.username.substring(0, 2).toUpperCase()} />}
          </div>
        </div>

        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-28 right-8 p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl shadow-2xl transition-all transform hover:scale-110 z-10 backdrop-blur-sm border border-purple-500/30"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        )}

        {/* Input */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 shadow-2xl">
          <div className="p-6">
            <div className="flex items-end space-x-4">
              <button className="p-3 text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                <Paperclip className="w-6 h-6" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={value}
                  onChange={handleInputChange}
                  onKeyDown={onKeyDown}
                  placeholder="Type your message..."
                  rows="1"
                  className="w-full px-6 py-4 pr-14 border border-gray-600 rounded-2xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base max-h-32 overflow-y-auto backdrop-blur-sm shadow-lg"
                  style={{
                    minHeight: '56px',
                    height: 'auto'
                  }}
                />
              </div>

              <button className="p-3 text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                <Smile className="w-6 h-6" />
              </button>

              <button
                onClick={handleSend}
                disabled={!value.trim()}
                className={`p-4 rounded-2xl transition-all transform flex-shrink-0 shadow-2xl ${
                  value.trim()
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, showAvatar }) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-4`}>
      {!isMe && showAvatar && (
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-2xl">
          {message.avatar}
        </div>
      )}

      {!isMe && !showAvatar && (
        <div className="w-12 h-12 flex-shrink-0" />
      )}

      <MessageBubble message={message} isMe={isMe} showAvatar={showAvatar} />
    </div>
  );
}

function MessageBubble({ message, isMe, showAvatar }) {
  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />;
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`max-w-xs sm:max-w-md md:max-w-lg xl:max-w-xl group ${isMe ? 'order-2' : 'order-1'}`}
    >
      <div
        className={`relative px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-2xl backdrop-blur-sm border ${
          isMe
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white ml-auto rounded-br-lg border-purple-500/30'
            : 'bg-gray-800/70 text-gray-100 mr-auto rounded-bl-lg border border-gray-600/50'
        }`}
      >
        {!isMe && showAvatar && (
          <p className="text-xs font-semibold text-gray-300 mb-2">
            {message.name}
          </p>
        )}

        <p className="text-base whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        <div className="flex items-center justify-end space-x-2 mt-3">
          <span className={`text-xs ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>
            {message.time}
          </span>
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
    <div className="flex items-end space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-2xl">
        {avatar}
      </div>
      <div className="px-6 py-4 rounded-2xl bg-gray-800/70 text-gray-100 border border-gray-600/50 shadow-2xl flex space-x-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  );
}