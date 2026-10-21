import React from 'react';
import { Globe, Lock, RefreshCw, Database } from 'lucide-react';
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
      <div className="public-page-wrapper">
        <main className="public-page-main">
          <div className="public-card">
            <div className="public-header">
              <div className="public-icon">
                <Globe size={22} />
              </div>
              <div className="public-title-block">
                <h1>Agendamento Online</h1>
                <p>Página pública da cliente — agende sem acesso ao painel administrativo</p>
              </div>
            </div>

            <OnlineBookingView
              services={services}
              onAppointmentBooked={onAppointmentBooked}
            />
          </div>

          {!hasSupabase && (
            <div className="public-alert">
              <Database size={16} />
              <span>
                Banco de dados não conectado. As edições do admin ficam só neste navegador. Conecte o Supabase para sincronizar com a página do cliente.
              </span>
            </div>
          )}

          <div className="public-actions">
            <button
              className="btn btn-outline"
              onClick={handleSync}
            >
              <RefreshCw size={16} /> Atualizar Serviços
            </button>

            <button
              className="btn btn-outline"
              onClick={() => {
                setIsServiceModalOpen(false);
                setIsAppointmentModalOpen(false);
                setLocalLoginModalOpen(true);
              }}
            >
              <Lock size={18} style={{ marginRight: '0.4rem' }} />
              Acessar Painel Administrativo
            </button>
          </div>
        </main>

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
