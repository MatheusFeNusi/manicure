import { useState, useEffect, useCallback } from 'react';
import { 
  getStoredClients, 
  saveStoredClients, 
  getStoredServices, 
  saveStoredServices, 
  getStoredAppointments, 
  saveStoredAppointments, 
  getStoredTransactions, 
  saveStoredTransactions 
} from './utils/storage';
import { 
  isSupabaseConnected,
  syncFromSupabase,
  syncUpsertClient,
  syncDeleteClient,
  syncUpsertService,
  syncDeleteService,
  syncCreateAppointment,
  syncUpdateAppointmentStatus,
  syncDeleteAppointment,
  syncUpsertTransaction,
  syncDeleteTransaction
} from './utils/supabase';
import type { 
  Client, 
  Service, 
  Appointment, 
  Transaction, 
  ActiveTab, 
  AppointmentStatus 
} from './types';
import { Globe, Lock } from 'lucide-react';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AgendaView } from './components/AgendaView';
import { ServicesView } from './components/ServicesView';
import { ClientsView } from './components/ClientsView';
import { FinanceView } from './components/FinanceView';
import { OnlineBookingView } from './components/OnlineBookingView';

import { NewAppointmentModal } from './components/NewAppointmentModal';
import { NewClientModal } from './components/NewClientModal';
import { NewServiceModal } from './components/NewServiceModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { LoginView } from './components/LoginView';
import './App.css';

export function App() {
  // State
  const [clients, setClients] = useState<Client[]>(getStoredClients);
  const [services, setServices] = useState<Service[]>(getStoredServices);
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasSupabase, setHasSupabase] = useState(isSupabaseConnected());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('bellanail_admin_auth');
    if (stored === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAdminLogout = () => {
    localStorage.removeItem('bellanail_admin_auth');
    setIsAdminAuthenticated(false);
    setActiveTab('agendamento_online');
  };

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync from Supabase on mount or when connected
  const syncWithSupabase = useCallback(async () => {
    if (!isSupabaseConnected()) {
      setToast({ message: 'Supabase nao conectado. Configure em Configuracoes.', type: 'error' });
      return;
    }
    try {
      const data = await syncFromSupabase();
      if (data) {
        if (data.services && data.services.length > 0) setServices(data.services);
        if (data.clients && data.clients.length > 0) setClients(data.clients);
        if (data.appointments && data.appointments.length > 0) setAppointments(data.appointments);
        setToast({ message: 'Dados sincronizados com o banco de dados', type: 'success' });
      } else {
        setToast({ message: 'Nenhum dado encontrado no banco', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Erro ao sincronizar com o banco', type: 'error' });
      console.warn('Erro ao carregar dados do Supabase:', err);
    }
  }, []);

  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Save to localStorage when state changes
  useEffect(() => {
    saveStoredClients(clients);
  }, [clients]);

  useEffect(() => {
    saveStoredServices(services);
  }, [services]);

  useEffect(() => {
    saveStoredAppointments(appointments);
  }, [appointments]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  // Handlers for Appointments
  const handleSaveAppointment = (
    aptData: Partial<Appointment>, 
    newClientData?: Partial<Client>
  ) => {
    let createdClient: Client | null = null;

    if (newClientData && newClientData.name) {
      createdClient = {
        id: newClientData.id || 'cli-' + Date.now(),
        name: newClientData.name,
        phone: newClientData.phone || '',
        nailShape: 'Almond',
        notes: 'Cadastrada via agendamento',
        totalSpent: aptData.totalAmount || 0,
        totalAppointments: 1,
        lastVisit: aptData.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0]
      };
      setClients(prev => [createdClient!, ...prev]);
      syncUpsertClient(createdClient);
    } else if (aptData.clientId) {
      setClients(prev => prev.map(c => {
        if (c.id === aptData.clientId) {
          const updated = {
            ...c,
            totalAppointments: c.totalAppointments + 1,
            totalSpent: c.totalSpent + (aptData.totalAmount || 0),
            lastVisit: aptData.date || c.lastVisit
          };
          syncUpsertClient(updated);
          return updated;
        }
        return c;
      }));
    }

    const newAppointment: Appointment = {
      id: 'apt-' + Date.now(),
      clientId: aptData.clientId || (createdClient ? createdClient.id : 'cli-generic'),
      clientName: aptData.clientName || 'Cliente',
      clientPhone: aptData.clientPhone || '',
      serviceIds: aptData.serviceIds || [],
      servicesSummary: aptData.servicesSummary || 'Procedimento',
      date: aptData.date || new Date().toISOString().split('T')[0],
      time: aptData.time || '14:00',
      durationMinutes: aptData.durationMinutes || 60,
      totalAmount: aptData.totalAmount || 0,
      status: aptData.status || 'agendado',
      paymentMethod: aptData.paymentMethod || 'Pix',
      paymentStatus: aptData.paymentStatus || 'pendente',
      notes: aptData.notes,
      nailColorPreference: aptData.nailColorPreference
    };

    setAppointments(prev => [newAppointment, ...prev]);
    if (newAppointment.serviceIds && newAppointment.serviceIds[0]) {
      syncCreateAppointment(
        newAppointment.clientName,
        newAppointment.clientPhone,
        newAppointment.serviceIds[0],
        newAppointment.date,
        newAppointment.time
      );
    }
  };

  const handleUpdateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const updated = { ...apt, status: newStatus };
        
        if (newStatus === 'concluido' && apt.paymentStatus !== 'pago') {
          updated.paymentStatus = 'pago';
          const newTx: Transaction = {
            id: 'tx-' + Date.now(),
            type: 'receita',
            category: 'Atendimento',
            description: `Atendimento ${apt.clientName} (${apt.servicesSummary})`,
            amount: apt.totalAmount,
            date: apt.date,
            paymentMethod: apt.paymentMethod === 'Pendente' ? 'Pix' : apt.paymentMethod,
            appointmentId: apt.id
          };
          setTransactions(tPrev => [newTx, ...tPrev]);
          syncUpsertTransaction(newTx);
        }
        syncUpdateAppointmentStatus(id, newStatus);
        return updated;
      }
      return apt;
    }));
  };

  const handleTogglePaymentStatus = (id: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const nextStatus: 'pago' | 'pendente' = apt.paymentStatus === 'pago' ? 'pendente' : 'pago';
        if (nextStatus === 'pago') {
          const newTx: Transaction = {
            id: 'tx-' + Date.now(),
            type: 'receita',
            category: 'Atendimento',
            description: `Recebimento ${apt.clientName} (${apt.servicesSummary})`,
            amount: apt.totalAmount,
            date: apt.date,
            paymentMethod: apt.paymentMethod === 'Pendente' ? 'Pix' : apt.paymentMethod,
            appointmentId: apt.id
          };
          setTransactions(tPrev => [newTx, ...tPrev]);
          syncUpsertTransaction(newTx);
        }
        const updated = { ...apt, paymentStatus: nextStatus };
        syncUpdateAppointmentStatus(apt.id, apt.status);
        return updated;
      }
      return apt;
    }));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    syncDeleteAppointment(id);
  };

  // Handlers for Clients
  const handleSaveClient = (client: Client) => {
    setClients(prev => {
      const exists = prev.some(c => c.id === client.id);
      if (exists) {
        return prev.map(c => c.id === client.id ? client : c);
      }
      return [client, ...prev];
    });
    syncUpsertClient(client);
    setClientToEdit(null);
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    syncDeleteClient(id);
  };

  // Handlers for Services
  const handleSaveService = async (service: Service) => {
    setServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.map(s => s.id === service.id ? service : s);
      }
      return [service, ...prev];
    });
    const result = await syncUpsertService(service);
    if (result.ok) {
      setToast({ message: 'Serviço salvo no banco de dados', type: 'success' });
    } else {
      setToast({ message: `Erro ao salvar no banco: ${result.error}`, type: 'error' });
    }
    setServiceToEdit(null);
  };

  const handleDeleteService = async (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    const result = await syncDeleteService(id);
    if (result.ok) {
      setToast({ message: 'Serviço removido do banco de dados', type: 'success' });
    } else {
      setToast({ message: `Erro ao remover do banco: ${result.error}`, type: 'error' });
    }
  };

  // Handlers for Transactions
  const handleSaveTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    syncUpsertTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    syncDeleteTransaction(id);
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Appointments today count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(a => a.date === todayStr).length;

  return (
    <div className="app-container">
      {/* ============ VISÃO PÚBLICA DO CLIENTE (sempre visível) ============ */}
      <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1rem' }}>
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
              services={services}
              onAppointmentBooked={handleSaveAppointment}
            />
          </div>

          {!isAdminAuthenticated && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  setIsServiceModalOpen(false);
                  setIsAppointmentModalOpen(false);
                  setIsLoginModalOpen(true);
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
                  width: '100%',
                  maxWidth: '320px',
                  justifyContent: 'center'
                }}
              >
                <Lock size={18} style={{ marginRight: '0.4rem' }} />
                Acessar Painel Administrativo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Login como popup sobre a visão pública */}
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
              setIsLoginModalOpen(false);
            }}
          />
        </div>
      )}

      {/* ============ PAINEL ADMINISTRATIVO (após login) ============ */}
      {isAdminAuthenticated && (
        <>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            todayAppointmentsCount={todayAppointmentsCount}
          />

          <div className="main-wrapper">
            <Header
              activeTab={activeTab}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
              onOpenNewAppointment={() => setIsAppointmentModalOpen(true)}
              onOpenOnlineBooking={() => setActiveTab('agendamento_online')}
              onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
              onForceSync={syncWithSupabase}
              onLogout={handleAdminLogout}
              isSupabaseConnected={hasSupabase}
              isAdminAuthenticated={isAdminAuthenticated}
            />

            <main className="content-body">
              {activeTab === 'dashboard' && (
                <DashboardView
                  appointments={appointments}
                  clients={clients}
                  services={services}
                  transactions={transactions}
                  onOpenNewAppointment={() => setIsAppointmentModalOpen(true)}
                  onOpenNewClient={() => {
                    setClientToEdit(null);
                    setIsClientModalOpen(true);
                  }}
                  onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
                  onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                  onSelectTab={setActiveTab}
                />
              )}

              {activeTab === 'agenda' && (
                <AgendaView
                  appointments={appointments}
                  clients={clients}
                  services={services}
                  onOpenNewAppointment={() => setIsAppointmentModalOpen(true)}
                  onUpdateStatus={handleUpdateAppointmentStatus}
                  onTogglePaymentStatus={handleTogglePaymentStatus}
                  onDeleteAppointment={handleDeleteAppointment}
                />
              )}

              {activeTab === 'servicos' && (
                <ServicesView
                  services={services}
                  onOpenNewService={() => {
                    setServiceToEdit(null);
                    setIsServiceModalOpen(true);
                  }}
                  onEditService={srv => {
                    setServiceToEdit(srv);
                    setIsServiceModalOpen(true);
                  }}
                  onDeleteService={handleDeleteService}
                />
              )}

              {activeTab === 'clientes' && (
                <ClientsView
                  clients={clients}
                  onOpenNewClient={() => {
                    setClientToEdit(null);
                    setIsClientModalOpen(true);
                  }}
                  onEditClient={client => {
                    setClientToEdit(client);
                    setIsClientModalOpen(true);
                  }}
                  onDeleteClient={handleDeleteClient}
                  onScheduleForClient={_client => {
                    setIsAppointmentModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'financeiro' && (
                <FinanceView
                  transactions={transactions}
                  onOpenNewTransaction={() => setIsTransactionModalOpen(true)}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              )}

              {activeTab === 'agendamento_online' && (
                <OnlineBookingView
                  services={services}
                  onAppointmentBooked={apt => {
                    handleSaveAppointment(apt);
                  }}
                />
              )}
            </main>
          </div>

          {/* Modals */}
          <NewAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
            onSave={handleSaveAppointment}
            clients={clients}
            services={services}
          />

          <NewClientModal
            isOpen={isClientModalOpen}
            onClose={() => {
              setIsClientModalOpen(false);
              setClientToEdit(null);
            }}
            onSave={handleSaveClient}
            initialData={clientToEdit}
          />

          <NewServiceModal
            isOpen={isServiceModalOpen}
            onClose={() => {
              setIsServiceModalOpen(false);
              setServiceToEdit(null);
            }}
            onSave={handleSaveService}
            initialData={serviceToEdit}
          />

          <NewTransactionModal
            isOpen={isTransactionModalOpen}
            onClose={() => setIsTransactionModalOpen(false)}
            onSave={handleSaveTransaction}
          />

          <SupabaseConfigModal
            isOpen={isSupabaseModalOpen}
            onClose={() => setIsSupabaseModalOpen(false)}
            onConnected={() => {
              setHasSupabase(isSupabaseConnected());
              syncWithSupabase();
            }}
          />
        </>
      )}

      {/* Toast de notificacao de sincronizacao */}
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
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
