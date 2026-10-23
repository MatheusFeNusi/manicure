import React from 'react';
import { Sparkles, Clock, MapPin, Star, Lock, Loader2 } from 'lucide-react';
import { OnlineBookingView } from '../components/OnlineBookingView';
import { LoginView } from '../components/LoginView';
import { isSupabaseConnected } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

interface PublicPageProps {
  services: any[];
  onAppointmentBooked: (apt: any) => void;
  setIsServiceModalOpen: (v: boolean) => void;
  setIsAppointmentModalOpen: (v: boolean) => void;
  setIsAdminAuthenticated: (v: boolean) => void;
}

const SERVICES_KEY = 'bellanail_services_v2';

export const PublicPage: React.FC<PublicPageProps> = ({
  services: servicesProp,
  onAppointmentBooked,
  setIsServiceModalOpen,
  setIsAppointmentModalOpen,
  setIsAdminAuthenticated,
}) => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setLocalLoginModalOpen] = React.useState(false);
  const [hasSupabase, setHasSupabase] = React.useState(isSupabaseConnected());
  const [services, setServices] = React.useState<any[]>(servicesProp);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setServices(servicesProp);
    setIsLoading(false);
  }, [servicesProp]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SERVICES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setServices(parsed);
        }
      }
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SERVICES_KEY) {
        try {
          const newServices = JSON.parse(e.newValue || '[]');
          if (newServices && newServices.length > 0) {
            setServices(newServices);
          }
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  React.useEffect(() => {
    setHasSupabase(isSupabaseConnected());
  }, []);

  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem(SERVICES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setServices(parsed);
          setIsLoading(false);
          return;
        }
      }
      if (servicesProp && servicesProp.length > 0) {
        setServices(servicesProp);
      } else {
        setError('Não foi possível carregar os serviços. Tente novamente.');
      }
    } catch {
      setError('Não foi possível carregar os serviços. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    handleRetry();
  }, []);

  if (isLoading) {
    return (
      <div className="client-page">
        <header className="client-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div className="brand-text">
              <h1>BellaNail Studio</h1>
              <p>Manicure & Nail Design</p>
            </div>
          </div>
        </header>
        <main className="client-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p>Carregando serviços...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-page">
        <header className="client-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div className="brand-text">
              <h1>BellaNail Studio</h1>
              <p>Manicure & Nail Design</p>
            </div>
          </div>
        </header>
        <main className="client-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', textAlign: 'center', padding: '1rem' }}>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={handleRetry}>Tentar novamente</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="client-page">
        <header className="client-header">
          <div className="brand">
            <div className="brand-mark">
              <Sparkles size={20} strokeWidth={2} />
            </div>
            <div className="brand-text">
              <h1>BellaNail Studio</h1>
              <p>Manicure & Nail Design</p>
            </div>
          </div>
          <div className="client-meta">
            <span className="meta-item">
              <Star size={12} fill="#c6922b" color="#c6922b" /> 4.9
            </span>
            <span className="meta-item">
              <MapPin size={12} /> São Paulo - SP
            </span>
            <span className="meta-item">
              <Clock size={12} /> 09:00 &ndash; 19:00
            </span>
          </div>
        </header>

        <main className="client-main">
          <div className="client-steps">
            <div className="step">01</div>
            <div className="step">02</div>
            <div className="step">03</div>
          </div>

          <OnlineBookingView
            services={services}
            onAppointmentBooked={onAppointmentBooked}
          />
        </main>

        {!hasSupabase && (
          <div className="client-notice">
            <span>Supabase n&atilde;o conectado.</span>
            <span>As edi&ccedil;&otilde;es ficam s&oacute; neste navegador.</span>
          </div>
        )}

        <footer className="client-footer">
          <a
            href="/admin"
            className="client-admin-link"
            onClick={(e) => {
              e.preventDefault();
              setIsServiceModalOpen(false);
              setIsAppointmentModalOpen(false);
              setLocalLoginModalOpen(true);
            }}
          >
            <Lock size={14} style={{ marginRight: '0.4rem' }} />
            Painel Administrativo
          </a>
        </footer>

        {isLoginModalOpen && (
          <div className="client-login-overlay">
            <div className="client-login-card">
              <LoginView
                onLogin={() => {
                  setIsAdminAuthenticated(true);
                  setLocalLoginModalOpen(false);
                  navigate('/admin');
                }}
              />
            </div>
          </div>
        )}

        {toast && (
          <div className="client-toast">
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
};