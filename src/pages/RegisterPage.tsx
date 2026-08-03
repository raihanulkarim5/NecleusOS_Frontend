import { FormEvent, useState } from 'react';
import { useRegister } from '../hooks/useAuth';
import { StarfieldBackground } from '../components/StarfieldBackground';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate({ name, email, password });
  }

  return (
    <div className="auth-stage">
      <StarfieldBackground />
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="sub">Start building your Personal OS</p>

        {register.isError && <p className="auth-error">Couldn't create the account. Try again.</p>}

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
          <button className="auth-submit" type="submit" disabled={register.isPending}>
            {register.isPending ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
