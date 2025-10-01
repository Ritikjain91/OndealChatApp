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
  Users
} from "lucide-react";
import { io } from "socket.io-client";

const API_URL = "https://ondealchatapp.onrender.com";
const SOCKET_URL ="https://ondealchatapp.onrender.com";

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

  const listRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // Fetch users function
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

  // Fetch current user and then initialize socket with token
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

    // cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [getToken]);

  // Initialize socket and register listeners
  const initSocket = (token, user) => {
    if (socketRef.current) {
      // already initialized
      return;
    }

    if (!token) {
      console.warn("No token available for socket connection");
      return;
    }

    try {
      // pass token in auth so server can verify on connect
      const socket = io(SOCKET_URL, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        // Register user with socket
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

      // receive new message
      socket.on("receiveMessage", (message) => {
        // If message is for currently selected user, append
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
          // optionally update users list or show unread indicator
          fetchUsers();
        }
      });

      // server acknowledges a message (should include tempId)
      socket.on("messageSent", (payload) => {
        // payload should contain tempId (if client provided one) and message object
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
          // fallback: append the message if not found
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

      // handle authentication error from server side
      socket.on("authError", (err) => {
        console.warn("Socket auth error:", err);
        localStorage.removeItem("token");
        setCurrentUser(null);
      });

    } catch (error) {
      console.error("Failed to initialize socket:", error);
    }
  };

  // Fetch users when currentUser is available
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Periodically refresh users
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [currentUser, fetchUsers]);

  // Fetch messages when selectedUser changes
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

  // Auto-scroll behavior
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

    // optimistic UI
    setMessages(prev => [...prev, tempMessage]);
    setValue("");

    // Emit with tempId so server can map and reply with real id
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sendMessage', {
        senderId: currentUser._id,
        receiverId: selectedUser._id,
        text,
        tempId
      });

      // stop typing immediately
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
                  <button className="hidden sm:flex p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-full transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="hidden sm:flex p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-800/50 rounded-full transition-colors">
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

/* MessageRow, MessageBubble, TypingIndicator unchanged */
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
