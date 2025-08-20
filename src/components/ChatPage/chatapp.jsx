import { useEffect, useMemo, useRef, useState } from "react";
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
  CheckCheck 
} from "lucide-react";

export default function ModernChat() {
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: "them",
      name: "Alex Johnson",
      avatar: "AJ",
      text: "Hi Ritik! Welcome to our amazing chat interface 👋\nHow are you doing today?",
      time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered"
    },
    {
      id: 2,
      sender: "me",
      name: "You",
      avatar: "RJ",
      text: "Hey Alex! I'm doing great, thanks for asking! 😊",
      time: new Date(Date.now() - 3000000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read"
    },
    {
      id: 3,
      sender: "them",
      name: "Alex Johnson",
      avatar: "AJ",
      text: "That's wonderful to hear! I wanted to show you this new chat interface we've been working on. What do you think of the design?",
      time: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered"
    },
    {
      id: 4,
      sender: "me",
      name: "You",
      avatar: "RJ",
      text: "Wow, this looks incredible! The design is so modern and clean. I love the animations and the responsive layout! 🚀",
      time: new Date(Date.now() - 900000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "read"
    },
  ]);
  
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom and handle scroll button visibility
  useEffect(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom) {
        listRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }
  }, [messages.length]);

  // Handle scroll events
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

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    setMessages((prev) => [
      ...prev,
      { 
        id: Date.now(), 
        sender: "me", 
        name: "You", 
        avatar: "RJ", 
        text, 
        time: timeString,
        status: "sending"
      }
    ]);
    
    setValue("");
    
    // Simulate typing indicator and response
    setTimeout(() => {
      setIsTyping(true);
      // Update message status to sent
      setMessages(prev => prev.map(msg => 
        msg.status === "sending" ? { ...msg, status: "sent" } : msg
      ));
    }, 500);
    
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "That's really interesting! Tell me more about it 🤔",
        "I completely agree with you on that point! 👍",
        "Thanks for sharing that with me! 😊",
        "That's a great observation! What made you think of that?",
        "I appreciate you taking the time to explain that! ✨"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [
        ...prev.map(msg => msg.status === "sent" ? { ...msg, status: "delivered" } : msg),
        {
          id: Date.now() + 1,
          sender: "them",
          name: "Alex Johnson",
          avatar: "AJ",
          text: randomResponse,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "delivered"
        }
      ]);
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
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
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

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg">
                AJ
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                Alex Johnson
              </h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs sm:text-sm text-gray-300">
                  {isTyping ? "typing..." : "online"}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar (Desktop) / Search Toggle (Mobile) */}
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
              
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {search && (
        <div className="px-4 py-2 bg-blue-900/50 border-b border-blue-700/50 backdrop-blur-sm">
          <p className="text-sm text-blue-200">
            {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found for "{search}"
          </p>
        </div>
      )}

      {/* Messages Area */}
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
                filteredMessages[index - 1]?.sender !== message.sender ||
                new Date(message.time).getTime() - new Date(filteredMessages[index - 1]?.time).getTime() > 300000
              }
            />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105 z-10 backdrop-blur-sm"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input */}
      <div className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 shadow-lg">
        <div className="p-3 sm:p-4">
          <div className="flex items-end space-x-2 sm:space-x-3">
            <button className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-800/50 rounded-full transition-colors flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
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

// Message Row Component
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

// Message Bubble Component
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
      className={`max-w-xs sm:max-w-md md:max-w-lg xl:max-w-xl group ${
        isMe ? 'order-2' : 'order-1'
      }`}
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

// Typing Indicator Component
function TypingIndicator() {
  return (
    <div className="flex justify-start items-end space-x-2">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-lg">
        AJ
      </div>
      
      <div className="bg-gray-800/70 border border-gray-600/50 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.4s'
              }}
            />
          ))}
          <span className="text-xs text-gray-300 ml-2">typing</span>
        </div>
      </div>
    </div>
  );
}