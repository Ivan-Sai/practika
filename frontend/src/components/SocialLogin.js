import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SocialLogin = () => {
  const { socialLogin, error } = useAuth();
  const [socialError, setSocialError] = useState('');
  const [availableProviders, setAvailableProviders] = useState({
    facebook: false,
    google: false
  });

  useEffect(() => {
    // Check if social login providers are configured
    const fbAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    setAvailableProviders({
      facebook: fbAppId && fbAppId !== 'your_facebook_app_id',
      google: googleClientId && googleClientId !== 'your_google_client_id'
    });
  }, []);

  const handleFacebookLogin = () => {
    if (!window.FB) {
      setSocialError('Facebook SDK not loaded. Please try again later.');
      return;
    }
    
    try {
      window.FB.login(async (response) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          await socialLogin('facebook', accessToken);
        }
      }, { scope: 'email,public_profile' });
    } catch (err) {
      console.error('Facebook login error:', err);
      setSocialError('Error with Facebook login. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    if (!window.gapi || !window.gapi.auth2) {
      setSocialError('Google API not loaded. Please try again later.');
      return;
    }
    
    try {
      // Initialize Google Sign-In
      const auth2 = window.gapi.auth2.getAuthInstance();
      auth2.signIn().then(async (googleUser) => {
        const id_token = googleUser.getAuthResponse().id_token;
        await socialLogin('google', id_token);
      }).catch(err => {
        console.error('Google sign-in error:', err);
        setSocialError('Error with Google sign-in. Please try again.');
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
      setSocialError('Error with Google sign-in. Please try again.');
    }
  };

  // If no social login providers are configured, don't render anything
  if (!availableProviders.facebook && !availableProviders.google) {
    return null;
  }

  return (
    <div className="social-login">
      {availableProviders.facebook && (
        <button className="social-btn facebook-btn" onClick={handleFacebookLogin}>
          <i className="fab fa-facebook"></i> Continue with Facebook
        </button>
      )}
      {availableProviders.google && (
        <button className="social-btn google-btn" onClick={handleGoogleLogin}>
          <i className="fab fa-google"></i> Continue with Google
        </button>
      )}
      {(error || socialError) && <p className="error-message">{error || socialError}</p>}
    </div>
  );
};

export default SocialLogin;