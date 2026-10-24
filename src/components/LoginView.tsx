import React, { useState } from 'react';
import { Lock, User, AlertTriangle, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

const ADMIN_EMAIL = 'Shirleymanicure2343@gmail.com';
const ADMIN_PASSWORD = 'manicure0707@#das';
const STORAGE_KEY = 'shirleynail_admin_auth';

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading] = useState(false);

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'true') {
    onLogin();
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setError(false);
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 3500);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.6rem', borderRadius: '10px', color: 'var(--primary)' }}>
            <Lock size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-serif)' }}>
              Nail Design Shirley Dantas
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.2rem' }}>
              Acesso Restrito - Administrador
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fdecea',
            border: '1px solid #f5c6c6',
            color: '#b3261e',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertTriangle size={16} />
            <span>E-mail ou senha incorretos. Tente novamente.</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              <User size={16} /> E-mail do Administrador
            </label>
            <input
              type="email"
              placeholder="admin@shirleynail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)', color: 'var(--text-main)', marginTop: '0.4rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">
              <Lock size={16} /> Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)', color: 'var(--text-main)', marginTop: '0.4rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Entrando...
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                Entrar no Painel Admin
              </>
            )}
          </button>

          <p style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center' }}>
            Credenciais do admin: Shirley / manicure0707@#das
          </p>
        </form>
      </div>
    </div>
  );
};
