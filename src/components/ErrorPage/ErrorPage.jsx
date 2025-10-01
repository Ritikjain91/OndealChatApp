import React from "react";
import { 
  Container, 
  Typography, 
  Button, 
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Home, 
  Refresh,
  ArrowBack,
  SentimentDissatisfied
} from "@mui/icons-material";

const ErrorPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Box
        sx={{
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          borderRadius: 4,
          width: "100%",
          maxWidth: "500px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          position: "relative",
          overflow: "hidden",
          '&::before': {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #667eea, #764ba2)",
          }
        }}
      >
        {/* Animated Icon */}
        <Box 
          sx={{ 
            mb: 3,
            animation: "bounce 2s infinite",
            "@keyframes bounce": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-10px)" }
            }
          }}
        >
          <SentimentDissatisfied 
            sx={{ 
              fontSize: 100, 
              color: "primary.main",
              opacity: 0.8
            }} 
          />
        </Box>

        {/* Error Code with Gradient */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { xs: "3rem", sm: "4rem" },
            fontWeight: 800,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            mb: 2,
            fontFamily: '"Monaco", "Consolas", monospace',
            textShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          404
        </Typography>

        {/* Error Title */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 2,
            fontSize: { xs: "1.5rem", sm: "2rem" },
          }}
        >
          Oops! Page Not Found
        </Typography>

        {/* Error Description */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            mb: 4,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            maxWidth: "90%",
            mx: "auto",
          }}
        >
          It seems like the page you're looking for has moved, been removed, 
          or is temporarily unavailable. Let's get you back on track.
        </Typography>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "160px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
              '&:hover': {
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Go Back
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "160px",
              borderColor: "primary.main",
              color: "primary.main",
              '&:hover': {
                borderColor: "primary.dark",
                backgroundColor: "rgba(102, 126, 234, 0.04)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Home Page
          </Button>

          <Button
            variant="text"
            size="large"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "160px",
              color: "text.secondary",
              '&:hover': {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Refresh
          </Button>
        </Box>

        {/* Additional Help Section */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 2,
            backgroundColor: "rgba(102, 126, 234, 0.05)",
            border: "1px solid rgba(102, 126, 234, 0.1)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 1,
              fontWeight: 600,
            }}
          >
            Need immediate assistance?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontStyle: "italic",
            }}
          >
            Contact support or check our status page for updates
          </Typography>
        </Box>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 70%)",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: -30,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.05) 70%)",
            zIndex: 0,
          }}
        />
      </Box>
    </Container>
  );
};

export default ErrorPage;
