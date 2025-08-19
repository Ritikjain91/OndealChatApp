import  { useEffect, useMemo, useRef, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
 
  Paper,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Single exported component as requested
export default function MaterialChat() {
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      sender: "them",
      name: "Alex",
      avatar: "A",
      text: "Hi Ritik! Welcome to the chat 👋",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
    {
      id: 2,
      sender: "me",
      name: "You",
      avatar: "RJ",
      text: "Hey! Show me a simple MUI chat UI.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const listRef = useRef(null);

  // auto-scroll to bottom on new message
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages;
    return messages.filter((m) => m.text.toLowerCase().includes(search.toLowerCase()));
  }, [messages, search]);

  const handleSend = () => {
    const text = value.trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", name: "You", avatar: "RJ", text, time: now },
      // quick demo reply (synchronous, no timers)
      { id: Date.now() + 1, sender: "them", name: "Alex", avatar: "A", text: "Noted ✅", time: now },
    ]);
    setValue("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{
      height: "100vh",
      width: "100%",
      bgcolor: "#1E3A8A", // Blue gradient-like background (similar to provided image)
      background: "linear-gradient(135deg, #1E3A8A 0%, #172554 100%)",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
    }}>
      {/* Header */}
      <AppBar position="static"  elevation={1} className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Toolbar sx={{ gap: 1 }}>
          <Avatar> A </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              Alex Johnson
            </Typography>
            <Typography variant="caption" color="text.secondary">
              online
            </Typography>
          </Box>
          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search in chat"
            sx={{ width: { xs: 140, sm: 220, md: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="More">
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Messages area */}
      <Box
        ref={listRef}
        sx={{
          p: { xs: 1.5, sm: 2 },
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1.25,
        }}
      >
        <List sx={{ width: "100%" }} disablePadding>
          {filteredMessages.map((m) => (
            <MessageRow key={m.id} message={m} />
          ))}
        </List>
      </Box>

      <Divider />

      {/* Composer */}
      <Paper square elevation={3} sx={{ p: { xs: 1, sm: 1.5 } }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <Tooltip title="Attach">
            <IconButton size="large">
              <Badge variant="dot" color="primary" overlap="circular">
                <AttachFileIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
          />

          <Tooltip title="Emoji">
            <IconButton size="large">
              <EmojiEmotionsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Send">
            <span>
              <IconButton
                size="large"
                color="primary"
                disabled={!value.trim()}
                onClick={handleSend}
              >
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Paper>
    </Box>
  );
}

// Inline helper for message bubble/row (kept in same file)
function MessageRow({ message }) {
  const isMe = message.sender === "me";
  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: isMe ? "flex-end" : "flex-start",
      }}
      disableGutters
    >
      {!isMe && (
        <ListItemAvatar sx={{ minWidth: 44 }}>
          <Avatar>{message.avatar}</Avatar>
        </ListItemAvatar>
      )}

      <Bubble isMe={isMe} text={message.text} time={message.time} name={message.name} />

      {isMe && (
        <ListItemAvatar sx={{ minWidth: 44, display: { xs: "none", sm: "block" } }}>
          <Avatar>{message.avatar}</Avatar>
        </ListItemAvatar>
      )}
    </ListItem>
  );
}

function Bubble({ isMe, text, time, name }) {
  return (
    <Paper
      elevation={2}
      sx={{
        maxWidth: { xs: "80%", sm: "70%", md: "60%" },
        p: 1.25,
        px: 1.5,
        borderRadius: 3,
        bgcolor: (t) => (isMe ? t.palette.primary.main : t.palette.background.paper),
        color: (t) => (isMe ? t.palette.primary.contrastText : t.palette.text.primary),
      }}
    >
      <Stack spacing={0.5}>
        {!isMe && (
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {name}
          </Typography>
        )}
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7, alignSelf: "flex-end" }}>
          {time}
        </Typography>
      </Stack>
    </Paper>
  );
}
