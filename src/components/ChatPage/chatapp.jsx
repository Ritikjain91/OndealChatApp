import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
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
  MonitorOff
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
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [incomingCall, setIncomingCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callParticipants, setCallParticipants] = useState([]);

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});
  const peerConnectionsRef = useRef({});
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token available");
        return;
      }

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

        if (data.length > 0 && !selectedUser) {
          setSelectedUser(data[0]);
        }
      } else if (response.status === 401) {
        console.error("Unauthorized - token may be invalid");
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [selectedUser, getToken]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found in localStorage");
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
          console.error("Token invalid or expired");
          localStorage.removeItem("token");
          setCurrentUser(null);
        } else {
          console.error("Failed to fetch user - status:", response.status);
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

  const cleanupMediaStreams = () => {
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
  };

  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          candidate: event.candidate,
          to: userId
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideosRef.current[userId]) {
        remoteVideosRef.current[userId].srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        handleRemoveParticipant(userId);
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    peerConnectionsRef.current[userId] = pc;
    return pc;
  };

  const handleRemoveParticipant = (userId) => {
    if (peerConnectionsRef.current[userId]) {
      peerConnectionsRef.current[userId].close();
      delete peerConnectionsRef.current[userId];
    }
    setCallParticipants(prev => prev.filter(p => p._id !== userId));
  };

  const initSocket = (token, user) => {
    if (socketRef.current) {
      return;
    }

    if (!token) {
      console.warn("No token available for socket connection");
      return;
    }

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
        }
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        if (error.message.includes("auth") || error.message.includes("jwt")) {
          console.error("Authentication failed - invalid token");
          localStorage.removeItem("token");
          setCurrentUser(null);
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

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
        } else if (message) {
          const formatted = {
            id: message._id,
            sender: message.sender._id === currentUser?._id ? "me" : "them",
            name: message.sender.username,
            avatar: message.sender.username.substring(0, 2).toUpperCase(),
            text: message.text,
            time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "delivered"
          };
          setMessages(prev => [...prev, formatted]);
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

      socket.on("authError", (err) => {
        console.warn("Socket auth error:", err);
        localStorage.removeItem("token");
        setCurrentUser(null);
      });

      // Call signaling events
      socket.on("incoming-call", ({ from, callType: type, roomId }) => {
        const caller = users.find(u => u._id === from) || { _id: from, username: "Unknown" };
        setIncomingCall({ caller, callType: type, roomId });
      });

      socket.on("call-accepted", async ({ from, roomId }) => {
        setInCall(true);
        const user = users.find(u => u._id === from);
        if (user) {
          setCallParticipants(prev => [...prev, user]);
        }
      });

      socket.on("call-rejected", ({ from }) => {
        alert("Call was rejected");
        endCall();
      });

      socket.on("call-ended", ({ from }) => {
        endCall();
      });

      socket.on("user-joined-call", async ({ userId, roomId }) => {
        const user = users.find(u => u._id === userId);
        if (user && !callParticipants.find(p => p._id === userId)) {
          setCallParticipants(prev => [...prev, user]);
          
          const pc = createPeerConnection(userId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          socket.emit('webrtc-offer', {
            offer,
            to: userId,
            roomId
          });
        }
      });

      socket.on("user-left-call", ({ userId }) => {
        handleRemoveParticipant(userId);
      });

      socket.on("webrtc-offer", async ({ offer, from, roomId }) => {
        const pc = createPeerConnection(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('webrtc-answer', {
          answer,
          to: from,
          roomId
        });
      });

      socket.on("webrtc-answer", async ({ answer, from }) => {
        const pc = peerConnectionsRef.current[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      });

      socket.on("ice-candidate", async ({ candidate, from }) => {
        const pc = peerConnectionsRef.current[from];
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      });

    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [currentUser, fetchUsers]);

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
          console.error("Unauthorized while fetching messages");
          localStorage.removeItem("token");
          setCurrentUser(null);
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
    } else {
      console.warn("Socket not connected - message not sent");
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

  const startCall = async (type) => {
    if (!selectedUser || !currentUser) return;

    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const roomId = `${currentUser._id}-${selectedUser._id}-${Date.now()}`;

      setCallType(type);
      setInCall(true);
      setCallParticipants([selectedUser]);

      if (socketRef.current) {
        socketRef.current.emit('initiate-call', {
          to: selectedUser._id,
          from: currentUser._id,
          callType: type,
          roomId
        });
      }

      createPeerConnection(selectedUser._id);

    } catch (error) {
      console.error("Error starting call:", error);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const constraints = {
        audio: true,
        video: incomingCall.callType === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCallType(incomingCall.callType);
      setInCall(true);
      setCallParticipants([incomingCall.caller]);

      if (socketRef.current) {
        socketRef.current.emit('accept-call', {
          to: incomingCall.caller._id,
          from: currentUser._id,
          roomId: incomingCall.roomId
        });

        socketRef.current.emit('join-call', {
          roomId: incomingCall.roomId,
          userId: currentUser._id
        });
      }

      createPeerConnection(incomingCall.caller._id);
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
    if (socketRef.current && callParticipants.length > 0) {
      callParticipants.forEach(participant => {
        socketRef.current.emit('end-call', {
          to: participant._id,
          from: currentUser._id
        });
      });
    }

    cleanupMediaStreams();
    setInCall(false);
    setCallType(null);
    setCallParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
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
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
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
        alert("Could not share screen. Please check permissions.");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center max-w-md px-4">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to access the chat</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="text-center max-w-md px-4">
          <Users className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-2">Select a User to Chat</h2>
          <p className="text-gray-400 mb-6">Choose from {users.length} available user{users.length !== 1 ? 's' : ''}</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map(user => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className="w-full p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 rounded-lg transition-all flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-400">{user.email}</p>
                </div>
                {onlineUsers.includes(user._id) && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isUserOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 animate-pulse">
                {incomingCall.caller.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold mb-2">{incomingCall.caller.username}</h3>
              <p className="text-gray-400 mb-6">
                Incoming {incomingCall.callType === 'video' ? 'video' : 'audio'} call...
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={rejectCall}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <PhoneOff className="w-5 h-5" />
                  <span>Decline</span>
                </button>
                <button
                  onClick={acceptCall}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Interface */}
      {inCall && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
           {callType === 'video' ? (
              <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                {/* Local Video */}
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  {isVideoOff ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
                      <div className="text-center">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
                          {currentUser.username.substring(0, 2).toUpperCase()}
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
                      className="w-full h-full object-cover mirror"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-sm">
                    You {isMuted && '🔇'}
                  </div>
                  {isScreenSharing && (
                    <div className="absolute top-2 left-2 bg-blue-600 px-3 py-1 rounded-full text-xs">
                      Sharing Screen
                    </div>
                  )}
                </div>

                {/* Remote Videos */}
                {callParticipants.map(participant => (
                  <div key={participant._id} className="relative bg-gray-900 rounded-lg overflow-hidden">
                    <video
                      ref={el => remoteVideosRef.current[participant._id] = el}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-full text-sm">
                      {participant.username}
                    </div>
                  </div>
                ))}
              </div>
            ) :(
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Local Audio Avatar */}
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4 shadow-2xl">
                        {currentUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="text-xl font-semibold">You</p>
                      <p className="text-gray-400">{isMuted ? 'Muted' : 'Speaking'}</p>
                    </div>

                    {/* Remote Audio Avatar */}
                    {callParticipants.map(participant => (
                      <div key={participant._id} className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4 shadow-2xl animate-pulse">
                          {participant.username.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="text-xl font-semibold">{participant.username}</p>
                        <p className="text-gray-400">Connected</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 p-6">
            <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-all ${
                  isMuted
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {/* Video Toggle (only in video calls) */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all ${
                    isVideoOff
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}

              {/* Screen Share (only in video calls) */}
              {callType === 'video' && (
                <button
                  onClick={toggleScreenShare}
                  className={`p-4 rounded-full transition-all ${
                    isScreenSharing
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                  {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={endCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all"
                title="End call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>

            {/* Call Info */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                {callParticipants.length} participant{callParticipants.length !== 1 ? 's' : ''} in call
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg">
                {selectedUser.username.substring(0, 2).toUpperCase()}
              </div>
              {isUserOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                {selectedUser.username}
              </h2>
              <div className="flex items-center space-x-1">
                {isUserOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                <p className="text-xs sm:text-sm text-gray-300">
                  {isTyping ? "typing..." : isUserOnline ? "online" : "offline"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {showSearch && (
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-40 sm:w-64 md:w-80 px-4 py-2 pl-10 pr-8 border border-gray-600 rounded-full bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm backdrop-blur-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center space-x-1 sm:space-x-2">
              {!showSearch && (
                <>
                  <button 
                    onClick={() => startCall('audio')}
                    className="hidden sm:flex p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-full transition-colors"
                    title="Audio call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => startCall('video')}
                    className="hidden sm:flex p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-full transition-colors"
                    title="Video call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                </>
              )}

              <button
                onClick={toggleSearch}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors"
              >
                {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded-full transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User List Sidebar */}
      {showUserList && (
        <div className="absolute top-16 left-0 w-72 h-[calc(100%-4rem)] bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 z-20 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Users ({users.length})</h3>
              <button
                onClick={() => setShowUserList(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {users.map(user => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserList(false);
                  }}
                  className={`w-full p-3 rounded-lg transition-all flex items-center space-x-3 ${
                    selectedUser._id === user._id
                      ? 'bg-purple-600'
                      : 'bg-gray-800/50 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    {onlineUsers.includes(user._id) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-sm">{user.username}</p>
                    <p className="text-xs text-gray-400">{onlineUsers.includes(user._id) ? 'online' : 'offline'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {search && (
        <div className="px-4 py-2 bg-blue-900/50 border-b border-blue-700/50 backdrop-blur-sm">
          <p className="text-sm text-blue-200">
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
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 138, 0.6) 50%, rgba(15, 23, 42, 0.8) 100%)'
        }}
      >
        <div className="p-4 space-y-4">
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
          className="fixed bottom-24 right-6 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105 z-10 backdrop-blur-sm"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Input */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 shadow-lg">
        <div className="p-3 sm:p-4">
          <div className="flex items-end space-x-2 sm:space-x-3">
            <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-full transition-colors flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={value}
                onChange={handleInputChange}
                onKeyDown={onKeyDown}
                placeholder="Type your message..."
                rows="1"
                className="w-full px-4 py-3 pr-12 border border-gray-600 rounded-2xl bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base max-h-32 overflow-y-auto backdrop-blur-sm"
                style={{
                  minHeight: '44px',
                  height: 'auto'
                }}
              />
            </div>

            <button className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-gray-800/50 rounded-full transition-colors flex-shrink-0">
              <Smile className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className={`p-3 rounded-full transition-all transform flex-shrink-0 ${
                value.trim()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105 shadow-lg'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageRow({ message, showAvatar }) {
  const isMe = message.sender === "me";

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end space-x-2`}>
      {!isMe && showAvatar && (
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-lg">
          {message.avatar}
        </div>
      )}

      {!isMe && !showAvatar && (
        <div className="w-8 h-8 flex-shrink-0" />
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
        className={`relative px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 group-hover:shadow-xl backdrop-blur-sm ${
          isMe
            ? 'bg-purple-600 text-white ml-auto rounded-br-md'
            : 'bg-gray-800/70 text-gray-100 mr-auto rounded-bl-md border border-gray-600/50'
        }`}
      >
        {!isMe && showAvatar && (
          <p className="text-xs font-semibold text-gray-300 mb-1">
            {message.name}
          </p>
        )}

        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        <div className="flex items-center justify-end space-x-1 mt-2">
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
    <div className="flex items-end space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-lg">
        {avatar}
      </div>
      <div className="px-4 py-3 rounded-2xl bg-gray-800/70 text-gray-100 border border-gray-600/50 shadow-lg flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
      </div>
    </div>
  );
}