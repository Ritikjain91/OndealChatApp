import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  MenuItem,
} from "@mui/material";
import {
  Person as PersonIcon,
  Transgender as TransgenderIcon,
  Chat as ChatIcon,
  ErrorOutline as ErrorOutlineIcon,
  Shuffle as ShuffleIcon,
} from "@mui/icons-material";
import { useAuth } from "../Context/AuthContext";

const ChatContainer = styled(Container)(({ theme }) => ({
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

const ChatForm = styled(Box)(({ theme }) => ({
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

const StartChatButton = styled(Button)(({ theme }) => ({
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
  "& .MuiSelect-icon": {
    color: "rgba(255, 255, 255, 0.7)",
  },
}));

// ================= Backend URL =================
const API_BASE_URL = "https://ondealchatapp.onrender.com";

// ================= Random Username Generator =================
const generateRandomUsername = () => {
  const adjectives = ["Cool", "Happy", "Smart", "Brave", "Gentle", "Witty", "Calm", "Kind", "Bright", "Swift"];
  const nouns = ["Panda", "Tiger", "Eagle", "Dolphin", "Wolf", "Fox", "Lion", "Owl", "Bear", "Hawk"];
  const numbers = Math.floor(Math.random() * 1000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
    nouns[Math.floor(Math.random() * nouns.length)]
  }${numbers}`;
};

// ================= Component =================
const StartChat = () => {
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("prefer-not-to-say");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Generate random username on component mount
  useEffect(() => {
    setUsername(generateRandomUsername());
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!username.trim()) {
      setError("Please enter a username");
      setLoading(false);
      return;
    }

    if (username.length < 2) {
      setError("Username must be at least 2 characters long");
      setLoading(false);
      return;
    }

    if (username.length > 20) {
      setError("Username must be less than 20 characters");
      setLoading(false);
      return;
    }

    try {
      // Create anonymous user without email or password
      const response = await fetch(`${API_BASE_URL}/anonymous-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          username: username.trim(),
          gender,
          isAnonymous: true
        }),
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
            gender: user.gender,
            isAnonymous: true,
          })
        );

        // Login user
        login(user, token);
        
        // Navigate to chat
        navigate("/chat");
      } else {
        setError(data.message || data.error || "Failed to start chat. Please try again.");
      }
    } catch (err) {
      console.error("Anonymous signup error:", err);
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Generate new random username
  const handleRandomizeUsername = () => {
    setUsername(generateRandomUsername());
  };

  return (
    <ChatContainer maxWidth={false}>
      <ChatForm component="form" onSubmit={handleSubmit}>
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
            Start Chatting
          </Typography>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Join the conversation instantly - no login required
          </Typography>
        </Box>

        {/* Username */}
        <StyledTextField
          fullWidth
          label="Your Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleRandomizeUsername}
                  disabled={loading}
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <ShuffleIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText="You can change this or generate a new random one"
          FormHelperTextProps={{
            sx: { color: "rgba(255, 255, 255, 0.5)" }
          }}
        />

        {/* Gender */}
        <StyledTextField
          fullWidth
          select
          label="Gender (Optional)"
          variant="outlined"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TransgenderIcon sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
          <MenuItem value="other">Other</MenuItem>
          <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
        </StyledTextField>

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
        <StartChatButton
          type="submit"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : <ChatIcon />
          }
        >
          {loading ? "Starting Chat..." : "Start Chatting Now"}
        </StartChatButton>

        {/* Footer */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
            No account needed • Start chatting instantly • Anonymous mode
          </Typography>
        </Box>
      </ChatForm>
    </ChatContainer>
  );
};

export default StartChat;