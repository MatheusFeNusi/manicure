import React from 'react';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  MessageCircle, 
  TrendingUp
} from 'lucide-react';
import type { Appointment, Client, Service, Transaction, AppointmentStatus } from '../types';
import { formatCurrency, generateWhatsAppLink } from '../utils/storage';

interface DashboardViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  transactions: Transaction[];
  onOpenNewAppointment: () => void;
  onOpenNewClient: () => void;
  onOpenNewTransaction: () => void;
  onUpdateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  onSelectTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appointments,
  clients,
  services,
  transactions,
  onOpenNewAppointment,
  onOpenNewClient,
  onOpenNewTransaction,
  onUpdateAppointmentStatus,
  onSelectTab
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today);

  // Financial calculations
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoLiquido = totalReceitas - totalDespesas;

  // Average ticket
  const completedAppointments = appointments.filter(a => a.status === 'concluido');
  const ticketMedio = completedAppointments.length > 0 
    ? completedAppointments.reduce((sum, a) => sum + a.totalAmount, 0) / completedAppointments.length
    : 110;

  // Completed today count
  const completedToday = todayAppointments.filter(a => a.status === 'concluido').length;

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Faturamento Total</span>
            <div className="kpi-icon-wrapper" style={{ background: '#eef7ed', color: '#2e7d32' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(totalReceitas)}</div>
          <div className="kpi-subtext highlight-green">
            <TrendingUp size={14} /> Lucro Líquido: {formatCurrency(saldoLiquido)}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Atendimentos Hoje</span>
            <div className="kpi-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Calendar size={22} />
            </div>
          </div>
          <div className="kpi-value">{todayAppointments.length}</div>
          <div className="kpi-subtext">
            <span>{completedToday} concluídos • {todayAppointments.length - completedToday} pendentes</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Ticket Médio</span>
            <div className="kpi-icon-wrapper" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <Sparkles size={22} />
            </div>
          </div>
          <div className="kpi-value">{formatCurrency(ticketMedio)}</div>
          <div className="kpi-subtext">
            <span>Por atendimento realizado</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Clientes Ativas</span>
            <div className="kpi-icon-wrapper" style={{ background: '#e8f4fd', color: '#1976d2' }}>
              <Users size={22} />
            </div>
          </div>
          <div className="kpi-value">{clients.length}</div>
          <div className="kpi-subtext">
            <span>Fichas com preferências salvas</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Quick Actions */}
      <div className="dashboard-grid">
        {/* Atendimentos do Dia */}
        <div className="section-card">
          <div className="section-header">
            <h3>
              <Clock size={20} color="var(--primary)" /> Agenda de Hoje ({todayAppointments.length})
            </h3>
            <button 
              className="btn btn-secondary" 
              onClick={() => onSelectTab('agenda')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              Ver Agenda Completa <ArrowUpRight size={14} />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Calendar size={42} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600 }}>Nenhum atendimento marcado para hoje ainda.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem', fontSize: '0.85rem' }}
                onClick={onOpenNewAppointment}
              >
                + Agendar Primeiro Horário
              </button>
            </div>
          ) : (
            <div>
              {todayAppointments.map(apt => {
                const message = `Olá, ${apt.clientName}! Passando para confirmar seu horário hoje às ${apt.time} no Nail Design Shirley Dantas para ${apt.servicesSummary}. Qualquer imprevisto me avise! ✨`;
                const waLink = generateWhatsAppLink(apt.clientPhone, message);

                return (
                  <div key={apt.id} className="appointment-item">
                    <div className="apt-time-badge">
                      <span className="apt-time">{apt.time}</span>
                      <span className="apt-duration">{apt.durationMinutes} min</span>
                    </div>

                    <div className="apt-details">
                      <div className="apt-client-name">
                        <span>{apt.clientName}</span>
                        <span className={`badge badge-${apt.status}`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="apt-service-text">{apt.servicesSummary}</div>
                      {apt.nailColorPreference && (
                        <div className="apt-notes">Cor desejada: {apt.nailColorPreference}</div>
                      )}
                    </div>

                    <div className="apt-actions">
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginRight: '0.5rem', fontSize: '0.95rem' }}>
                        {formatCurrency(apt.totalAmount)}
                      </div>

                      {/* WhatsApp Reminder Button */}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                        title="Enviar lembrete no WhatsApp"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        <MessageCircle size={15} />
                        <span style={{ display: 'none' }}>WhatsApp</span>
                      </a>

                      {/* Quick Status Toggle */}
                      {apt.status !== 'concluido' ? (
                        <button
                          className="btn btn-success"
                          onClick={() => onUpdateAppointmentStatus(apt.id, 'concluido')}
                          title="Concluir Atendimento"
                          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Concluir</span>
                        </button>
                      ) : (
                        <span style={{ color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 700 }}>
                          <CheckCircle2 size={16} /> Pago
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Actions & Top Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Actions Card */}
          <div className="section-card">
            <div className="section-header">
              <h3>Ações Rápidas</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button 
                className="btn btn-primary" 
                onClick={onOpenNewAppointment}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Plus size={18} />
                <span>Novo Agendamento</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={onOpenNewClient}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Users size={18} color="var(--primary)" />
                <span>Cadastrar Nova Cliente</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={onOpenNewTransaction}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <DollarSign size={18} color="#2e7d32" />
                <span>Registrar Entrada / Despesa</span>
              </button>
            </div>
          </div>

          {/* Serviços Mais Pedidos */}
          <div className="section-card">
            <div className="section-header">
              <h3>
                <Sparkles size={18} color="var(--accent-gold)" /> Procedimentos Destaque
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {services.slice(0, 4).map(srv => (
                <div key={srv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      {srv.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {srv.category} • {srv.durationMinutes} min
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {formatCurrency(srv.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
