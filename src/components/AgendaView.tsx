import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MessageCircle, 
  Trash2, 
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Appointment, AppointmentStatus, Client, Service } from '../types';
import { formatCurrency, formatDateBr, generateWhatsAppLink } from '../utils/storage';

interface AgendaViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  onOpenNewAppointment: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onTogglePaymentStatus: (id: string) => void;
  onDeleteAppointment: (id: string) => void;
}

const STATUS_FILTERS = [
  { value: 'todos', label: 'Todos' },
  { value: 'agendado', label: 'Agendados' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'em_atendimento', label: 'Em Atendimento' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'cancelado', label: 'Cancelados' },
] as const;

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  clients,
  onOpenNewAppointment,
  onUpdateStatus,
  onTogglePaymentStatus,
  onDeleteAppointment
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Filter appointments by selected date and status
  const filteredAppointments = appointments.filter(apt => {
    const matchesDate = apt.date === selectedDate;
    const matchesStatus = statusFilter === 'todos' || apt.status === statusFilter;
    return matchesDate && matchesStatus;
  }).sort((a, b) => a.time.localeCompare(b.time));

  // Day stats
  const dayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const dayTotalExpected = dayAppointments.reduce((sum, a) => sum + a.totalAmount, 0);
  const dayCompleted = dayAppointments.filter(a => a.status === 'concluido');
  const dayTotalReceived = dayCompleted.reduce((sum, a) => sum + a.totalAmount, 0);

  const handleStatusChange = (id: string, newStatus: AppointmentStatus) => {
    if (newStatus === 'concluido') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    onUpdateStatus(id, newStatus);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Bar - Mobile Optimized */}
      <div className="agenda-topbar">
        <h2 className="agenda-title">Agenda de Atendimentos</h2>

        {/* Date Selector Card */}
        <div className="agenda-date-card">
          <div className="agenda-date-label">
            <CalendarIcon size={16} color="var(--primary)" />
            <span>Data:</span>
          </div>
          <div className="agenda-date-options">
            <button
              className={`agenda-date-pill ${selectedDate === todayStr ? 'active' : ''}`}
              onClick={() => setSelectedDate(todayStr)}
            >
              Hoje
            </button>
            <button
              className={`agenda-date-pill ${selectedDate === tomorrowStr ? 'active' : ''}`}
              onClick={() => setSelectedDate(tomorrowStr)}
            >
              Amanhã
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="agenda-date-input"
            />
          </div>
        </div>

        {/* Day Stats */}
        <div className="agenda-stats">
          <div className="agenda-stat">
            <div className="agenda-stat-label">Previsto no dia</div>
            <div className="agenda-stat-value">{formatCurrency(dayTotalExpected)}</div>
          </div>
          <div className="agenda-stat">
            <div className="agenda-stat-label">Já recebido</div>
            <div className="agenda-stat-value received">{formatCurrency(dayTotalReceived)}</div>
          </div>
        </div>

        {/* New Appointment Button - Full Width */}
        <button className="btn btn-primary agenda-new-btn" onClick={onOpenNewAppointment}>
          <Plus size={18} /> Novo Horário
        </button>
      </div>

      {/* Status Filter Tabs - Horizontal Scroll, No Scrollbar */}
      <div className="agenda-filter-bar">
        {STATUS_FILTERS.map(filter => {
          const count = dayAppointments.filter(a => filter.value === 'todos' ? true : a.status === filter.value).length;
          return (
            <button
              key={filter.value}
              className={`agenda-filter-pill ${statusFilter === filter.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label} <span className="filter-count">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Appointment Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="section-card agenda-empty">
          <Clock size={32} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
          <p>Nenhum agendamento para esta data.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredAppointments.map(apt => {
            const client = clients.find(c => c.id === apt.clientId);
            const waReminderText = `Olá, ${apt.clientName}! Passando para confirmar seu horário no Nail Design Shirley Dantas dia ${formatDateBr(apt.date)} às ${apt.time} (${apt.servicesSummary}). Te espero com um café quentinho! Qualquer alteração, avise-me com antecedência. ✨💅`;
            const waLink = generateWhatsAppLink(apt.clientPhone, waReminderText);

            return (
              <div 
                key={apt.id} 
                className="section-card agenda-card"
                style={{
                  borderLeft: `5px solid ${
                    apt.status === 'concluido' ? '#7b1fa2' :
                    apt.status === 'em_atendimento' ? '#f57f17' :
                    apt.status === 'confirmado' ? '#2e7d32' :
                    '#1976d2'
                  }`
                }}
              >
                {/* Time & Duration */}
                <div className="agenda-card-time">
                  <div className="apt-time-badge" style={{ minWidth: '85px', padding: '0.65rem' }}>
                    <span className="apt-time" style={{ fontSize: '1.2rem' }}>{apt.time}</span>
                    <span className="apt-duration">{apt.durationMinutes} min</span>
                  </div>
                </div>

                {/* Client & Service Info */}
                <div className="agenda-card-info">
                  <div className="agenda-card-header">
                    <h4>{apt.clientName}</h4>
                    {client?.nailShape && (
                      <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                        Formato: {client.nailShape}
                      </span>
                    )}
                    <span className={`badge badge-${apt.status}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="agenda-card-service">{apt.servicesSummary}</div>

                  <div className="agenda-card-meta">
                    <span>WhatsApp: <strong>{apt.clientPhone}</strong></span>
                    {apt.nailColorPreference && (
                      <span>Cor: <em>{apt.nailColorPreference}</em></span>
                    )}
                    {apt.notes && (
                      <span>Obs: <em>{apt.notes}</em></span>
                    )}
                  </div>
                </div>

                {/* Right side: Amount, Payment & Status Controls */}
                <div className="agenda-card-actions">
                  <div className="agenda-card-amount" style={{ textAlign: 'right' }}>
                    <div className="agenda-card-value">{formatCurrency(apt.totalAmount)}</div>
                    <button
                      onClick={() => onTogglePaymentStatus(apt.id)}
                      className={`agenda-payment-badge ${apt.paymentStatus === 'pago' ? 'paid' : 'pending'}`}
                    >
                      {apt.paymentStatus === 'pago' ? '✓ Pago (' + apt.paymentMethod + ')' : '⏳ Pendente'}
                    </button>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={apt.status}
                    onChange={e => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                    className="agenda-status-select"
                  >
                    <option value="agendado">Agendado</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>

                  {/* WhatsApp Reminder Button */}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp agenda-wa-btn"
                    title="Enviar lembrete e confirmação via WhatsApp"
                  >
                    <MessageCircle size={16} />
                    <span>Lembrete</span>
                  </a>

                  {/* Delete Button */}
                  <button
                    className="btn btn-danger-outline agenda-delete-btn"
                    onClick={() => {
                      if (confirm(`Excluir agendamento de ${apt.clientName}?`)) {
                        onDeleteAppointment(apt.id);
                      }
                    }}
                    title="Excluir Agendamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
