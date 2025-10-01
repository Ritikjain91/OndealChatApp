import React from "react";
import { 
  Container, 
  Typography, 
  Button, 
  Box,
  Paper
} from "@mui/material";
import { 
  Home, 
  ErrorOutline,
  Refresh
} from "@mui/icons-material";

const ErrorPage = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 3,
          width: "100%",
          maxWidth: "450px",
        }}
      >
        {/* Error Icon */}
        <Box sx={{ mb: 3 }}>
          <ErrorOutline 
            sx={{ 
              fontSize: 80, 
              color: "error.main" 
            }} 
          />
        </Box>

        {/* Error Code */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: "4rem",
            fontWeight: 800,
            color: "error.main",
            mb: 2,
            fontFamily: '"Monaco", "Consolas", monospace',
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
            fontWeight: 600,
            color: "text.primary",
            mb: 2,
          }}
        >
          Page Not Found
        </Typography>

        {/* Error Description */}
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
            mb: 4,
          }}
        >
          The page you're looking for doesn't exist or may be temporarily unavailable.
          Please check the URL or try the options below.
        </Typography>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<Home />}
            onClick={handleGoHome}
            sx={{
              borderRadius: "25px",
              px: 4,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "140px",
            }}
          >
            Go Home
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{
              borderRadius: "25px",
              px: 4,
              py: 1,
              fontWeight: 600,
              textTransform: "none",
              minWidth: "140px",
            }}
          >
            Try Again
          </Button>
        </Box>

        {/* Help Text */}
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mt: 3,
            fontStyle: "italic",
          }}
        >
          If the problem continues, the site may be under maintenance.
        </Typography>
      </Paper>
    </Container>
  );
};

export default ErrorPage;