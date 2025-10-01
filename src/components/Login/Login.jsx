import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Button,
  TextField,
  Typography,
  Box,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";

// ================= Styled Components =================
const LoginContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
  padding: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "-50%",
    left: "-50%",
    width: "200%",
    height: "200%",
    background:
      "radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)",
    animation: "pulse 15s ease-in-out infinite",
  },
  "@keyframes pulse": {
    "0%, 100%": { transform: "translate(0, 0) scale(1)" },
    "50%": { transform: "translate(50px, 50px) scale(1.1)" },
  },
}));

const LoginForm = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: "480px",
  padding: theme.spacing(5),
  borderRadius: "24px",
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  boxShadow:
    "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
  animation: "fadeInUp 1s ease-out",
  position: "relative",
  zIndex: 1,
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow:
      "0 25px 70px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15) inset",
  },
  "@keyframes fadeInUp": {
    from: { opacity: 0, transform: "translateY(40px) scale(0.95)" },
    to: { opacity: 1, transform: "translateY(0) scale(1)" },
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
  color: "white",
  padding: "14px 28px",
  borderRadius: "50px",
  fontSize: "1.05rem",
  fontWeight: 700,
  textTransform: "none",
  width: "100%",
  marginTop: theme.spacing(3),
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
    transition: "left 0.6s ease",
  },
  "&:hover": {
    background: "linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)",
    transform: "translateY(-3px) scale(1.02)",
    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
  },
  "&:hover::before": {
    left: "100%",
  },
  "&:active": {
    transform: "translateY(-1px) scale(0.98)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.5)",
    boxShadow: "none",
    transform: "none",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    color: "white",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transition: "all 0.3s ease",
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.25)",
      borderWidth: "1.5px",
    },
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      "& fieldset": { borderColor: "#667eea", borderWidth: "2px" },
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#667eea",
    fontWeight: 600,
  },
}));

// ================= Backend URL =================
const API_BASE_URL = "https://ondealchatapp.onrender.com";

// ================= Component =================
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  // Redirect on successful login
  useEffect(() => {
    if (loginSuccess && currentUser) {
      navigate("/chat");
    }
  }, [loginSuccess, currentUser, navigate]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoginSuccess(false);

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        const token = user?.token;

        if (!user || !token) {
          setError("Invalid response from server - missing user or token");
          setLoading(false);
          return;
        }

        // Save user info
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: user.id || user._id,
            username: user.username,
            email: user.email,
            gender: user.gender,
          })
        );

        login(user, token);
        setLoginSuccess(true);
      } else {
        setError(data.message || data.error || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer maxWidth={false}>
      <LoginForm component="form" onSubmit={handleSubmit}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: 1,
              background:
                "linear-gradient(45deg, #fff 30%, #667eea 70%, #764ba2 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome Back
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Sign in to continue your journey
          </Typography>
        </Box>

        {/* Email */}
        <StyledTextField
          fullWidth
          label="Email Address"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Password */}
        <StyledTextField
          fullWidth
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Error */}
        {error && (
          <Box
            sx={{
              mb: 2,
              p: "12px 16px",
              borderRadius: "10px",
              background: "rgba(255, 107, 107, 0.15)",
              border: "1px solid rgba(255, 107, 107, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <ErrorOutlineIcon sx={{ color: "#FF6B6B", fontSize: "24px" }} />
            <Typography
              sx={{
                color: "#FF6B6B",
                fontSize: "0.95rem",
                fontWeight: 500,
                flex: 1,
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Button */}
        <LoginButton
          type="submit"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />
          }
        >
          {loading ? "Signing in..." : "Login"}
        </LoginButton>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;
