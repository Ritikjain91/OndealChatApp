import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled, keyframes } from '@mui/material/styles';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(50px); }
  to { opacity: 1; transform: translateX(0); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-15px); }
  70% { transform: translateY(-7px); }
  90% { transform: translateY(-3px); }
`;

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  background: 'transparent',
  color: 'white',
  paddingTop: '2rem',
  paddingBottom: '14rem',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '80vh',
  gap: '4rem',
  animation: `${fadeInUp} 1s ease-out`,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const LeftContent = styled(Box)(({ theme }) => ({
  flex: 1,
  maxWidth: '500px',
  animation: `${slideInLeft} 1s ease-out`,
}));

const RightContent = styled(Box)(({ theme }) => ({
  flex: 1,
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  animation: `${slideInRight} 1s ease-out 0.2s both`,
}));

const VideoMockup = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '600px',
}));

const VideoCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '1rem',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  marginBottom: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
    border: '1px solid rgba(102, 126, 234, 0.4)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '50px',
  padding: '12px 32px',
  fontSize: '1.1rem',
  fontWeight: '600',
  textTransform: 'none',
  margin: '0 8px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
  [theme.breakpoints.down('sm')]: {
    margin: '8px 0',
    width: '100%',
  },
}));

const TextChatButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
  },
}));

const VideoChatButton = styled(ActionButton)(({ theme }) => ({
  background: 'white',
  color: '#333',
  '&:hover': {
    background: '#f5f5f5',
    transform: 'translateY(-3px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  },
}));

const FloatingEmoji = styled(Box)(({ theme, delay = 0 }) => ({
  position: 'absolute',
  fontSize: '2rem',
  animation: `${float} 3s ease-in-out ${delay}s infinite`,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.3)',
    animation: `${bounce} 0.8s ease`,
  },
}));

const GlowingOrb = styled(Box)(({ theme, color = '#667eea' }) => ({
  position: 'absolute',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${color}20, transparent)`,
  filter: 'blur(40px)',
  animation: `${pulse} 4s ease-in-out infinite`,
  zIndex: -1,
}));

const AnimatedSection = styled(Box)(({ theme }) => ({
  opacity: 0,
  transform: 'translateY(50px)',
  transition: 'all 0.8s ease',
  '&.visible': {
    opacity: 1,
    transform: 'translateY(0)',
  },
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '2rem',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
  },
}));

const TestimonialCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '20px',
  padding: '2rem',
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  textAlign: 'left',
  position: 'relative',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px)',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.2)',
  },
}));

const PulsatingDot = styled(Box)(({ theme, active = false }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: active ? '#667eea' : 'rgba(255, 255, 255, 0.3)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  animation: active ? `${pulse} 2s infinite` : 'none',
  '&:hover': {
    transform: 'scale(1.2)',
    background: '#667eea',
  },
}));

const StickerPack = styled(Box)(({ theme }) => ({
  position: 'absolute',
  animation: `${rotate} 20s linear infinite`,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    animation: 'none',
    transform: 'scale(1.2)',
  },
}));

// Floating stickers data
const floatingStickers = [
  { emoji: '🎉', top: '10%', left: '5%', delay: 0 },
  { emoji: '✨', top: '20%', right: '10%', delay: 1 },
  { emoji: '🌟', top: '60%', left: '8%', delay: 2 },
  { emoji: '💫', top: '80%', right: '15%', delay: 0.5 },
  { emoji: '🎨', top: '40%', left: '2%', delay: 1.5 },
  { emoji: '🚀', top: '70%', right: '5%', delay: 2.5 },
];

const IntersectionObserver = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();

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
    <AnimatedSection ref={ref} className={isVisible ? 'visible' : ''}>
      {children}
    </AnimatedSection>
  );
};

const Frontpage = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%)', 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <GlowingOrb style={{ top: '10%', left: '10%' }} color="#667eea" />
      <GlowingOrb style={{ top: '60%', right: '10%' }} color="#764ba2" />
      <GlowingOrb style={{ bottom: '20%', left: '20%' }} color="#FF6B6B" />
      
      {/* Floating stickers */}
      {floatingStickers.map((sticker, index) => (
        <FloatingEmoji
          key={index}
          style={{ 
            top: sticker.top, 
            left: sticker.left, 
            right: sticker.right 
          }}
          delay={sticker.delay}
        >
          {sticker.emoji}
        </FloatingEmoji>
      ))}
      
      <StyledContainer maxWidth="xl">
        <ContentWrapper>
          <LeftContent>
            <Typography 
              variant="h1" 
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                fontWeight: 'bold',
                lineHeight: 1.2,
                marginBottom: '1.5rem',
                background: 'linear-gradient(45deg, #ffffff 30%, #667eea 70%, #764ba2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${fadeInUp} 1s ease-out 0.5s both`,
              }}
            >
              Talk to strangers,<br />
              <span style={{ color: '#667eea' }}>Make friends!</span>
            </Typography>
            
            <Typography 
              variant="h5" 
              component="p"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                fontWeight: 400,
                marginBottom: '3rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.6,
                animation: `${fadeInUp} 1s ease-out 0.7s both`,
              }}
            >
              Experience a random chat alternative to find friends, connect with people, and chat with strangers from all over the world!
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: '1rem',
              animation: `${fadeInUp} 1s ease-out 0.9s both`,
            }}>
              <TextChatButton startIcon={<span>💬</span>}>
                Chat Without Login 
              </TextChatButton>
              <VideoChatButton startIcon={<span>📹</span>}>
                Chat With Login
              </VideoChatButton>
            </Box>
          </LeftContent>
          
          <RightContent>
            <VideoMockup>
              {/* Main video chat interface mockup */}
              <VideoCard sx={{ position: 'relative' }}>
                <Box sx={{ 
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  height: '200px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%)',
                    backgroundSize: '20px 20px',
                    animation: `${slideInRight} 10s linear infinite`,
                  }
                }}>
                  <Typography variant="h6" color="white" sx={{ zIndex: 1, fontWeight: 600 }}>
                    Video Chat Preview
                  </Typography>
                </Box>
                
                {/* Enhanced user info overlay */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: '20px', 
                  left: '20px',
                  background: 'rgba(0, 0, 0, 0.8)',
                  borderRadius: '25px',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}>
                  <Box sx={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fff',
                      animation: `${pulse} 2s infinite`,
                    }
                  }} />
                  <Typography variant="body2" color="white" sx={{ fontWeight: 500 }}>Jon Snow</Typography>
                </Box>
              </VideoCard>
              
              {/* Enhanced notification mockup */}
              <Box sx={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                animation: `${bounce} 2s ease 2s infinite`,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}>
                <Typography variant="body2" color="black" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontWeight: 500 
                }}>
                  🔔 New Notification
                </Typography>
              </Box>
              
              {/* Enhanced sticker pack */}
              <StickerPack style={{ top: '50px', right: '-30px' }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  backdropFilter: 'blur(10px)',
                }}>
                  {['😂', '❤️', '😍', '👍'].map((emoji, index) => (
                    <Box key={index} sx={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.2)',
                      }
                    }}>
                      {emoji}
                    </Box>
                  ))}
                </Box>
              </StickerPack>
            </VideoMockup>
          </RightContent>
        </ContentWrapper>

        {/* Enhanced Second Section - Anonymous Chat */}
        <IntersectionObserver>
          <Box sx={{ 
            textAlign: 'center', 
            marginTop: '8rem',
            marginBottom: '4rem' 
          }}>
            <Box sx={{ 
              display: 'inline-block',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              borderRadius: '25px',
              padding: '10px 24px',
              marginBottom: '2rem',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: `${slideInRight} 2s infinite`,
              }
            }}>
              <Typography variant="body2" color="white" sx={{ fontWeight: 600, position: 'relative', zIndex: 1 }}>
                ✨ Reach people like you
              </Typography>
            </Box>

            <Typography 
              variant="h2" 
              component="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ffffff 30%, #667eea 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2rem',
                lineHeight: 1.3,
              }}
            >
              Anonymous Chat, Meet new people
            </Typography>
            
            <Typography 
              variant="h5" 
              component="p"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.2rem' },
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '6rem',
                maxWidth: '800px',
                margin: '0 auto 6rem auto',
                lineHeight: 1.6,
              }}
            >
              Find strangers worldwide, the new modern Omegle and OmeTV alternative. Connect with real people, enjoy ad free text and video chats, and build genuine friendships.
            </Typography>

            {/* Enhanced interests section with more interactive elements */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '4rem',
              [theme => theme.breakpoints.down('md')]: {
                flexDirection: 'column',
              }
            }}>
              <Box sx={{ 
                flex: 1, 
                textAlign: 'left',
                [theme => theme.breakpoints.down('md')]: {
                  textAlign: 'center',
                }
              }}>
                <Typography 
                  variant="body1" 
                  sx={{
                    color: '#667eea',
                    fontStyle: 'italic',
                    marginBottom: '1rem',
                    fontSize: '1.1rem',
                    fontWeight: 500,
                  }}
                >
                  🤝 Strangers turned friends
                </Typography>
                
                <Typography 
                  variant="h3" 
                  component="h3"
                  sx={{
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '1.5rem',
                    lineHeight: 1.3,
                  }}
                >
                  Chat with Random Strangers With Similar{' '}
                  <span style={{ 
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>Interests</span>
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.1rem',
                    lineHeight: 1.6,
                    maxWidth: '500px',
                  }}
                >
                  Talk to online strangers who love what you love, Chat about hobbies and enjoy fun conversations - all from one place! Making new friends based on interests is made easy.
                </Typography>
              </Box>

              <Box sx={{ 
                flex: 1, 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
              }}>
                {/* Enhanced interests panel */}
                <Box sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '2rem',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  minWidth: '300px',
                  position: 'relative',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
                  }
                }}>
                  <Typography variant="h6" color="white" sx={{ marginBottom: '1.5rem', fontWeight: 700 }}>
                    🎯 Interests
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
                    {[
                      { name: 'Football', color: '#4CAF50' },
                      { name: 'Discord', color: '#7289DA' },
                      { name: 'Anime', color: '#FF6B6B' }
                    ].map((interest, index) => (
                      <Box key={interest.name} sx={{
                        background: `linear-gradient(45deg, ${interest.color}, ${interest.color}dd)`,
                        color: 'white',
                        padding: '8px 14px',
                        borderRadius: '25px',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        fontWeight: 500,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 4px 15px ${interest.color}40`,
                        }
                      }}>
                        <span>×</span> {interest.name}
                      </Box>
                    ))}
                  </Box>
                  
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '8px 14px',
                    borderRadius: '25px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px dashed rgba(255, 255, 255, 0.3)',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px dashed rgba(255, 255, 255, 0.5)',
                    }
                  }}>
                    <span>+</span> Add Interest
                  </Box>
                </Box>

                {/* Enhanced floating decorations */}
                {[
                  { emoji: '🎮', top: '10px', left: '10px', delay: 0 },
                  { emoji: '⭐', top: '30px', right: '20px', delay: 1 },
                  { emoji: '🎯', top: '50%', left: '-20px', delay: 2 },
                  { emoji: '✨', bottom: '100px', right: '10px', delay: 0.5 },
                  { emoji: '🎨', bottom: '20px', left: '50px', delay: 1.5 },
                  { emoji: '🚀', top: '60%', right: '-10px', delay: 2.5 }
                ].map((item, index) => (
                  <FloatingEmoji
                    key={index}
                    style={{ 
                      top: item.top,
                      bottom: item.bottom,
                      left: item.left,
                      right: item.right,
                      fontSize: '2.5rem'
                    }}
                    delay={item.delay}
                  >
                    {item.emoji}
                  </FloatingEmoji>
                ))}
              </Box>
            </Box>
          </Box>
        </IntersectionObserver>

        {/* Enhanced Features Grid */}
        <IntersectionObserver>
          <Box sx={{ 
            textAlign: 'center', 
            marginTop: '8rem',
            marginBottom: '6rem' 
          }}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ffffff 30%, #667eea 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2rem',
                lineHeight: 1.3,
              }}
            >
              The best site to Chat with Male and Female Strangers.
            </Typography>
            
            <Typography 
              variant="h6" 
              component="p"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '4rem',
                maxWidth: '900px',
                margin: '0 auto 4rem auto',
                lineHeight: 1.6,
              }}
            >
              Many text and video chat apps offer various features for meeting random strangers or chatting without bots, but not all of them are modern, secure and feature rich with a diverse interesting people from around the globe.
            </Typography>

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: '2rem',
              marginTop: '4rem'
            }}>
              {[
                {
                  icon: '📹',
                  title: 'Video Chat',
                  description: 'Experience authentic face to face encounters with real people from all over the world.',
                  gradient: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                },
                {
                  icon: '👥',
                  title: 'Friends & History',
                  description: 'Had a fun chat but skipped by accident? Find them in your chat history and add them as a friend.',
                  gradient: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)'
                },
                {
                  icon: '🏷️',
                  title: 'Search Filters',
                  description: 'Want to narrow down your search? Use interests, genders or locations to filter the strangers you meet.',
                  gradient: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)'
                },
                {
                  icon: '💬',
                  title: 'Text Chat',
                  description: 'Not in the mood for video? No problem! You can also chat with strangers via text messages. Full of features.',
                  gradient: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)'
                },
                {
                  icon: '🛡️',
                  title: 'Safety & Moderation',
                  description: 'We make use of advanced AI technologies and enhanced spam protection to keep your chats clean.',
                  gradient: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)'
                },
                {
                  icon: '⭐',
                  title: 'Feature rich',
                  description: 'From sending photos, videos, having voice calls, to sharing GIFs and adding avatars, we have it all.',
                  gradient: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)'
                }
              ].map((feature, index) => (
                <FeatureCard key={index}>
                  <Box sx={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: feature.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem auto',
                    fontSize: '2rem',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '-5px',
                      left: '-5px',
                      right: '-5px',
                      bottom: '-5px',
                      borderRadius: '50%',
                      background: feature.gradient,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      zIndex: -1,
                      filter: 'blur(10px)',
                    },
                    '&:hover::after': {
                      opacity: 0.7,
                    }
                  }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" color="white" sx={{ marginBottom: '1rem', fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </FeatureCard>
              ))}
            </Box>
          </Box>
        </IntersectionObserver>

        {/* Enhanced Video Chat Section */}
        <IntersectionObserver>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '4rem',
            marginTop: '8rem',
            marginBottom: '6rem',
            [theme => theme.breakpoints.down('md')]: {
              flexDirection: 'column',
            }
          }}>
            <Box sx={{ 
              flex: 1, 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <Box sx={{ position: 'relative' }}>
                {/* Enhanced video windows */}
                <Box sx={{
                  width: '220px',
                  height: '160px',
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  borderRadius: '20px',
                  border: '3px solid #667eea',
                  position: 'relative',
                  zIndex: 2,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                  }
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    fontSize: '4rem',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}>🙂</Box>
                  
                  {/* Video controls overlay */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    {['🎤', '📹', '⚙️'].map((icon, index) => (
                      <Box key={index} sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        }
                      }}>
                        {icon}
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{
                  width: '220px',
                  height: '160px',
                  background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
                  borderRadius: '20px',
                  border: '3px solid #4ECDC4',
                  position: 'absolute',
                  top: '60px',
                  left: '140px',
                  zIndex: 1,
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                  }
                }}>
                  <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    fontSize: '4rem',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                  }}>😊</Box>
                </Box>
                
                {/* Enhanced floating reactions */}
                {[
                  { emoji: '🔥', top: '-30px', left: '100px', delay: 0 },
                  { emoji: '😊', top: '20px', right: '-50px', delay: 1 },
                  { emoji: '✈️', bottom: '140px', left: '-40px', delay: 2 },
                  { emoji: '😮', bottom: '40px', right: '30px', delay: 0.5 },
                  { emoji: '😱', bottom: '-20px', left: '70px', delay: 1.5 },
                  { emoji: '✅', top: '100px', left: '-30px', delay: 2.5 }
                ].map((reaction, index) => (
                  <FloatingEmoji
                    key={index}
                    style={{ 
                      ...reaction,
                      fontSize: '2.5rem',
                      zIndex: 3
                    }}
                    delay={reaction.delay}
                  >
                    {reaction.emoji}
                  </FloatingEmoji>
                ))}

                {/* Connection status indicator */}
                <Box sx={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(76, 175, 80, 0.9)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 4
                }}>
                  <Box sx={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#fff',
                    animation: `${pulse} 1s infinite`
                  }} />
                  Connected
                </Box>
              </Box>
            </Box>

            <Box sx={{ 
              flex: 1, 
              textAlign: 'left',
              [theme => theme.breakpoints.down('md')]: {
                textAlign: 'center',
              }
            }}>
              <Typography 
                variant="body1" 
                sx={{
                  color: '#667eea',
                  fontStyle: 'italic',
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                🌍 Say hello to strangers worldwide
              </Typography>
              
              <Typography 
                variant="h3" 
                component="h3"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem',
                  lineHeight: 1.3,
                }}
              >
                Simple and <span style={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Fun</span> Video Chats
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                }}
              >
                Enjoy video chats with strangers worldwide, our platform is designed to make it easy and safe to connect with people from all over the world. Meet new people, make friends, and have fun!
              </Typography>
            </Box>
          </Box>
        </IntersectionObserver>

        {/* Enhanced Testimonials Section */}
        <IntersectionObserver>
          <Box sx={{ 
            textAlign: 'center', 
            marginTop: '8rem',
            marginBottom: '4rem' 
          }}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ffffff 30%, #667eea 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2rem',
                lineHeight: 1.3,
              }}
            >
              Don't take our word for it
            </Typography>
            
            <Typography 
              variant="h6" 
              component="p"
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem' },
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '4rem',
                maxWidth: '900px',
                margin: '0 auto 4rem auto',
                lineHeight: 1.6,
              }}
            >
              We've asked random strangers, both men and women, to try our Omegle alternative platform for video and text chat. Here's what they had to say about our safe space for chatting with strangers:
            </Typography>

            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: '2rem',
              marginTop: '4rem'
            }}>
              {[
                {
                  text: "I've tried many platforms to video chat with strangers, but they were all flawed! Chitchat seems like the best Omegle alternative, and I've been really enjoying it! I hope it becomes the number one platform for random video chat because it really deserves it. I've made lots of friends from different countries and I'm thrilled with the safe, fun environment it provides.",
                  name: "Stranger #4",
                  role: "Premium User",
                  gradient: "linear-gradient(45deg, #667eea, #764ba2)",
                  rating: 5
                },
                {
                  text: "Chitchat.gg is the best Omegle alternative I've tried! It made connecting with strangers through video chat fun and easy. It's user-friendly, quick, and I've had engaging conversations with people worldwide. A fantastic way to meet new people and find friends in a safe environment.",
                  name: "Stranger #1",
                  role: "Beta Tester",
                  gradient: "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
                  rating: 5
                },
                {
                  text: "I recently felt lonely and struggled to make friends, but this Monkey app and Ome.tv alternative changed that. It's simple to find someone to text chat or video chat with, and I've made new friends from all over the globe. We've even added each other on Discord and Snapchat. A real game-changer for safely chatting with strangers!",
                  name: "Stranger #2",
                  role: "Regular User",
                  gradient: "linear-gradient(45deg, #FF6B35, #F7931E)",
                  rating: 4
                }
              ].map((testimonial, index) => (
                <TestimonialCard 
                  key={index}
                  sx={{
                    transform: currentTestimonial === index ? 'translateY(-5px)' : 'translateY(0)',
                    boxShadow: currentTestimonial === index ? '0 20px 40px rgba(102, 126, 234, 0.3)' : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <Typography variant="h4" color="#667eea" sx={{ fontSize: '3rem', lineHeight: 1 }}>
                      "
                    </Typography>
                    <Box sx={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, starIndex) => (
                        <Box key={starIndex} sx={{
                          color: starIndex < testimonial.rating ? '#FFD700' : 'rgba(255, 255, 255, 0.3)',
                          fontSize: '1rem'
                        }}>
                          ⭐
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="rgba(255, 255, 255, 0.8)" sx={{ 
                    marginBottom: '2rem', 
                    lineHeight: 1.6,
                    fontSize: '0.95rem' 
                  }}>
                    {testimonial.text}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box sx={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      background: testimonial.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '-2px',
                        left: '-2px',
                        right: '-2px',
                        bottom: '-2px',
                        borderRadius: '50%',
                        background: testimonial.gradient,
                        opacity: 0.3,
                        zIndex: -1,
                        filter: 'blur(4px)',
                      }
                    }}>
                      👤
                    </Box>
                    <Box>
                      <Typography variant="body2" color="white" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </TestimonialCard>
              ))}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px', 
              marginTop: '3rem' 
            }}>
              {[0, 1, 2].map((index) => (
                <PulsatingDot 
                  key={index} 
                  active={currentTestimonial === index}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </Box>
          </Box>
        </IntersectionObserver>

        {/* Enhanced Friends Section */}
        <IntersectionObserver>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '4rem',
            marginBottom: '6rem',
            [theme => theme.breakpoints.down('md')]: {
              flexDirection: 'column-reverse',
            }
          }}>
            <Box sx={{ 
              flex: 1, 
              textAlign: 'left',
              [theme => theme.breakpoints.down('md')]: {
                textAlign: 'center',
              }
            }}>
              <Typography 
                variant="body1" 
                sx={{
                  color: '#667eea',
                  fontStyle: 'italic',
                  marginBottom: '1rem',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                💫 Make the most out of your chats
              </Typography>
              
              <Typography 
                variant="h3" 
                component="h3"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 'bold',
                  color: 'white',
                  marginBottom: '1.5rem',
                  lineHeight: 1.3,
                }}
              >
                From Strangers to <span style={{ 
                  background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Friends</span>
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                }}
              >
                Discover new people, make real and genuine connections, learn new languages or just have casual text or video chats. Our platform is designed to help you experience the best of online chatting.
              </Typography>
            </Box>

            <Box sx={{ 
              flex: 1, 
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              {/* Enhanced central friendship hub */}
              <Box sx={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '-10px',
                  right: '-10px',
                  bottom: '-10px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  opacity: 0.3,
                  filter: 'blur(20px)',
                  zIndex: -1,
                  animation: `${pulse} 3s infinite`,
                }
              }}>
                🤝
              </Box>

              {/* Enhanced chat interface */}
              <Box sx={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.5rem',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '280px',
                zIndex: 3,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
                }
              }}>
                <Typography variant="body2" color="white" sx={{ 
                  marginBottom: '1rem', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💬 DIRECT MESSAGES
                  <Box sx={{
                    background: '#ff4757',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    animation: `${pulse} 2s infinite`
                  }}>5</Box>
                </Typography>
                
                {[
                  { name: 'Wisecrack', status: 'online', hasMessage: true },
                  { name: 'Snarky', status: 'online', hasMessage: false },
                  { name: 'SassMaster', status: 'away', hasMessage: false },
                  { name: 'Chuckles', status: 'online', hasMessage: false },
                  { name: 'Egghead', status: 'offline', hasMessage: false }
                ].map((user, index) => (
                  <Box key={user.name} sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 0',
                    borderBottom: index < 4 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    transition: 'background 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                    }
                  }}>
                    <Box sx={{ 
                      width: '10px', 
                      height: '10px', 
                      borderRadius: '50%', 
                      background: user.status === 'online' ? '#4CAF50' : user.status === 'away' ? '#FFA726' : '#757575',
                      animation: user.status === 'online' ? `${pulse} 2s infinite` : 'none'
                    }} />
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" sx={{ flex: 1 }}>
                      {user.name}
                    </Typography>
                    {user.hasMessage && (
                      <Box sx={{ 
                        background: '#ff4757', 
                        borderRadius: '50%', 
                        width: '16px', 
                        height: '16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '10px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>4</Box>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Enhanced floating decorations */}
              {[
                { emoji: '💙', top: '0px', left: '20px', delay: 0 },
                { emoji: '🎉', bottom: '120px', left: '-40px', delay: 1 },
                { emoji: '🌟', bottom: '0px', left: '40px', delay: 2 },
                { emoji: '✨', top: '40px', right: '150px', delay: 0.5 }
              ].map((item, index) => (
                <FloatingEmoji
                  key={index}
                  style={{ 
                    ...item,
                    fontSize: '2.5rem'
                  }}
                  delay={item.delay}
                >
                  {item.emoji}
                </FloatingEmoji>
              ))}
            </Box>
          </Box>
        </IntersectionObserver>

        {/* Enhanced Call to Action */}
        <IntersectionObserver>
          <Box sx={{ 
            textAlign: 'center', 
            marginTop: '8rem',
            marginBottom: '4rem',
            padding: '4rem 2rem',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.05) 0%, transparent 50%, rgba(118, 75, 162, 0.05) 100%)',
              animation: `${slideInRight} 10s linear infinite`,
            }
          }}>
            <Typography 
              variant="h2" 
              component="h2"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #ffffff 30%, #667eea 70%, #764ba2 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2rem',
                lineHeight: 1.3,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Ready to make new friends?
            </Typography>
            
            <Typography 
              variant="h5" 
              component="p"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.4rem' },
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '3rem',
                maxWidth: '700px',
                margin: '0 auto 3rem auto',
                lineHeight: 1.6,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Join thousands of people already chatting and making connections worldwide. Your next best friend is just one click away!
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: '1.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}>
              <TextChatButton 
                size="large" 
                startIcon={<span style={{ fontSize: '1.5rem' }}>🚀</span>}
                sx={{ 
                  fontSize: '1.2rem',
                  padding: '16px 40px',
                  minWidth: '200px'
                }}
              >
                Start Chatting Now
              </TextChatButton>
              <VideoChatButton 
                size="large" 
                startIcon={<span style={{ fontSize: '1.5rem' }}>✨</span>}
                sx={{ 
                  fontSize: '1.2rem',
                  padding: '16px 40px',
                  minWidth: '200px'
                }}
              >
                Learn More
              </VideoChatButton>
            </Box>
            
            {/* Floating stats */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '3rem',
              marginTop: '3rem',
              flexWrap: 'wrap'
            }}>
              {[
                { number: '50K+', label: 'Active Users', icon: '👥' },
                { number: '1M+', label: 'Connections Made', icon: '🤝' },
                { number: '150+', label: 'Countries', icon: '🌍' }
              ].map((stat, index) => (
                <Box key={index} sx={{
                  textAlign: 'center',
                  padding: '1rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  minWidth: '120px',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    background: 'rgba(255, 255, 255, 0.08)',
                  }
                }}>
                  <Typography variant="h4" sx={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {stat.icon}
                  </Typography>
                  <Typography variant="h5" color="white" sx={{
                    fontWeight: 'bold',
                    marginBottom: '0.25rem',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    {stat.number}
                  </Typography>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </IntersectionObserver>

        {/* Enhanced Footer Section */}
        <IntersectionObserver>
          <Box sx={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '4rem',
            marginTop: '6rem',
            textAlign: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              {[
                { icon: '🌟', text: 'Premium Features' },
                { icon: '🔒', text: 'Secure & Private' },
                { icon: '🌍', text: 'Global Community' },
                { icon: '⚡', text: 'Instant Connect' }
              ].map((feature, index) => (
                <Box key={index} sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{
              marginBottom: '1rem'
            }}>
              © 2024 ChitChat - Connect with strangers, make friends worldwide
            </Typography>
            
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {['Terms', 'Privacy', 'Support', 'Community'].map((link, index) => (
                <Typography 
                  key={link}
                  variant="caption" 
                  color="rgba(255, 255, 255, 0.6)"
                  sx={{
                    cursor: 'pointer',
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#667eea',
                    }
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>
        </IntersectionObserver>
      </StyledContainer>
      
      {/* Floating action button for quick access */}
      <Box sx={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        display: { xs: 'none', md: 'block' }
      }}>
        <Box sx={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
          transition: 'all 0.3s ease',
          animation: `${pulse} 3s infinite`,
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: '0 12px 35px rgba(102, 126, 234, 0.6)',
          }
        }}>
          <Typography sx={{ fontSize: '1.8rem' }}>💬</Typography>
        </Box>
      </Box>
    </div>
  );
};

export default Frontpage;