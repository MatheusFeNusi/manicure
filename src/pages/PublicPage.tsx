import React from 'react';
import { Sparkles, Clock, MapPin, Star, Lock, Loader2 } from 'lucide-react';
import { OnlineBookingView } from '../components/OnlineBookingView';
import { LoginView } from '../components/LoginView';
import { useNavigate } from 'react-router-dom';

interface PublicPageProps {
  services: any[];
  onAppointmentBooked: (apt: any) => void;
  setIsServiceModalOpen: (v: boolean) => void;
  setIsAppointmentModalOpen: (v: boolean) => void;
  setIsAdminAuthenticated: (v: boolean) => void;
}

export const PublicPage: React.FC<PublicPageProps> = ({
  services,
  onAppointmentBooked,
  setIsServiceModalOpen,
  setIsAppointmentModalOpen,
  setIsAdminAuthenticated,
}) => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setLocalLoginModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (services && services.length > 0) {
      setIsLoading(false);
    }
  }, [services]);

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
    setTimeout(() => {
      if (services && services.length > 0) {
        setIsLoading(false);
      } else {
        setError('Não foi possível carregar os serviços. Tente novamente.');
        setIsLoading(false);
      }
    }, 500);
  };

  React.useEffect(() => {
    if (!services || services.length === 0) {
      handleRetry();
    }
  }, [services]);

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

  if (error || !services || services.length === 0) {
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
            <p>{error || 'Nenhum serviço disponível no momento.'}</p>
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