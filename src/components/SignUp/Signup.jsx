import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const SignupContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  padding: theme.spacing(3),
}));

const SignupForm = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '450px',
  padding: theme.spacing(4),
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  animation: 'fadeIn 0.8s ease-out',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

const SignupButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4ECDC4 30%, #44A08D 90%)',
  color: 'white',
  padding: '12px 24px',
  borderRadius: '50px',
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  width: '100%',
  marginTop: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #3dbeb5 30%, #348f7d 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 20px rgba(78, 205, 196, 0.3)',
  },
}));

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    console.log('Form data:', { username, email, password: '***', gender });

    try {
      console.log('Sending signup request...');
      const response = await axios.post(
        'https://ondealchatapp.onrender.com/signup',
        { username, email, password, gender },
        { withCredentials: true }
      );

      console.log('Signup response:', response);

      if (response.status === 201) {
        alert('Signup successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <SignupContainer maxWidth={false}>
      <SignupForm component="form" onSubmit={handleSignup}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            marginBottom: 4,
            background: 'linear-gradient(45deg, #ffffff 30%, #4ECDC4 70%, #44A08D 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}
        >
          Create Your Account
        </Typography>

        {/* Username */}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          sx={{
            marginBottom: 3,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          }}
        />

        {/* Email */}
        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{
            marginBottom: 3,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          }}
        />

        {/* Password with eye icon toggle */}
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{
            marginBottom: 3,
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
            },
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Gender */}
        <FormControl
          fullWidth
          sx={{
            marginBottom: 3,
            '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
              '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
            },
          }}
        >
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            value={gender}
            label="Gender"
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="trans">Trans</MenuItem>
            <MenuItem value="other">Other</MenuItem>
            <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
          </Select>
        </FormControl>

        {/* Error message */}
        {error && (
          <Typography
            color="error"
            sx={{ marginBottom: 2, textAlign: 'center', color: '#FF6B6B' }}
          >
            {error}
          </Typography>
        )}

        {/* Signup button */}
        <SignupButton type="submit">Sign Up</SignupButton>

        {/* Redirect to login */}
        <Typography
          variant="body2"
          sx={{
            marginTop: 3,
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.6)',
            '& a': {
              color: '#4ECDC4',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            },
          }}
        >
          Already have an account? <a href="/login">Log in</a>
        </Typography>
      </SignupForm>
    </SignupContainer>
  );
};

export default Signup;
