import { FormEvent, useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { StarfieldBackground } from '../components/StarfieldBackground';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="auth-stage">
      <StarfieldBackground />
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="sub">Sign in to Personal OS</p>

        {login.isError && <p className="auth-error">Couldn't sign in. Try again.</p>}

        <form onSubmit={handleSubmit}>
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
          <button className="auth-submit" type="submit" disabled={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToRegister}>Create one</button>
        </div>
      </div>
    </div>
  );
}
