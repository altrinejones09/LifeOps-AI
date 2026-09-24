import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Key, 
  UserPlus, 
  LogIn, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { UserProfile } from '../types';
import { authenticateUser, createAccount, getJudgeDemoUser } from '../engine/authService';

interface AuthPageProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Sign In State
  const [signInEmail, setSignInEmail] = useState<string>('aarav.sharma@example.com');
  const [signInPassword, setSignInPassword] = useState<string>('demo1234');
  
  // Sign Up State
  const [signUpName, setSignUpName] = useState<string>('');
  const [signUpEmail, setSignUpEmail] = useState<string>('');
  const [signUpPhone, setSignUpPhone] = useState<string>('');
  const [signUpPassword, setSignUpPassword] = useState<string>('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState<string>('');
  
  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);

  // Common UI State
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState<boolean>(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(signInEmail, signInPassword);
      setIsLoading(false);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Authentication failed.');
      }
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpName || !signUpEmail || !signUpPassword) {
      setErrorMessage('Full name, email, and password are required.');
      return;
    }

    if (signUpPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Password and Confirm Password do not match.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = createAccount(signUpName, signUpEmail, signUpPassword, signUpPhone);
      setIsLoading(false);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setErrorMessage(result.error || 'Account creation failed.');
      }
    }, 500);
  };

  const handleJudgeQuickLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const user = getJudgeDemoUser();
      setIsLoading(false);
      onAuthSuccess(user);
    }, 300);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setErrorMessage(null);
    setForgotSuccess(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#090d16',
      backgroundImage: `
        radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%)
      `,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      color: '#f8fafc',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Top Banner Indicator */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid #1e293b',
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#94a3b8',
        backdropFilter: 'blur(8px)',
        zIndex: 10
      }}>
        <ShieldCheck size={14} color="#3b82f6" />
        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>🔒 Local Demo Authentication Environment</span>
      </div>

      {/* Main Container */}
      <div style={{
        maxWidth: '1040px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '48px',
        alignItems: 'center',
        margin: '40px auto 0'
      }}>
        
        {/* Left Hero Side */}
        <div style={{ paddingRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)'
            }}>
              <Lock size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                LifeOps AI
              </h1>
              <div style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Personal Operations Agent
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '16px' }}>
            Turn your goals into secure, reviewable workflows.
          </h2>

          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '28px' }}>
            LifeOps AI verifies identity documents, matches administrative opportunities, drafts applications, and executes mock submissions — keeping human approval strictly in control.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { title: 'Goal-to-Workflow Agent Planning', desc: 'AI converts raw goals into 8 structured execution stages.' },
              { title: 'Verified Identity Vault', desc: 'Cross-checks Aadhaar, marksheets, and certificates once.' },
              { title: 'Rule-Based Eligibility Engine', desc: 'Evaluates statutory criteria with transparent explainability.' },
              { title: '100% Human-in-the-Loop Approval', desc: 'No application is ever submitted without explicit human consent.' },
              { title: 'Immutable Audit Ledger', desc: 'Cryptographic append-only trail for complete administrative safety.' }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Judge Demo Accent Box */}
          <div style={{
            marginTop: '32px',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} /> Hackathon Evaluation Shortcut
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Instant access pre-loaded with Demo A & Demo B datasets.
              </div>
            </div>
            <button
              onClick={handleJudgeQuickLogin}
              disabled={isLoading}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              Enter Demo Workspace
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Authentication Form Card */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)'
        }}>
          
          {/* Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#090d16',
            padding: '4px',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #1e293b'
          }}>
            <button
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              style={{
                padding: '8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'signin' ? '#1e293b' : 'transparent',
                color: mode === 'signin' ? '#ffffff' : '#64748b',
                transition: 'all 0.15s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              style={{
                padding: '8px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: mode === 'signup' ? '#1e293b' : 'transparent',
                color: mode === 'signup' ? '#ffffff' : '#64748b',
                transition: 'all 0.15s ease'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#fca5a5',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#ef4444" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    placeholder="name@example.com"
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 12px 10px 38px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{ border: 'none', background: 'none', fontSize: '12px', color: '#60a5fa', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Key size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '10px 38px 10px 38px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      border: 'none',
                      background: 'none',
                      color: '#64748b',
                      cursor: 'pointer'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  transition: 'all 0.15s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign In to Workspace
                  </>
                )}
              </button>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e293b', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Want to explore demo state without typing?{' '}
                </span>
                <button
                  type="button"
                  onClick={handleJudgeQuickLogin}
                  style={{ border: 'none', background: 'none', fontSize: '13px', color: '#60a5fa', fontWeight: 700, cursor: 'pointer' }}
                >
                  Use Demo Account
                </button>
              </div>
            </form>
          )}

          {/* CREATE ACCOUNT FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Full Legal Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px 8px 38px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    style={{
                      width: '100%',
                      backgroundColor: '#090d16',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '8px 12px 8px 38px',
                      color: '#ffffff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={e => setSignUpPassword(e.target.value)}
                      placeholder="8+ chars"
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px 34px 8px 12px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '8px',
                        border: 'none',
                        background: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                      aria-label={showSignUpPassword ? 'Hide sign up password' : 'Show sign up password'}
                    >
                      {showSignUpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      value={signUpConfirmPassword}
                      onChange={e => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '8px 34px 8px 12px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '8px',
                        border: 'none',
                        background: 'none',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                      aria-label={showSignUpConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showSignUpConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password criteria indicator */}
              <div style={{ backgroundColor: '#090d16', padding: '8px 12px', borderRadius: '6px', fontSize: '11px', color: '#64748b', marginBottom: '18px' }}>
                ✓ At least 8 characters • Must match confirm password
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? 'Creating Workspace Account...' : (
                  <>
                    <UserPlus size={16} />
                    Create Account & Enter
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
                Reset Password
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
                Enter your email address to receive password reset instructions.
              </p>

              {forgotSuccess ? (
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '16px', fontSize: '13px', color: '#4ade80' }}>
                  🔒 <strong>Local Demo Notification:</strong> Password reset flow triggered for <code>{forgotEmail}</code>. In Local Demo Mode, credentials remain stored locally in your browser.
                  <button
                    onClick={() => { setMode('signin'); setForgotSuccess(false); }}
                    style={{ marginTop: '14px', backgroundColor: '#22c55e', color: '#090d16', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'block' }}
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="aarav.sharma@example.com"
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        color: '#ffffff',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setMode('signin')}
                      style={{ flex: 1, backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      style={{ flex: 1, backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
