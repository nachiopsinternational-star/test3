import React, { useEffect, useRef, useState } from 'react';
import { AuthUser, UserRole } from '../../types';
import { AlertCircle } from 'lucide-react';

interface GoogleAuthButtonProps {
  onSuccess: (user: AuthUser) => void;
  onError?: (err: string) => void;
  role: UserRole;
  parentEmail?: string;
  parentName?: string;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GOOGLE_CLIENT_ID = '376545232381-ue3tqacnv801pbd9o9m0hgl58pna1vm9.apps.googleusercontent.com';

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  role,
  parentEmail,
  parentName,
  text = 'continue_with',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleCredentialResponse = async (response: any) => {
    try {
      if (!response.credential) {
        throw new Error('No credential token received from Google');
      }

      // Send Google credential token to backend for verification and account setup
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: response.credential,
          requestedRole: role,
          parentEmail,
          parentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate with Google');
      }

      onSuccess(data.user);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const msg = err.message || 'Google Sign-In failed';
      setInternalError(msg);
      if (onError) onError(msg);
    }
  };

  useEffect(() => {
    // Check if Google SDK is loaded in window
    let checkInterval: any = null;
    let attempts = 0;

    const initGsi = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official Google button inside container
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text,
            width: 320,
            logo_alignment: 'left',
          });
          setSdkLoaded(true);
        } catch (e) {
          console.warn('Could not initialize Google Accounts ID:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkInterval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGsi();
        } else if (attempts > 30) {
          clearInterval(checkInterval);
        }
      }, 200);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [role, parentEmail, parentName, text]);

  // Fallback direct OAuth popup initiator if GSI iframe is blocked by third-party cookies
  const handleDirectGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Direct OAuth2 authorization popup url as documented in OAuth guidelines
      const redirectUri = window.location.origin;
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'token id_token',
        scope: 'openid email profile',
        nonce: `nonce_${Date.now()}`,
        prompt: 'select_account',
      });
      window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
        'google_oauth_popup',
        'width=500,height=650'
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {internalError && (
        <div className="w-full mb-1 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
          <span>{internalError}</span>
        </div>
      )}

      {/* Primary Branded Google OAuth Button */}
      <button
        type="button"
        onClick={handleDirectGoogleLogin}
        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-white/5 active:scale-[0.99] border border-slate-200"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>
          {text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google'}
        </span>
      </button>

      {/* GSI Container if iframe allows Google Script */}
      <div
        ref={containerRef}
        className="w-full flex justify-center empty:hidden"
      />
    </div>
  );
};
