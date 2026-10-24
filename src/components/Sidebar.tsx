import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Sparkles, 
  Users, 
  Wallet, 
  Globe, 
  X,
  Heart,
  RefreshCw,
  Database,
  LogOut
} from 'lucide-react';
import type { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  todayAppointmentsCount: number;
  isSupabaseConnected: boolean;
  onOpenOnlineBooking: () => void;
  onOpenSupabaseConfig: () => void;
  onForceSync: () => void;
  onLogout: () => void;
  isAdminAuthenticated: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  todayAppointmentsCount,
  isSupabaseConnected,
  onOpenOnlineBooking,
  onOpenSupabaseConfig,
  onForceSync,
  onLogout,
  isAdminAuthenticated
}) => {
  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="brand-header">
        <div className="brand-logo-icon">
          <Sparkles size={24} />
        </div>
        <div className="brand-info">
          <h1>Shirley Nail Design</h1>
          <p>Manicure & Nail Art</p>
        </div>
        {isOpen && (
          <button 
            className="modal-close-btn" 
            style={{ marginLeft: 'auto', display: 'flex' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Visão Geral</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`}
          onClick={() => handleNavClick('agenda')}
        >
          <CalendarDays size={20} />
          <span>Agenda & Horários</span>
          {todayAppointmentsCount > 0 && (
            <span className="badge-count">{todayAppointmentsCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'servicos' ? 'active' : ''}`}
          onClick={() => handleNavClick('servicos')}
        >
          <Sparkles size={20} />
          <span>Catálogo de Serviços</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`}
          onClick={() => handleNavClick('clientes')}
        >
          <Users size={20} />
          <span>Clientes & Fichas</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'financeiro' ? 'active' : ''}`}
          onClick={() => handleNavClick('financeiro')}
        >
          <Wallet size={20} />
          <span>Financeiro & Caixa</span>
        </button>

        <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, paddingLeft: '1rem', letterSpacing: '0.05em' }}>
            Canal da Cliente
          </span>
        </div>

        <button
          className={`nav-item ${activeTab === 'agendamento_online' ? 'active' : ''}`}
          onClick={() => handleNavClick('agendamento_online')}
          style={{
            border: '1.5px dashed var(--primary)',
            background: activeTab === 'agendamento_online' ? 'var(--primary-light)' : 'transparent',
            color: 'var(--primary)'
          }}
        >
          <Globe size={20} />
          <span>Link de Agendamento</span>
        </button>

        {isAdminAuthenticated && (
          <>
            <div style={{ margin: '1.25rem 0 0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, paddingLeft: '1rem', letterSpacing: '0.05em' }}>
                Configurações
              </span>
            </div>

            <button
              className="nav-item"
              onClick={onOpenOnlineBooking}
            >
              <Globe size={20} />
              <span>Ver Página da Cliente</span>
            </button>

            {isSupabaseConnected && (
              <button
                className="nav-item"
                onClick={onForceSync}
              >
                <RefreshCw size={20} />
                <span>Sincronizar Banco</span>
              </button>
            )}

            <button
              className="nav-item"
              onClick={onOpenSupabaseConfig}
            >
              <Database size={20} />
              <span>Configurar Supabase</span>
            </button>

            <div style={{ margin: '0.75rem 0 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }} />

            <button
              className="nav-item"
              onClick={onLogout}
              style={{ color: '#c62828', background: '#ffebee' }}
            >
              <LogOut size={20} />
              <span>Sair do Admin</span>
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="studio-card-mini">
          <div className="studio-avatar">
            <Heart size={18} />
          </div>
          <div className="studio-meta">
            <h4>Nail Design Shirley Dantas</h4>
            <p>Atendimento Ativo</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
