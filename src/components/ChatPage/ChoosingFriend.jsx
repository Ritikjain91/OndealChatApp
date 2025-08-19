import { useState } from 'react';
import { MessageSquare, Users, Camera, Crown, Instagram } from 'lucide-react';

const ChatApp = () => {
  const [selectedGender, setSelectedGender] = useState('Both');
  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = ['Fashion', 'Gardening', 'Pets'];

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900/80 backdrop-blur-sm border-r border-gray-700">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg">Ondeal ChatApp</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800 text-white">
              <MessageSquare size={18} />
              <span>Chat</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
              <Users size={18} />
              <span>Friends</span>
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="px-4 mb-4">
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors">
            <MessageSquare size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Direct Messages */}
        <div className="px-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">DIRECT MESSAGES</h3>
          <div className="flex flex-col items-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mb-3">
              <MessageSquare size={24} />
            </div>
            <p className="text-sm text-center">
              Looks like you're the popular one here, no messages yet!
            </p>
          </div>
        </div>

        {/* Premium Section */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Crown className="text-yellow-400 mr-2" size={20} />
              <span className="font-bold">Get Premium</span>
            </div>
            <p className="text-sm text-gray-200 mb-3">
              Unlock chat filters, Send and receive images and videos and more!
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-2 text-sm font-medium transition-colors">
              Get Premium
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 px-6 py-3">
          <h1 className="text-xl font-bold">New Chat</h1>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-center">
              Ondeal ChatApp
            </h1>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4 mb-8">
            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
              <Instagram size={20} />
            </button>
            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </button>
          </div>

          {/* Interests Section */}
          <div className="w-full max-w-2xl mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Your Interests <span className="text-green-400 text-sm">(ON)</span>
                </h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Manage</button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              <p className="text-gray-400 text-sm">
                You have no interests. Click to add some.
              </p>
            </div>
          </div>

          {/* Gender Filter */}
          <div className="w-full max-w-2xl mb-8">
            <h3 className="text-lg font-semibold mb-4">Gender Filter:</h3>
            <div className="flex space-x-4">
              {[
                { label: 'Male', icon: '👨', premium: false },
                { label: 'Both', icon: '👥', premium: false },
                { label: 'Female', icon: '👩', premium: true }
              ].map((option) => (
                <button
                  key={option.label}
                  onClick={() => setSelectedGender(option.label)}
                  className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    selectedGender === option.label
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  {option.premium && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Crown size={12} className="text-white" />
                    </div>
                  )}
                  <span className="text-2xl mb-2">{option.icon}</span>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
          
            <button className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors">
              <MessageSquare size={20} />
              <span>Start Text Chat</span>
            </button>
          </div>

          {/* Footer Text */}
          <p className="text-gray-400 text-sm mt-6">
            Be respectful and follow our{' '}
            <button className="text-blue-400 hover:text-blue-300 underline">
              chat rules
            </button>
          </p>
        </div>

        {/* Top Right Icons */}
        <div className="absolute top-4 right-6 flex items-center space-x-4">
          <button className="text-gray-400 hover:text-white">
            <Users size={20} />
          </button>
          <button className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
          </button>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">?</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;