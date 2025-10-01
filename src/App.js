import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import Login from "./components/Login/Login";
import Signup from "./components/SignUp/Signup";
import './App.css';
import ErrorPage from './components/ErrorPage/ErrorPage'; 
import Chat from './components/ChatPage/ChoosingFriend';
import Frontpage from './components/FrontPage/Frontpage';
import ChatApp from './components/ChatPage/Chatapp';
import { AuthProvider, useAuth } from './components/Context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx';
import { useEffect } from 'react';

// Create a wrapper component that uses the auth context
function AppRoutes() {
  const { currentUser, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #667eea',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '18px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <RouterProvider router={router} />
  );
}

// Create the router with protected routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Frontpage />} errorElement={<ErrorPage />} />
      <Route path="/login" element={<Login />} errorElement={<ErrorPage />} />
      <Route path="/signup" element={<Signup />} errorElement={<ErrorPage />} />
      
      {/* Protected Routes - Only accessible when logged in */}
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        } 
        errorElement={<ErrorPage />} 
      />
      <Route 
        path="/chatapp" 
        element={
          <ProtectedRoute>
            <ChatApp />
          </ProtectedRoute>
        } 
        errorElement={<ErrorPage />} 
      />
      
      <Route path="*" element={<ErrorPage />} />
    </>
  )
);

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;