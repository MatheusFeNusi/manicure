import React from 'react';
import { Menu, Plus, Calendar, Globe, Database } from 'lucide-react';
import type { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenNewAppointment: () => void;
  onOpenOnlineBooking: () => void;
  onOpenSupabaseConfig: () => void;
  isSupabaseConnected: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Visão Geral do Estúdio',
    subtitle: 'Acompanhe seus atendimentos, faturamento e fluxo de hoje'
  },
  agenda: {
    title: 'Agenda de Atendimentos',
    subtitle: 'Organize os horários, status e contato direto via WhatsApp'
  },
  servicos: {
    title: 'Catálogo de Serviços & Nail Art',
    subtitle: 'Gerencie procedimentos, tabelas de preços e tempos de cabine'
  },
  clientes: {
    title: 'Fichas de Clientes & Anamnese',
    subtitle: 'Cadastre preferências de formato, alergias e histórico'
  },
  financeiro: {
    title: 'Controle Financeiro & Caixa',
    subtitle: 'Receitas, despesas, faturamento e lucro estimado'
  },
  agendamento_online: {
    title: 'Página Pública de Agendamento',
    subtitle: 'Visão da cliente para agendamentos online automáticos'
  }
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenNewAppointment,
  onOpenOnlineBooking,
  onOpenSupabaseConfig,
  isSupabaseConnected
}) => {
  const currentTab = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;
  
  const todayFormatted = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="mobile-menu-toggle"
          onClick={onOpenMobileMenu}
          aria-label="Abrir Menu"
        >
          <Menu size={24} />
        </button>

        <div className="topbar-title-section">
          <h2>{currentTab.title}</h2>
          <p>{currentTab.subtitle}</p>
        </div>
      </div>

      <div className="topbar-actions">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          background: 'var(--surface-alt)',
          padding: '0.45rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          textTransform: 'capitalize'
        }}>
          <Calendar size={14} color="var(--primary)" />
          <span>{todayFormatted}</span>
        </div>

        {/* Supabase Status Button */}
        <button
          className="btn btn-secondary"
          onClick={onOpenSupabaseConfig}
          style={{
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: isSupabaseConnected ? '1px solid #c8e6c9' : '1px solid #ffe0b2',
            background: isSupabaseConnected ? '#f1f8e9' : '#fff8e1',
            color: isSupabaseConnected ? '#2e7d32' : '#e65100'
          }}
          title="Configurações do Banco Supabase"
        >
          <Database size={15} />
          <span>{isSupabaseConnected ? 'Supabase Conectado' : 'Conectar Supabase'}</span>
        </button>

        {activeTab !== 'agendamento_online' && (
          <button
            className="btn btn-secondary"
            onClick={onOpenOnlineBooking}
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Globe size={15} color="var(--primary)" />
            <span>Página da Cliente</span>
          </button>
        )}

        <button
          className="btn btn-primary"
          onClick={onOpenNewAppointment}
        >
          <Plus size={18} />
          <span>Novo Agendamento</span>
        </button>
      </div>
    </header>
  );
};
