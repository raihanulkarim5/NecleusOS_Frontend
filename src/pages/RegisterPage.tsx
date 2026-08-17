import { FormEvent, useState } from 'react';
import { useRegister, useSocialRegister } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { StarfieldBackground } from '../components/StarfieldBackground';
import type { AuthProvider } from '../types/auth';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

const SOCIAL_PROVIDERS: { provider: AuthProvider; label: string }[] = [
  { provider: 'google', label: 'Continue with Google' },
  { provider: 'github', label: 'Continue with GitHub' },
];

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const register = useRegister();
  const socialRegister = useSocialRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    register.mutate({ name, email, password });
  }

  return (
    <div className="auth-stage">
      <StarfieldBackground />
      <div className="auth-header">
        <div className="auth-brand">
          <Logo />
        </div>
        <div className="auth-toggle">
          <button type="button" className="auth-toggle-button" onClick={onSwitchToLogin}>Sign in</button>
          <button type="button" className="auth-toggle-button active">Sign up</button>
        </div>
      </div>
      <div className="auth-split">
        <section className="email-panel">
          <div className="auth-card email-card">
            <div className="auth-card__nebula" />
            <h1>Create your account</h1>
            <p className="sub">Start building your NecleusOS workspace</p>

            {(register.isError || errorMessage) && (
              <p className="auth-error">
                {errorMessage || 'Could not create the account. Try again.'}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Raihan"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button className="auth-submit" type="submit" disabled={register.isPending}>
                {register.isPending ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <div className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={onSwitchToLogin}>Sign in</button>
            </div>
          </div>
        </section>

        <section className="provider-panel">
          <div className="provider-panel__nebula" />
          <div className="galaxy-planets">
            <div className="galaxy-planet galaxy-planet--work">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="workGradient" cx="40%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#55b4ff" />
                    <stop offset="100%" stopColor="#1f3b7a" />
                  </radialGradient>
                  <linearGradient id="workRing" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(120, 210, 255, 0.45)" />
                    <stop offset="100%" stopColor="rgba(92, 143, 255, 0.1)" />
                  </linearGradient>
                </defs>
                <circle cx="36" cy="36" r="18" fill="url(#workGradient)" />
                <ellipse cx="36" cy="36" rx="24" ry="10" fill="none" stroke="url(#workRing)" strokeWidth="2" />
              </svg>
            </div>
            <div className="galaxy-planet galaxy-planet--finance">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="financeGradient" cx="40%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#fae058" />
                    <stop offset="100%" stopColor="#c18d13" />
                  </radialGradient>
                  <radialGradient id="financeGlow" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="36" cy="36" r="18" fill="url(#financeGradient)" />
                <circle cx="30" cy="30" r="4" fill="url(#financeGlow)" />
              </svg>
            </div>
            <div className="galaxy-planet galaxy-planet--projects">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="projectsGradient" cx="40%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#7f5ff5" />
                    <stop offset="100%" stopColor="#2d146f" />
                  </radialGradient>
                  <linearGradient id="projectsStripe" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                  </linearGradient>
                </defs>
                <circle cx="36" cy="36" r="18" fill="url(#projectsGradient)" />
                <path d="M18 45c10 0 8-18 18-18" fill="none" stroke="url(#projectsStripe)" strokeWidth="3" opacity="0.7" />
              </svg>
            </div>
            <div className="galaxy-planet galaxy-planet--skills">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="skillsGradient" cx="40%" cy="40%" r="70%">
                    <stop offset="0%" stopColor="#9efc97" />
                    <stop offset="100%" stopColor="#1c5c2d" />
                  </radialGradient>
                  <linearGradient id="skillsRing" x1="0%" x2="100%" y1="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(180, 255, 178, 0.32)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <circle cx="36" cy="36" r="18" fill="url(#skillsGradient)" />
                <ellipse cx="36" cy="34" rx="20" ry="7" fill="none" stroke="url(#skillsRing)" strokeWidth="2" />
              </svg>
            </div>
            <div className="galaxy-planet galaxy-planet--journal">
              <svg viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="journalGradient" cx="45%" cy="40%" r="75%">
                    <stop offset="0%" stopColor="#ff9cf4" />
                    <stop offset="100%" stopColor="#6c1879" />
                  </radialGradient>
                  <radialGradient id="journalGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <circle cx="36" cy="36" r="18" fill="url(#journalGradient)" />
                <circle cx="38" cy="28" r="5" fill="url(#journalGlow)" />
              </svg>
            </div>
          </div>
          <div className="provider-panel__content">
            <h2>Join the galaxy</h2>
            <p className="sub">Use social signing to jump into your NecleusOS universe faster.</p>

            {(socialRegister.isError || errorMessage) && (
              <p className="auth-error">{errorMessage || 'Social sign-up failed. Try again.'}</p>
            )}

            <div className="social-block social-block--inline">
              {SOCIAL_PROVIDERS.map(({ provider, label }) => (
                <button
                  key={provider}
                  type="button"
                  className={`social-button ${provider}`}
                  onClick={() => socialRegister.mutate(provider)}
                  disabled={socialRegister.isPending}
                >
                  <span className="social-button__icon">
                    {provider === 'google' ? (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.35 11.1H12v2.8h5.35c-.23 1.35-.92 2.35-1.97 3.05v2.5h3.2c1.88-1.74 2.97-4.3 2.97-7.35 0-.45-.05-.9-.15-1.3z" fill="#4285F4"/>
                        <path d="M12 22c2.67 0 4.9-.9 6.53-2.45l-3.2-2.5c-.9.6-2.03.95-3.33.95-2.55 0-4.7-1.72-5.47-4.05H3.07v2.55C4.68 19.95 8.06 22 12 22z" fill="#34A853"/>
                        <path d="M6.53 13.95c-.2-.55-.33-1.15-.33-1.95s.12-1.4.33-1.95V7.5H3.07A9.99 9.99 0 0 0 2 12c0 1.65.38 3.2 1.07 4.5l3.46-2.55z" fill="#FBBC05"/>
                        <path d="M12 5.5c1.45 0 2.75.5 3.78 1.48l2.84-2.84C16.9 2.4 14.66 1.5 12 1.5 8.06 1.5 4.68 3.55 3.07 6.45l3.46 2.55C7.3 7.22 9.45 5.5 12 5.5z" fill="#EA4335"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.25 1.86 1.25 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.92 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.51.12-3.15 0 0 1.01-.32 3.3 1.24a11.5 11.5 0 0 1 6 0c2.29-1.56 3.3-1.24 3.3-1.24.66 1.64.24 2.85.12 3.15.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.62-5.47 5.92.43.37.82 1.11.82 2.24 0 1.62-.02 2.93-.02 3.33 0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12Z" fill="#000"/>
                      </svg>
                    )}
                  </span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
