import { useState } from 'react';
import { Plus } from 'lucide-react';

const Chat = () => {
  const [genderFilter, setGenderFilter] = useState('Both');
  const [interests, setInterests] = useState([]);
  
  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <div className="max-w-md mx-auto bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h1 className="text-white font-bold text-xl text-center">Chitchat.gg</h1>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-white/10">
          <button className="flex-1 py-3 text-white font-medium text-sm bg-white/10">
            New Chat
          </button>
          <button className="flex-1 py-3 text-white/60 font-medium text-sm hover:bg-white/5">
            Friends
          </button>
        </div>

        {/* Direct Messages Section */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white/80 font-semibold text-sm uppercase mb-2">Direct Messages</h2>
          <div className="text-center py-8 text-white/50 text-sm">
            <p>Looks like you're the popular one here, no messages yet!</p>
            <p className="mt-2 text-xs">Unlock chat filters, Send and restore images and videos and more!</p>
          </div>
        </div>

        {/* Premium CTA */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-purple-600 to-indigo-600">
          <button className="w-full py-2 bg-white text-purple-900 font-bold rounded-lg">
            Get Premium
          </button>
        </div>

        {/* Interests Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white/80 font-semibold text-sm">Your Interests (ON)</h2>
            <button className="text-xs text-blue-400">Edit</button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['Fashion', 'Gardening', 'Pets'].map((interest) => (
              <div 
                key={interest}
                className={`p-2 rounded-lg text-center text-xs ${interests.includes(interest) ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50 text-center">
            You have no interests. Click to add some.
          </p>
        </div>

        {/* Gender Filter */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white/80 font-semibold text-sm mb-3">Gender Filter:</h2>
          <div className="flex gap-2">
            {['Male', 'Both', 'Female'].map((gender) => (
              <button
                key={gender}
                className={`flex-1 py-2 rounded-lg text-sm ${genderFilter === gender ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'}`}
                onClick={() => setGenderFilter(gender)}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        {/* Start Chat Button */}
        <div className="p-4 mt-auto">
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Start Text Chat
          </button>
          <p className="text-xs text-white/50 mt-2 text-center">
            Be respectful and follow our chat rules!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;