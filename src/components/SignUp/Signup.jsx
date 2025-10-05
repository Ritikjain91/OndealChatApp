import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '../Context/AuthContext';

const SignupContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
    animation: 'pulse 15s ease-in-out infinite',
  },
  '@keyframes pulse': {
    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
    '50%': { transform: 'translate(50px, 50px) scale(1.1)' },
  },
}));

const SignupForm = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '480px',
  padding: theme.spacing(5),
  borderRadius: '24px',
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
  animation: 'fadeInUp 1s ease-out',
  position: 'relative',
  zIndex: 1,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset',
  },
  '@keyframes fadeInUp': {
    from: { 
      opacity: 0, 
      transform: 'translateY(40px) scale(0.95)',
    },
    to: { 
      opacity: 1, 
      transform: 'translateY(0) scale(1)',
    },
  },
}));

const SignupButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: 'white',
  padding: '14px 28px',
  borderRadius: '50px',
  fontSize: '1.05rem',
  fontWeight: 700,
  textTransform: 'none',
  width: '100%',
  marginTop: theme.spacing(3),
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover': {
    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
  },
  '&:hover::before': {
    left: '100%',
  },
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.5)',
    transform: 'none',
    boxShadow: 'none',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': { 
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      '& fieldset': { 
        borderColor: 'rgba(255, 255, 255, 0.4)',
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      '& fieldset': { 
        borderColor: '#667eea',
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': { 
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
  },
  '& .MuiInputLabel-root.Mui-focused': { 
    color: '#667eea',
    fontWeight: 600,
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    '& fieldset': { 
      borderColor: 'rgba(255, 255, 255, 0.25)',
      borderWidth: '1.5px',
    },
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      '& fieldset': { 
        borderColor: 'rgba(255, 255, 255, 0.4)',
      },
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      '& fieldset': { 
        borderColor: '#667eea',
        borderWidth: '2px',
      },
    },
  },
  '& .MuiInputLabel-root': { 
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
  },
  '& .MuiInputLabel-root.Mui-focused': { 
    color: '#667eea',
    fontWeight: 600,
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
}));

const API_BASE_URL = 'https://ondealchatapp.onrender.com';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  // Use useEffect to handle navigation after successful signup
  useEffect(() => {
    if (signupSuccess && currentUser) {
      console.log('Signup - useEffect - User authenticated, navigating to /chat');
      navigate('/chat');
    }
  }, [signupSuccess, currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSignupSuccess(false);

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.gender) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      console.log('Sending signup request...');
      const response = await axios.post(
        `${API_BASE_URL}/signup`,
        { 
          username: formData.username, 
          email: formData.email, 
          password: formData.password, 
          gender: formData.gender 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Signup response:', response);

      if (response.status === 201) {
        const data = response.data;
        console.log('Signup successful:', data);
        
        // Debug: Check the exact structure
        console.log('User in response:', data.user);
        console.log('Token in response:', data.token);
        
        if (!data.user || !data.token) {
          setError("Signup is done");
          setLoading(false);
          return;
        }
        
        // Store both user data and token in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        console.log('Signup - User and token stored in localStorage');
        
        // Verify storage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        console.log('Signup - Verification - Stored user:', storedUser);
        console.log('Signup - Verification - Stored token:', storedToken ? 'Token exists' : 'No token');

        // Update auth context
        console.log('Signup - Calling auth context login');
        login(data.user, data.token);
        
        // Set success flag - navigation will be handled by useEffect
        console.log('Signup - Setting signupSuccess to true');
        setSignupSuccess(true);
      }
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Signup failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SignupContainer maxWidth={false}>
      <SignupForm component="form" onSubmit={handleSignup}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              background: 'linear-gradient(45deg, #ffffff 30%, #667eea 70%, #764ba2 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              marginBottom: 1,
              letterSpacing: '-0.5px',
            }}
          >
            Create Account
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 400,
            }}
          >
            Join our community today
          </Typography>
        </Box>

        {/* Username */}
        <StyledTextField
          fullWidth
          label="Username"
          name="username"
          variant="outlined"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ marginBottom: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Email */}
        <StyledTextField
          fullWidth
          label="Email Address"
          name="email"
          variant="outlined"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ marginBottom: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Password */}
        <StyledTextField
          fullWidth
          label="Password"
          name="password"
          variant="outlined"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ marginBottom: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  disabled={loading}
                  sx={{ 
                    color: "rgba(255,255,255,0.7)",
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#667eea',
                    },
                  }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <StyledTextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          variant="outlined"
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ marginBottom: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  edge="end"
                  disabled={loading}
                  sx={{ 
                    color: "rgba(255,255,255,0.7)",
                    transition: 'color 0.3s ease',
                    '&:hover': {
                      color: '#667eea',
                    },
                  }}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Gender */}
        <StyledFormControl fullWidth sx={{ marginBottom: 3 }}>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            name="gender"
            value={formData.gender}
            label="Gender"
            onChange={handleChange}
            required
            disabled={loading}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="trans">Trans</MenuItem>
            <MenuItem value="other">Other</MenuItem>
            <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
          </Select>
        </StyledFormControl>

        {/* Error message */}
        {error && (
          <Box
            sx={{
              marginBottom: 2,
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(255, 107, 107, 0.15)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              animation: 'shake 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              '@keyframes shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(-10px)' },
                '75%': { transform: 'translateX(10px)' },
              },
            }}
          >
            <ErrorOutlineIcon sx={{ color: '#FF6B6B', fontSize: '24px' }} />
            <Typography 
              sx={{ 
                color: '#FF6B6B',
                fontSize: '0.95rem',
                fontWeight: 500,
                flex: 1,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Signup button */}
        <SignupButton 
          type="submit" 
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HowToRegIcon />}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </SignupButton>

        {/* Redirect to login */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 400,
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: 600,
                position: 'relative',
                transition: 'color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#667eea';
              }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </SignupForm>
    </SignupContainer>
  );
};

export default Signup;