import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

const ErrorPage = () => {
  return (
    <Container
      maxWidth="sm"
      sx={{
        textAlign: "center",
        py: 8,
      }}
    >
      <Typography variant="h2" component="h1" gutterBottom color="error">
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Oops! The page you're looking for doesn't exist or may be under repair.
      </Typography>
      <Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
          href="/"
        >
          Go Home
        </Button>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          If "Go Home" is not working, the entire site may be under repair.
        </Typography>
      </Box>
    </Container>
  );
};

export default ErrorPage;
