import React from 'react';
import { Globe, Lock, RefreshCw, Database } from 'lucide-react';
import { OnlineBookingView } from '../components/OnlineBookingView';
import { LoginView } from '../components/LoginView';
import { syncFromSupabase, isSupabaseConnected } from '../utils/supabase';
import { useNavigate } from 'react-router-dom';

interface PublicPageProps {
  services: any[];
  onAppointmentBooked: (apt: any) => void;
  setServices: (s: any[]) => void;
  setClients: (c: any[]) => void;
  setIsServiceModalOpen: (v: boolean) => void;
  setIsAppointmentModalOpen: (v: boolean) => void;
  setIsAdminAuthenticated: (v: boolean) => void;
}

export const PublicPage: React.FC<PublicPageProps> = ({
  services: servicesProp,
  onAppointmentBooked,
  setServices,
  setClients,
  setIsServiceModalOpen,
  setIsAppointmentModalOpen,
  setIsAdminAuthenticated,
}) => {
  const navigate = useNavigate();
  const [isLoginModalOpen, setLocalLoginModalOpen] = React.useState(false);
  const [hasSupabase, setHasSupabase] = React.useState(isSupabaseConnected());
  const [localServices, setLocalServices] = React.useState(servicesProp);

  // Escutar mudanças no localStorage feitas pelo admin em outra aba
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bellanail_services_v1') {
        try {
          const newServices = JSON.parse(e.newValue || '[]');
          if (newServices && newServices.length > 0) {
            setLocalServices(newServices);
            setServices(newServices);
            setToast({ message: 'Serviços atualizados pelo admin', type: 'success' });
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

  // Auto-dismiss toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <>
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div className="public-view-card" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary)' }}>
                <Globe size={22} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-serif)' }}>
                  Agendamento Online
                </h1>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.25rem' }}>
                  Página pública da cliente - agende sem acesso ao painel administrativo
                </p>
              </div>
            </div>
            <OnlineBookingView
              services={localServices}
              onAppointmentBooked={onAppointmentBooked}
            />
          </div>

          {!hasSupabase && (
            <div style={{
              background: '#fff8e1',
              border: '1px solid #ffe0b2',
              color: '#e65100',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginTop: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}>
              <Database size={16} />
              <span>
                Banco de dados não conectado. As edições do admin ficam só neste navegador.
                Conecte o Supabase para sincronizar com a página do cliente.
              </span>
            </div>
          )}

          <div style={{ textAlign: 'center', gap: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={handleSync}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                background: 'transparent',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                maxWidth: '320px'
              }}
            >
              <RefreshCw size={16} />
              Atualizar Serviços
            </button>

            <button
              onClick={() => {
                setIsServiceModalOpen(false);
                setIsAppointmentModalOpen(false);
                setLocalLoginModalOpen(true);
              }}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                background: 'transparent',
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                maxWidth: '320px',
                marginTop: '0.75rem'
              }}
            >
              <Lock size={18} style={{ marginRight: '0.4rem' }} />
              Acessar Painel Administrativo
            </button>
          </div>
        </div>
      </div>

      {isLoginModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LoginView
            onLogin={() => {
              setIsAdminAuthenticated(true);
              setLocalLoginModalOpen(false);
              navigate('/admin');
            }}
          />
        </div>
      )}

      {/* Toast de notificação */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          background: toast.type === 'success' ? '#2e7d32' : '#b3261e',
          border: '1px solid rgba(255,255,255,0.3)',
          animation: 'slideIn 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}
    </>
  );
};
