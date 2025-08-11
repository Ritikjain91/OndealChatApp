import { useState } from 'react';
import axios from 'axios';
import './Signup.css'; 

function Signup({ onSignupSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/signup',
        { username, password },
        { withCredentials: true }
      );

      if (response.status === 201 || response.status === 200) {
        alert('Signup successful! Please login.');
        onSignupSuccess(); 
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSignup}>
        <h2 className="signup-title">Create an Account</h2>

        {error && <p className="error-message">{error}</p>}

        <input
          className="signup-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
        />
        <input
          className="signup-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password"
          required
        />
        <button className="signup-button" type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
