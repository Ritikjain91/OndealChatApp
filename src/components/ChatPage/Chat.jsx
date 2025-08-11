import  { useEffect, useState, useRef } from 'react';
import { Send, Smile, Paperclip, MoreVertical, Search, Phone, Video, Settings } from 'lucide-react';

function App() {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      sender: 'Alice Johnson', 
      text: 'Hey there! How are you doing today? 😊', 
      timestamp: '10:30 AM',
      avatar: '👩‍💼',
      isOnline: true
    },
    { 
      id: 2,
      sender: 'You', 
      text: 'I\'m doing fantastic! Just working on some exciting projects. Thanks for asking!', 
      timestamp: '10:32 AM',
      avatar: '🧑‍💻'
    },
    { 
      id: 3,
      sender: 'Bob Wilson', 
      text: 'Anyone up for a coffee break? ☕ There\'s this new place downtown that just opened!', 
      timestamp: '10:35 AM',
      avatar: '👨‍🎨',
      isOnline: true
    },
    { 
      id: 4,
      sender: 'Alice Johnson', 
      text: 'That sounds amazing! I could definitely use a caffeine boost right about now 🚀', 
      timestamp: '10:37 AM',
      avatar: '👩‍💼',
      isOnline: true
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '☕', '🚀', '✨', '🔥', '💯', '🎯', '🌟'];
  
  const onlineUsers = [
    { name: 'Alice Johnson', avatar: '👩‍💼', status: 'Active now' },
    { name: 'Bob Wilson', avatar: '👨‍🎨', status: 'Active 5m ago' },
    { name: 'Sarah Chen', avatar: '👩‍🔬', status: 'Active 1h ago' },
    { name: 'Mike Torres', avatar: '👨‍🚀', status: 'Active 2h ago' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { 
      id: messages.length + 1,
      sender: 'You', 
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: '🧑‍💻'
    };
    
    setMessages([...messages, newMessage]);
    setInput('');
   
    setIsTyping(true);
    
  
    setTimeout(() => {
      const responses = [
        { text: "That's really interesting! Tell me more about it 🤔", avatar: '👩‍💼', sender: 'Alice Johnson' },
        { text: "I completely agree with your perspective! 💭", avatar: '👨‍🎨', sender: 'Bob Wilson' },
        { text: "Thanks for sharing that insight! 🌟", avatar: '👩‍🔬', sender: 'Sarah Chen' },
        { text: "Great point! I hadn't thought of it that way ✨", avatar: '👨‍🚀', sender: 'Mike Torres' },
        { text: "That's exactly what I was thinking! 🎯", avatar: '👩‍💼', sender: 'Alice Johnson' }
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: randomResponse.sender,
        text: randomResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: randomResponse.avatar,
        isOnline: true
      }]);
      
      setIsTyping(false);
    }, 2000);
  };

  const addEmoji = (emoji) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto flex gap-6 h-[calc(100vh-2rem)]">
        
        
        <div className="w-80 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 flex flex-col">
    
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">💬</span>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">ChatFlow</h2>
              <p className="text-white/60 text-sm">Team Workspace</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Online Users */}
          <div className="flex-1">
            <h3 className="text-white/80 font-medium mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Online ({onlineUsers.length})
            </h3>
            <div className="space-y-3">
              {onlineUsers.map((user, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-lg">
                      {user.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{user.name}</p>
                    <p className="text-white/50 text-xs">{user.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat */}
        <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xl">
                🌟
              </div>
              <div>
                <h1 className="text-white font-semibold text-xl">General Chat</h1>
                <p className="text-white/60 text-sm">4 members • 3 online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-white/60">Loading your conversations...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-3 animate-fade-in ${
                      msg.sender === 'You' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-sm flex-shrink-0">
                      {msg.avatar}
                    </div>
                    
                    <div className={`max-w-md ${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium text-white/80 ${msg.sender === 'You' ? 'order-2' : 'order-1'}`}>
                          {msg.sender}
                        </span>
                        <span className={`text-xs text-white/50 ${msg.sender === 'You' ? 'order-1' : 'order-2'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                      
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-200 hover:scale-105 ${
                          msg.sender === 'You'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400/30 rounded-br-md'
                            : 'bg-white/10 text-white border-white/20 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-sm">
                      🤖
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-4 py-3 pr-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none transition-all duration-200"
                  style={{ minHeight: '52px' }}
                />
                
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/70 hover:text-white"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white/70 hover:text-white">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute bottom-14 right-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-3 grid grid-cols-6 gap-2">
                    {emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        onClick={() => addEmoji(emoji)}
                        className="w-8 h-8 rounded-lg hover:bg-white/20 transition-all duration-200 text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;