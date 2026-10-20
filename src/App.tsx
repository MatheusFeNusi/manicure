import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  getStoredClients,
  saveStoredClients,
  getStoredServices,
  saveStoredServices,
  getStoredAppointments,
  saveStoredAppointments,
  getStoredTransactions,
  saveStoredTransactions,
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
  syncUpsertTransaction,
  syncDeleteTransaction,
  subscribeToServiceChanges,
} from './utils/supabase';
import type {
  Client,
  Service,
  Appointment,
  Transaction,
  AppointmentStatus,
} from './types';
import { PublicPage } from './pages/PublicPage';
import { AdminPage } from './pages/AdminPage';

import './App.css';

export function App() {
  // State
  const [clients, setClients] = useState<Client[]>(getStoredClients);
  const [services, setServices] = useState<Service[]>(getStoredServices);
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hasSupabase = isSupabaseConnected();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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
      setToast({ message: 'Supabase não conectado. Configure em Configurações.', type: 'error' });
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

  // Inscrição em tempo real no Supabase: página do cliente atualiza quando admin edita serviços
  useEffect(() => {
    if (!isSupabaseConnected()) return;

    const unsubscribe = subscribeToServiceChanges((newServices) => {
      setServices(newServices);
      saveStoredServices(newServices);
      setToast({ message: 'Serviços atualizados em tempo real', type: 'success' });
    });

    return () => unsubscribe();
  }, [isSupabaseConnected()]);

  // Save to localStorage when state changes
  useEffect(() => { saveStoredClients(clients); }, [clients]);
  useEffect(() => { saveStoredServices(services); }, [services]);
  useEffect(() => { saveStoredAppointments(appointments); }, [appointments]);
  useEffect(() => { saveStoredTransactions(transactions); }, [transactions]);

  // Escutar mudanças no localStorage (quando admin salva em outra aba)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bellanail_services_v1' || e.key === 'bellanail_clients_v1') {
        try {
          if (e.key === 'bellanail_services_v1') {
            setServices(JSON.parse(e.newValue || '[]'));
          }
          if (e.key === 'bellanail_clients_v1') {
            setClients(JSON.parse(e.newValue || '[]'));
          }
          setToast({ message: 'Serviços atualizados automaticamente', type: 'success' });
        } catch { /* ignore */ }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handlers
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
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients((prev) => [createdClient!, ...prev]);
      syncUpsertClient(createdClient);
    } else if (aptData.clientId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === aptData.clientId) {
            const updated = {
              ...c,
              totalAppointments: c.totalAppointments + 1,
              totalSpent: c.totalSpent + (aptData.totalAmount || 0),
              lastVisit: aptData.date || c.lastVisit,
            };
            syncUpsertClient(updated);
            return updated;
          }
          return c;
        })
      );
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
      nailColorPreference: aptData.nailColorPreference,
    };

    setAppointments((prev) => [newAppointment, ...prev]);
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
    setAppointments((prev) =>
      prev.map((apt) => {
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
              appointmentId: apt.id,
            };
            setTransactions((tPrev) => [newTx, ...tPrev]);
            syncUpsertTransaction(newTx);
          }
          syncUpdateAppointmentStatus(id, newStatus);
          return updated;
        }
        return apt;
      })
    );
  };

  const handleSaveClient = (client: Client) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      const updated = exists
        ? prev.map((c) => (c.id === client.id ? client : c))
        : [client, ...prev];
      saveStoredClients(updated);
      return updated;
    });
    syncUpsertClient(client);
    setClientToEdit(null);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveStoredClients(updated);
      return updated;
    });
    syncDeleteClient(id);
  };

  const handleSaveService = async (service: Service) => {
    // Atualizar estado e gravar no localStorage imediatamente
    setServices((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      const updated = exists
        ? prev.map((s) => (s.id === service.id ? service : s))
        : [service, ...prev];
      // FORÇAR gravação no localStorage imediatamente
      saveStoredServices(updated);
      return updated;
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
    setServices((prev) => prev.filter((s) => s.id !== id));
    const result = await syncDeleteService(id);
    if (result.ok) {
      setToast({ message: 'Serviço removido do banco de dados', type: 'success' });
    } else {
      setToast({ message: `Erro ao remover do banco: ${result.error}`, type: 'error' });
    }
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    setTransactions((prev) => {
      const updated = [transaction, ...prev];
      saveStoredTransactions(updated);
      return updated;
    });
    syncUpsertTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveStoredTransactions(updated);
      return updated;
    });
    syncDeleteTransaction(id);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('bellanail_admin_auth');
    setIsAdminAuthenticated(false);
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter((a) => a.date === todayStr).length;

  return (
    <div className="app-container">
      {/* Toast de notificação de sincronização */}
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

      <BrowserRouter>
        <Routes>
          {/* Página pública do cliente */}
          <Route
            path="/"
            element={
              <PublicPage
                services={services}
                onAppointmentBooked={handleSaveAppointment}
                setIsServiceModalOpen={setIsServiceModalOpen}
                setIsAppointmentModalOpen={setIsAppointmentModalOpen}
                setIsAdminAuthenticated={setIsAdminAuthenticated}
              />
            }
          />

          {/* Página administrativa (protegida por autenticação) */}
          <Route
            path="/admin"
            element={
              isAdminAuthenticated ? (
                <AdminPage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isMobileMenuOpen={isMobileMenuOpen}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                  todayAppointmentsCount={todayAppointmentsCount}
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
                  onUpdateAppointmentStatus={(id, status) =>
                    handleUpdateAppointmentStatus(id, status as AppointmentStatus)
                  }
                  onSelectTab={setActiveTab}
                  onOpenOnlineBooking={() => setActiveTab('agendamento_online')}
                  onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
                  onForceSync={syncWithSupabase}
                  onLogout={handleAdminLogout}
                  isSupabaseConnected={hasSupabase}
                  isAdminAuthenticated={isAdminAuthenticated}
                  isAppointmentModalOpen={isAppointmentModalOpen}
                  setIsAppointmentModalOpen={setIsAppointmentModalOpen}
                  isClientModalOpen={isClientModalOpen}
                  setIsClientModalOpen={setIsClientModalOpen}
                  clientToEdit={clientToEdit}
                  setClientToEdit={setClientToEdit}
                  isServiceModalOpen={isServiceModalOpen}
                  setIsServiceModalOpen={setIsServiceModalOpen}
                  serviceToEdit={serviceToEdit}
                  setServiceToEdit={setServiceToEdit}
                  isTransactionModalOpen={isTransactionModalOpen}
                  setIsTransactionModalOpen={setIsTransactionModalOpen}
                  isSupabaseModalOpen={isSupabaseModalOpen}
                  setIsSupabaseModalOpen={setIsSupabaseModalOpen}
                  handleSaveAppointment={handleSaveAppointment}
                  handleSaveClient={handleSaveClient}
                  handleDeleteClient={handleDeleteClient}
                  handleSaveService={handleSaveService}
                  handleDeleteService={handleDeleteService}
                  handleSaveTransaction={handleSaveTransaction}
                  handleDeleteTransaction={handleDeleteTransaction}
                />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
