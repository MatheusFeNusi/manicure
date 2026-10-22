import React from 'react';
import { Sparkles, Clock, MapPin, Star, Lock } from 'lucide-react';
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
  const [services, setServices] = React.useState(servicesProp);

  React.useEffect(() => {
    setServices(servicesProp);
  }, [servicesProp]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('bellanail_services_v1');
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
      if (e.key === 'bellanail_services_v1') {
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

  const handleSync = async () => {
    try {
      const stored = localStorage.getItem('bellanail_services_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setServices(parsed);
          setToast({ message: 'Serviços atualizados', type: 'success' });
        }
      }
    } catch {
      setToast({ message: 'Erro ao atualizar serviços', type: 'error' });
    }
  };

  return (
    <>
      <div className="public-page">
        <header className="studio-header">
          <div className="studio-logo">
            <Sparkles size={24} strokeWidth={2} />
          </div>
          <div className="studio-info">
            <h1>Studio BellaNail</h1>
            <p>Alongamentos, Esmaltação em Gel & Nail Design</p>
            <div className="studio-meta">
              <span><Star size={12} fill="#ffd700" color="#ffd700" /> 4.9 (128 avaliações)</span>
              <span><MapPin size={12} /> São Paulo - SP</span>
              <span><Clock size={12} /> 09:00 às 19:00</span>
            </div>
          </div>
        </header>

        <main className="public-main">
          <div className="steps-indicator">
            <div className="step">1</div>
            <div className="step">2</div>
            <div className="step">3</div>
          </div>

          <OnlineBookingView
            services={services}
            onAppointmentBooked={onAppointmentBooked}
          />
        </main>

        {!hasSupabase && (
          <div className="public-alert">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Banco de dados não conectado. As edições do admin ficam só neste navegador. Conecte o Supabase para sincronizar com a página do cliente.
            </span>
          </div>
        )}

        <div className="public-footer">
          <a
            href="/admin"
            className="admin-link"
            onClick={(e) => {
              e.preventDefault();
              setIsServiceModalOpen(false);
              setIsAppointmentModalOpen(false);
              setLocalLoginModalOpen(true);
            }}
          >
            <Lock size={14} style={{ marginRight: '0.35rem' }} />
            Acessar painel administrativo
          </a>
        </div>

        {isLoginModalOpen && (
          <div className="public-login-overlay">
            <div className="public-login-card">
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
          <div className="public-toast">
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
};
