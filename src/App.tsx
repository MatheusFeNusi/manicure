import { useState, useEffect } from 'react';
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
import type { 
  Client, 
  Service, 
  Appointment, 
  Transaction, 
  ActiveTab, 
  AppointmentStatus 
} from './types';

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
import './App.css';

export function App() {
  // State
  const [clients, setClients] = useState<Client[]>(getStoredClients);
  const [services, setServices] = useState<Service[]>(getStoredServices);
  const [appointments, setAppointments] = useState<Appointment[]>(getStoredAppointments);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

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
    // If a new client was created during appointment
    if (newClientData && newClientData.name) {
      const createdClient: Client = {
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
      setClients(prev => [createdClient, ...prev]);
    } else if (aptData.clientId) {
      // Update existing client spend stats
      setClients(prev => prev.map(c => {
        if (c.id === aptData.clientId) {
          return {
            ...c,
            totalAppointments: c.totalAppointments + 1,
            totalSpent: c.totalSpent + (aptData.totalAmount || 0),
            lastVisit: aptData.date || c.lastVisit
          };
        }
        return c;
      }));
    }

    const newAppointment: Appointment = {
      id: 'apt-' + Date.now(),
      clientId: aptData.clientId || 'cli-generic',
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
  };

  const handleUpdateAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const updated = { ...apt, status: newStatus };
        
        // If concluded, mark as paid and add to financial cash flow
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
        }
        return updated;
      }
      return apt;
    }));
  };

  const handleTogglePaymentStatus = (id: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === id) {
        const nextStatus = apt.paymentStatus === 'pago' ? 'pendente' : 'pago';
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
        }
        return { ...apt, paymentStatus: nextStatus };
      }
      return apt;
    }));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
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
    setClientToEdit(null);
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  // Handlers for Services
  const handleSaveService = (service: Service) => {
    setServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.map(s => s.id === service.id ? service : s);
      }
      return [service, ...prev];
    });
    setServiceToEdit(null);
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Handlers for Transactions
  const handleSaveTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Appointments today count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointmentsCount = appointments.filter(a => a.date === todayStr).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        todayAppointmentsCount={todayAppointmentsCount}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewAppointment={() => setIsAppointmentModalOpen(true)}
          onOpenOnlineBooking={() => setActiveTab('agendamento_online')}
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
    </div>
  );
}

export default App;
