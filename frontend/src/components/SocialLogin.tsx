import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FACEBOOK_APP_ID, GOOGLE_CLIENT_ID } from '../config';
import './SocialLogin.css';

// Define types for Google Auth
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: any;
    gapi: any;
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

const SocialLogin: React.FC = () => {
  const { socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [googleTokenClient, setGoogleTokenClient] = useState<any>(null);

  // Check for redirect response from Google
  useEffect(() => {
    // Extract token from URL if available (Google redirect flow)
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get('google_token');
    
    if (googleToken) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Process the token
      handleGoogleToken(googleToken);
    }
  }, [location]);

  // Initialize Facebook SDK
  useEffect(() => {
    const loadFacebookSDK = () => {
      window.fbAsyncInit = function() {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v16.0'
        });
      };

      // Load the SDK asynchronously
      (function(d, s, id) {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        const js = d.createElement(s) as HTMLScriptElement;
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode?.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    };

    loadFacebookSDK();
  }, []);

  // Initialize Google OAuth
  useEffect(() => {
    // Load new Google Identity Services script (OAuth 2.0)
    const loadGoogleOAuthScript = () => {
      if (document.getElementById('google-oauth-script')) return;
      
      const script = document.createElement('script');
      script.id = 'google-oauth-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleOAuth;
      document.body.appendChild(script);
    };
    
    // Initialize Google One Tap
    const initializeGoogleOAuth = () => {
      // Make sure the Google API is loaded
      if (window.google?.accounts?.id) {
        // Initialize standard button
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleTokenResponse
        });

        // Render Google One Tap button
        if (document.getElementById('google-login-button')) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-login-button')!,
            { 
              type: 'standard',
              theme: 'outline', 
              size: 'large', 
              text: 'continue_with',
              width: 250
            }
          );
        }
        
        // Initialize OAuth token client for redirect flow (alternative to popup)
        if (window.google?.accounts?.oauth2) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: (tokenResponse: any) => {
              if (tokenResponse.access_token) {
                handleGoogleToken(tokenResponse.access_token);
              }
            },
            error_callback: (error: any) => {
              console.error('Google OAuth error:', error);
              alert('Failed to authenticate with Google. Please try again.');
              setIsLoading(false);
            }
          });
          
          setGoogleTokenClient(client);
        }
      }
    };

    loadGoogleOAuthScript();
  }, []);

  const handleFacebookLogin = () => {
    setIsLoading(true);
    window.FB.login(async (response: any) => {
      if (response.authResponse) {
        const { accessToken } = response.authResponse;
        try {
          await socialLogin('facebook', accessToken);
          navigate('/profile');
        } catch (error) {
          console.error('Facebook login error:', error);
          alert('Failed to login with Facebook. Please try again.');
        }
      } else {
        console.log('Facebook login cancelled by user');
      }
      setIsLoading(false);
    }, { scope: 'email,public_profile' });
  };

  // Handler for Google One Tap button response
  const handleGoogleTokenResponse = async (response: any) => {
    if (response.credential) {
      setIsLoading(true);
      try {
        await socialLogin('google', response.credential);
        navigate('/profile');
      } catch (error) {
        console.error('Google login error:', error);
        alert('Failed to login with Google. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handler for OAuth 2.0 token (redirect flow)
  const handleGoogleToken = async (token: string) => {
    setIsLoading(true);
    try {
      await socialLogin('google', token);
      navigate('/profile');
    } catch (error) {
      console.error('Google login error:', error);
      alert('Failed to login with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alternative Google sign-in that uses OAuth 2.0 redirect flow
  const handleGoogleOAuthLogin = () => {
    if (googleTokenClient) {
      setIsLoading(true);
      googleTokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      alert('Google authentication is still initializing. Please try again in a moment.');
    }
  };

  return (
    <div className="social-login">
      <h3>Or continue with</h3>
      <div className="social-buttons">
        <button 
          className="social-button facebook-button"
          onClick={handleFacebookLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Loading...
            </>
          ) : (
            <>
              <i className="fab fa-facebook-f"></i>
              Facebook
            </>
          )}
        </button>
        
        {/* Google One Tap button container */}
        <div id="google-login-button" className="google-button-container"></div>
        
        {/* Fallback Google button using OAuth redirect flow */}
        <button 
          className="social-button google-button"
          onClick={handleGoogleOAuthLogin}
          disabled={isLoading || !googleTokenClient}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Loading...
            </>
          ) : (
            <>
              <i className="fab fa-google"></i>
              Google (Alt)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SocialLogin;