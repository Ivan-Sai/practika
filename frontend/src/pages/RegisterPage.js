import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import SocialLogin from '../components/SocialLogin';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const { register, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have valid API credentials before loading SDKs
    const fbAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    const isFbConfigured = fbAppId && fbAppId !== 'your_facebook_app_id';
    const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id';
    
    // Initialize Facebook SDK only if configured
    if (isFbConfigured) {
      window.fbAsyncInit = function() {
        if (window.FB) {
          try {
            window.FB.init({
              appId: fbAppId,
              cookie: true,
              xfbml: true,
              version: 'v11.0'
            });
          } catch (error) {
            console.error('Error initializing Facebook SDK:', error);
          }
        }
      };

      // Load Facebook SDK
      const loadFacebookSDK = () => {
        if (document.getElementById('facebook-jssdk')) return;
        try {
          const script = document.createElement('script');
          script.id = 'facebook-jssdk';
          script.src = "https://connect.facebook.net/en_US/sdk.js";
          script.async = true;
          script.defer = true;
          document.body.appendChild(script);
        } catch (error) {
          console.error('Error loading Facebook SDK:', error);
        }
      };
      
      loadFacebookSDK();
    } else {
      console.warn('Facebook App ID not configured. Facebook login will not be available.');
    }

    // Load Google API only if configured
    if (isGoogleConfigured) {
      const loadGoogleAPI = () => {
        if (document.getElementById('google-jssdk')) return;
        try {
          const script = document.createElement('script');
          script.id = 'google-jssdk';
          script.src = "https://apis.google.com/js/platform.js";
          script.async = true;
          script.defer = true;
          script.onload = () => {
            if (window.gapi) {
              try {
                window.gapi.load('auth2', () => {
                  window.gapi.auth2.init({
                    client_id: googleClientId
                  });
                });
              } catch (error) {
                console.error('Error initializing Google API:', error);
              }
            }
          };
          document.body.appendChild(script);
        } catch (error) {
          console.error('Error loading Google API:', error);
        }
      };
      
      loadGoogleAPI();
    } else {
      console.warn('Google Client ID not configured. Google login will not be available.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('All fields are required');
      toast.error('All fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Submit registration
    const { confirmPassword, ...userData } = formData;
    const success = await register(userData);
    
    if (success) {
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } else {
      toast.error(error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <div className="card">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          {(formError || error) && (
            <div className="error-message">
              {formError || error}
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            Register
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <SocialLogin />
      </div>
    </div>
  );
};

export default RegisterPage;