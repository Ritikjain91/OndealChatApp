import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Video, Users, Shield, Star, Globe } from 'lucide-react';

// Animation keyframes using Tailwind's animate classes
const FloatingEmoji = ({ emoji, className, delay = 0 }) => {
  return (
    <div 
      className={`absolute text-2xl cursor-pointer transition-transform hover:scale-125 ${className}`}
      style={{ 
        animationDelay: `${delay}s`,
        animation: 'float 3s ease-in-out infinite'
      }}
    >
      {emoji}
    </div>
  );
};

const GlowingOrb = ({ className, color = 'bg-blue-500' }) => {
  return (
    <div 
      className={`absolute w-48 h-48 rounded-full opacity-20 blur-3xl animate-pulse ${color} ${className}`}
      style={{ animation: 'pulse 4s ease-in-out infinite' }}
    />
  );
};

const IntersectionObserver = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const Frontpage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', section: 'home' },
    { name: 'Features', section: 'features' },
    { name: 'Testimonials', section: 'testimonials' },
    { name: 'Contact', section: 'contact' },
  ];

  const floatingStickers = [
    { emoji: '🎉', position: 'top-[10%] left-[5%]', delay: 0 },
    { emoji: '✨', position: 'top-[20%] right-[10%]', delay: 1 },
    { emoji: '🌟', position: 'top-[60%] left-[8%]', delay: 2 },
    { emoji: '💫', position: 'bottom-[30%] right-[15%]', delay: 0.5 },
    { emoji: '🎨', position: 'top-[40%] left-[2%]', delay: 1.5 },
    { emoji: '🚀', position: 'top-[70%] right-[5%]', delay: 2.5 },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Add CSS keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-float { animation: float 3s ease-in-out infinite; }
      .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
      .animate-fadeInUp { animation: fadeInUp 0.8s ease-out; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <GlowingOrb className="top-[10%] left-[10%]" color="bg-blue-500" />
      <GlowingOrb className="top-[60%] right-[10%]" color="bg-purple-500" />
      <GlowingOrb className="bottom-[20%] left-[20%]" color="bg-pink-500" />
      
      {/* Floating stickers */}
      {floatingStickers.map((sticker, index) => (
        <FloatingEmoji
          key={index}
          emoji={sticker.emoji}
          className={sticker.position}
          delay={sticker.delay}
        />
      ))}

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div 
              className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent cursor-pointer"
              onClick={() => scrollToSection('home')}
            >
              Ondeal ChatApp
            </div>
            
            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.section)}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavigation('/signup')}
                  className="px-4 py-2 text-sm font-medium text-slate-900 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.section)}
                  className="block text-gray-300 hover:text-white transition-colors duration-200 w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-2 pt-4">
                <button 
                  onClick={() => handleNavigation('/login')} 
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavigation('/signup')} 
                  className="px-4 py-2 text-sm font-medium text-slate-900 bg-white rounded-full hover:bg-gray-100 transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        
        {/* Hero Section */}
        <section id="home" className="py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Talk to strangers,<br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Make friends!
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleNavigation('/chat')}
                  className="flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Without Login
                </button>
                <button 
                  onClick={() => handleNavigation('/login')}
                  className="flex items-center justify-center px-6 py-3 text-sm font-semibold text-slate-900 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Chat With Login
                </button>
              </div>
            </div>
            
            <div className="relative animate-fadeInUp">
              <div className="aspect-video bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Video Chat Preview</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Anonymous Chat Section */}
        <IntersectionObserver>
          <section id="features" className="py-16 text-center">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-6 py-2 mb-8">
              <span className="text-sm font-semibold">✨ Reach people like you</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Anonymous Chat,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Meet new people
              </span>
            </h2>
            
            <p className="text-lg text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Find strangers worldwide, the new modern Omegle and OmeTV alternative. Connect with real people, enjoy ad free text and video chats, and build genuine friendships.
            </p>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left lg:text-left">
                <p className="text-blue-400 font-medium mb-4">🤝 Strangers turned friends</p>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
                  Chat with Random Strangers With Similar{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Interests
                  </span>
                </h3>
                
                <p className="text-gray-300 leading-relaxed max-w-md">
                  Talk to online strangers who love what you love, Chat about hobbies and enjoy fun conversations - all from one place! Making new friends based on interests is made easy.
                </p>
              </div>

              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 max-w-sm mx-auto">
                  <h4 className="font-bold mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Interests
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Football', color: 'bg-green-500' },
                        { name: 'Discord', color: 'bg-indigo-500' },
                        { name: 'Anime', color: 'bg-pink-500' }
                      ].map((interest) => (
                        <span 
                          key={interest.name}
                          className={`${interest.color} px-3 py-1 rounded-full text-sm font-medium text-white flex items-center gap-1 hover:scale-105 transition-transform cursor-pointer`}
                        >
                          <span>×</span>
                          {interest.name}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full bg-white/10 border border-dashed border-white/30 rounded-full px-4 py-2 text-sm text-gray-300 hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                      <span>+</span>
                      Add Interest
                    </button>
                  </div>
                </div>

                {/* Floating decorations */}
                <FloatingEmoji emoji="🎮" className="absolute -top-4 -left-4" />
                <FloatingEmoji emoji="⭐" className="absolute -top-2 -right-6" delay={1} />
                <FloatingEmoji emoji="🎯" className="absolute top-1/2 -left-8" delay={2} />
                <FloatingEmoji emoji="✨" className="absolute bottom-4 -right-4" delay={0.5} />
              </div>
            </div>
          </section>
        </IntersectionObserver>

        {/* Features Section */}
        <IntersectionObserver>
          <section id="features" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                The best site to Chat with{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Strangers
                </span>
              </h2>
              
              <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Many text and video chat apps offer various features for meeting random strangers, but not all of them are modern, secure and feature rich with diverse interesting people from around the globe.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
               
                {
                  icon: MessageCircle,
                  title: 'Text Chat',
                  description: 'Not in the mood for video? No problem! You can also chat with strangers via text messages. Full of features.',
                  gradient: 'from-blue-500 to-purple-500'
                },
                {
                  icon: Shield,
                  title: 'Safety & Moderation',
                  description: 'We make use of advanced AI technologies and enhanced spam protection to keep your chats clean.',
                  gradient: 'from-green-500 to-emerald-500'
                },
                {
                  icon: Globe,
                  title: 'Feature Rich',
                  description: 'From sending photos, videos, having voice calls, to sharing GIFs and adding avatars, we have it all.',
                  gradient: 'from-yellow-500 to-orange-500'
                }
              ].map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center hover:bg-white/10 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer group"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </IntersectionObserver>

        {/* Testimonials Section */}
        <IntersectionObserver>
          <section id="testimonials" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Don't take our{' '}
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  word for it
                </span>
              </h2>
              
              <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
                We've asked random strangers to try our platform. Here's what they had to say about our safe space for chatting with strangers:
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {[
                {
                  text: "I've tried many platforms to video chat with strangers, but they were all flawed! ChitChat seems like the best Omegle alternative, and I've been really enjoying it!",
                  name: "Stranger #4",
                  role: "Premium User",
                  gradient: "from-blue-500 to-purple-500",
                  rating: 5
                },
                {
                  text: "ChitChat is the best Omegle alternative I've tried! It made connecting with strangers through video chat fun and easy. It's user-friendly, quick, and engaging.",
                  name: "Stranger #1",
                  role: "Beta Tester",
                  gradient: "from-pink-500 to-teal-500",
                  rating: 5
                },
                {
                  text: "I recently felt lonely and struggled to make friends, but this app changed that. It's simple to find someone to chat with, and I've made friends from all over the globe.",
                  name: "Stranger #2",
                  role: "Regular User",
                  gradient: "from-orange-500 to-yellow-500",
                  rating: 4
                }
              ].map((testimonial, index) => (
                <div 
                  key={index}
                  className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 ${
                    currentTestimonial === index ? 'ring-2 ring-blue-500/50 -translate-y-1' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl text-blue-400">"</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, starIndex) => (
                        <Star 
                          key={starIndex}
                          className={`w-4 h-4 ${
                            starIndex < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6 leading-relaxed">{testimonial.text}</p>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-3">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    currentTestimonial === index 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-white/30 hover:bg-blue-400'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </section>
        </IntersectionObserver>

        {/* Call to Action */}
        <IntersectionObserver>
          <section id="contact" className="py-16">
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl border border-white/10 p-8 lg:p-12 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                  Ready to make{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    new friends?
                  </span>
                </h2>
                
                <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
                  Join thousands of people already chatting and making connections worldwide. Your next best friend is just one click away!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <button 
                    onClick={() => handleNavigation('/chat')}
                    className="px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 flex items-center justify-center"
                  >
                    <span className="mr-2">🚀</span>
                    Start Chatting Now
                  </button>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="px-8 py-3 text-lg font-semibold text-slate-900 bg-white rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center"
                  >
                    <span className="mr-2">✨</span>
                    Learn More
                  </button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { number: '50K+', label: 'Active Users', icon: '👥' },
                    { number: '1M+', label: 'Connections Made', icon: '🤝' },
                    { number: '150+', label: 'Countries', icon: '🌍' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-200 hover:-translate-y-1">
                      <div className="text-2xl mb-2">{stat.icon}</div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {stat.number}
                      </div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </IntersectionObserver>

        {/* Footer */}
        <IntersectionObserver>
          <footer className="pt-16 border-t border-white/10">
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {[
                  { icon: '🌟', text: 'Premium Features' },
                  { icon: '🔒', text: 'Secure & Private' },
                  { icon: '🌍', text: 'Global Community' },
                  { icon: '⚡', text: 'Instant Connect' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                    <span>{feature.icon}</span>
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-gray-500 mb-4">
                © 2024 ChitChat - Connect with strangers, make friends worldwide
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                {['Terms', 'Privacy', 'Support', 'Community'].map((link) => (
                  <button key={link} className="hover:text-blue-400 transition-colors">
                    {link}
                  </button>
                ))}
              </div>
            </div>
          </footer>
        </IntersectionObserver>
      </div>
      
      {/* Floating action button */}
      <div className="fixed bottom-8 right-8 z-50 hidden lg:block">
        <button 
          onClick={() => handleNavigation('/chat')}
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-500/25 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-200 animate-pulse"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Frontpage;