import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { DashboardView } from '../components/DashboardView';
import { AgendaView } from '../components/AgendaView';
import { ServicesView } from '../components/ServicesView';
import { ClientsView } from '../components/ClientsView';
import { FinanceView } from '../components/FinanceView';
import { OnlineBookingView } from '../components/OnlineBookingView';
import { NewAppointmentModal } from '../components/NewAppointmentModal';
import { NewClientModal } from '../components/NewClientModal';
import { NewServiceModal } from '../components/NewServiceModal';
import { NewTransactionModal } from '../components/NewTransactionModal';
import { SupabaseConfigModal } from '../components/SupabaseConfigModal';

interface AdminPageProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  todayAppointmentsCount: number;
  appointments: any[];
  clients: any[];
  services: any[];
  transactions: any[];
  onOpenNewAppointment: () => void;
  onOpenNewClient: () => void;
  onOpenNewTransaction: () => void;
  onUpdateAppointmentStatus: (id: string, status: string) => void;
  onSelectTab: (t: string) => void;
  onOpenOnlineBooking: () => void;
  onOpenSupabaseConfig: () => void;
  onForceSync: () => void;
  onLogout: () => void;
  isSupabaseConnected: boolean;
  isAdminAuthenticated: boolean;
  // Modals
  isAppointmentModalOpen: boolean;
  setIsAppointmentModalOpen: (v: boolean) => void;
  isClientModalOpen: boolean;
  setIsClientModalOpen: (v: boolean) => void;
  clientToEdit: any | null;
  setClientToEdit: (v: any | null) => void;
  isServiceModalOpen: boolean;
  setIsServiceModalOpen: (v: boolean) => void;
  serviceToEdit: any | null;
  setServiceToEdit: (v: any | null) => void;
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (v: boolean) => void;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (v: boolean) => void;
  // Handlers
  handleSaveAppointment: (apt: any, newClientData?: any) => void;
  handleSaveClient: (client: any) => void;
  handleDeleteClient: (id: string) => void;
  handleSaveService: (service: any) => Promise<void>;
  handleDeleteService: (id: string) => Promise<void>;
  handleSaveTransaction: (transaction: any) => void;
  handleDeleteTransaction: (id: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  todayAppointmentsCount,
  appointments,
  clients,
  services,
  transactions,
  onOpenNewAppointment,
  onOpenNewClient,
  onOpenNewTransaction,
  onUpdateAppointmentStatus,
  onSelectTab,
  onOpenOnlineBooking,
  onOpenSupabaseConfig,
  onForceSync,
  onLogout,
  isSupabaseConnected,
  isAdminAuthenticated,
  isAppointmentModalOpen,
  setIsAppointmentModalOpen,
  isClientModalOpen,
  setIsClientModalOpen,
  clientToEdit,
  setClientToEdit,
  isServiceModalOpen,
  setIsServiceModalOpen,
  serviceToEdit,
  setServiceToEdit,
  isTransactionModalOpen,
  setIsTransactionModalOpen,
  isSupabaseModalOpen,
  setIsSupabaseModalOpen,
  handleSaveAppointment,
  handleSaveClient,
  handleDeleteClient,
  handleSaveService,
  handleDeleteService,
  handleSaveTransaction,
  handleDeleteTransaction,
}) => {
  return (
    <>
      <Sidebar
        activeTab={activeTab as any}
        setActiveTab={setActiveTab as any}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        todayAppointmentsCount={todayAppointmentsCount}
      />

      <div className="main-wrapper">
        <Header
          activeTab={activeTab as any}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewAppointment={onOpenNewAppointment}
          onOpenOnlineBooking={onOpenOnlineBooking}
          onOpenSupabaseConfig={onOpenSupabaseConfig}
          onForceSync={onForceSync}
          onLogout={onLogout}
          isSupabaseConnected={isSupabaseConnected}
          isAdminAuthenticated={isAdminAuthenticated}
        />

        <main className="content-body">
          {activeTab === 'dashboard' && (
            <DashboardView
              appointments={appointments}
              clients={clients}
              services={services}
              transactions={transactions}
              onOpenNewAppointment={onOpenNewAppointment}
              onOpenNewClient={onOpenNewClient}
              onOpenNewTransaction={onOpenNewTransaction}
              onUpdateAppointmentStatus={onUpdateAppointmentStatus}
              onSelectTab={onSelectTab}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaView
              appointments={appointments}
              clients={clients}
              services={services}
              onOpenNewAppointment={onOpenNewAppointment}
              onUpdateStatus={onUpdateAppointmentStatus}
              onTogglePaymentStatus={() => {
                // placeholder - will be wired in App
              }}
              onDeleteAppointment={() => {
                // placeholder
              }}
            />
          )}

          {activeTab === 'servicos' && (
            <ServicesView
              services={services}
              onOpenNewService={() => {
                setServiceToEdit(null);
                setIsServiceModalOpen(true);
              }}
              onEditService={(srv: any) => {
                setServiceToEdit(srv);
                setIsServiceModalOpen(true);
              }}
              onDeleteService={handleDeleteService}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientsView
              clients={clients}
              onOpenNewClient={onOpenNewClient}
              onEditClient={(client: any) => {
                setClientToEdit(client);
                setIsClientModalOpen(true);
              }}
              onDeleteClient={handleDeleteClient}
              onScheduleForClient={() => {
                onOpenNewAppointment();
              }}
            />
          )}

          {activeTab === 'financeiro' && (
            <FinanceView
              transactions={transactions}
              onOpenNewTransaction={onOpenNewTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'agendamento_online' && (
            <OnlineBookingView
              services={services}
              onAppointmentBooked={(apt: any) => {
                handleSaveAppointment(apt);
              }}
            />
          )}
        </main>
      </div>

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
          // handled in App
        }}
      />
    </>
  );
};
