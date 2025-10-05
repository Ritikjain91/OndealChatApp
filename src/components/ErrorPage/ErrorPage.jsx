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
  ErrorOutline
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
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          width: "100%",
          maxWidth: "600px",
          position: "relative",
        }}
      >
        {/* Glitch Effect Container */}
        <Box sx={{ position: "relative", mb: 4 }}>
          {/* Main 404 */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "6rem", sm: "10rem", md: "12rem" },
              fontWeight: 900,
              color: "#1a1a1a",
              mb: 0,
              lineHeight: 1,
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              letterSpacing: "-0.05em",
              position: "relative",
              '&::before': {
                content: '"404"',
                position: "absolute",
                left: "2px",
                top: "2px",
                color: "#ff0000",
                opacity: 0.7,
                zIndex: -1,
                animation: "glitch1 2s infinite",
              },
              '&::after': {
                content: '"404"',
                position: "absolute",
                left: "-2px",
                top: "-2px",
                color: "#00ff00",
                opacity: 0.7,
                zIndex: -1,
                animation: "glitch2 2s infinite",
              },
              "@keyframes glitch1": {
                "0%, 100%": { 
                  transform: "translate(0)",
                  opacity: 0.7,
                },
                "20%": { 
                  transform: "translate(-3px, 3px)",
                  opacity: 0.5,
                },
                "40%": { 
                  transform: "translate(-3px, -3px)",
                  opacity: 0.8,
                },
                "60%": { 
                  transform: "translate(3px, 3px)",
                  opacity: 0.6,
                },
                "80%": { 
                  transform: "translate(3px, -3px)",
                  opacity: 0.7,
                },
              },
              "@keyframes glitch2": {
                "0%, 100%": { 
                  transform: "translate(0)",
                  opacity: 0.7,
                },
                "20%": { 
                  transform: "translate(3px, -3px)",
                  opacity: 0.6,
                },
                "40%": { 
                  transform: "translate(3px, 3px)",
                  opacity: 0.8,
                },
                "60%": { 
                  transform: "translate(-3px, -3px)",
                  opacity: 0.5,
                },
                "80%": { 
                  transform: "translate(-3px, 3px)",
                  opacity: 0.7,
                },
              },
            }}
          >
            404
          </Typography>

          {/* Error Icon */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              animation: "pulse 2s ease-in-out infinite",
              "@keyframes pulse": {
                "0%, 100%": { 
                  opacity: 0.3,
                  transform: "translate(-50%, -50%) scale(1)",
                },
                "50%": { 
                  opacity: 0.1,
                  transform: "translate(-50%, -50%) scale(1.1)",
                },
              },
            }}
          >
            <ErrorOutline 
              sx={{ 
                fontSize: { xs: 80, sm: 120, md: 150 },
                color: "#ff0000",
              }} 
            />
          </Box>
        </Box>

        {/* Error Title */}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: "#1a1a1a",
            mb: 2,
            fontSize: { xs: "1.75rem", sm: "2.5rem" },
            fontFamily: '"Helvetica Neue", Arial, sans-serif',
          }}
        >
          Page Not Found
        </Typography>

        {/* Error Description */}
        <Typography
          variant="body1"
          sx={{
            color: "#666666",
            lineHeight: 1.8,
            mb: 5,
            fontSize: { xs: "1rem", sm: "1.125rem" },
            maxWidth: "500px",
            mx: "auto",
          }}
        >
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
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
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              borderRadius: "8px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "180px",
              backgroundColor: "#1a1a1a",
              color: "#ffffff",
              fontSize: "1rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              '&:hover': {
                backgroundColor: "#000000",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Go to Homepage
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
            sx={{
              borderRadius: "8px",
              px: 4,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "180px",
              borderColor: "#1a1a1a",
              color: "#1a1a1a",
              fontSize: "1rem",
              borderWidth: "2px",
              '&:hover': {
                borderColor: "#000000",
                backgroundColor: "#f5f5f5",
                borderWidth: "2px",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Go Back
          </Button>
        </Box>

        {/* Error Code */}
        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#999999",
              fontFamily: '"Courier New", monospace',
              fontSize: "0.875rem",
              letterSpacing: "0.05em",
            }}
          >
            ERROR CODE: HTTP 404 NOT FOUND
          </Typography>
        </Box>

        {/* Decorative Lines */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 20, sm: 40 },
            left: 0,
            width: "60px",
            height: "4px",
            backgroundColor: "#ff0000",
            animation: "slideIn 1s ease-out",
            "@keyframes slideIn": {
              "0%": { 
                width: 0,
              },
              "100%": { 
                width: "60px",
              },
            },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 20, sm: 40 },
            right: 0,
            width: "60px",
            height: "4px",
            backgroundColor: "#1a1a1a",
            animation: "slideIn 1s ease-out 0.2s backwards",
          }}
        />
      </Box>
    </Container>
  );
};

export default ErrorPage;