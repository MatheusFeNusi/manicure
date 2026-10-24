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

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  clients,
  onOpenNewAppointment,
  onUpdateStatus,
  onTogglePaymentStatus,
  onDeleteAppointment
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
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
      {/* Top Filter and Date Bar */}
      <div style={{
        background: 'var(--surface)',
        padding: '1.25rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Data:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              className={`filter-pill ${selectedDate === todayStr ? 'active' : ''}`}
              onClick={() => setSelectedDate(todayStr)}
            >
              Hoje
            </button>
            <button
              className={`filter-pill ${
                selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0] ? 'active' : ''
              }`}
              onClick={() => {
                const d = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                setSelectedDate(d);
              }}
            >
              Amanhã
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Previsto no dia: <strong>{formatCurrency(dayTotalExpected)}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#2e7d32', fontWeight: 700 }}>
              Já recebido: {formatCurrency(dayTotalReceived)}
            </div>
          </div>

          <button className="btn btn-primary" onClick={onOpenNewAppointment}>
            <Plus size={16} /> Novo Horário
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-bar">
        <button
          className={`filter-pill ${statusFilter === 'todos' ? 'active' : ''}`}
          onClick={() => setStatusFilter('todos')}
        >
          Todos ({dayAppointments.length})
        </button>
        <button
          className={`filter-pill ${statusFilter === 'agendado' ? 'active' : ''}`}
          onClick={() => setStatusFilter('agendado')}
        >
          Agendados ({dayAppointments.filter(a => a.status === 'agendado').length})
        </button>
        <button
          className={`filter-pill ${statusFilter === 'confirmado' ? 'active' : ''}`}
          onClick={() => setStatusFilter('confirmado')}
        >
          Confirmados ({dayAppointments.filter(a => a.status === 'confirmado').length})
        </button>
        <button
          className={`filter-pill ${statusFilter === 'em_atendimento' ? 'active' : ''}`}
          onClick={() => setStatusFilter('em_atendimento')}
        >
          Em Atendimento ({dayAppointments.filter(a => a.status === 'em_atendimento').length})
        </button>
        <button
          className={`filter-pill ${statusFilter === 'concluido' ? 'active' : ''}`}
          onClick={() => setStatusFilter('concluido')}
        >
          Concluídos ({dayAppointments.filter(a => a.status === 'concluido').length})
        </button>
      </div>

      {/* Appointment Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
          <Clock size={48} style={{ opacity: 0.25, marginBottom: '1rem' }} />
          <h3>Nenhum agendamento para {formatDateBr(selectedDate)} neste filtro.</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Você pode agendar um novo horário ou escolher outra data acima.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1.25rem' }}
            onClick={onOpenNewAppointment}
          >
            <Plus size={16} /> Agendar Agora
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAppointments.map(apt => {
            const client = clients.find(c => c.id === apt.clientId);
            const waReminderText = `Olá, ${apt.clientName}! Passando para confirmar seu horário no Nail Design Shirley Dantas dia ${formatDateBr(apt.date)} às ${apt.time} (${apt.servicesSummary}). Te espero com um café quentinho! Qualquer alteração, avise-me com antecedência. ✨💅`;
            const waLink = generateWhatsAppLink(apt.clientPhone, waReminderText);

            return (
              <div 
                key={apt.id} 
                className="section-card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderLeft: `5px solid ${
                    apt.status === 'concluido' ? '#7b1fa2' :
                    apt.status === 'em_atendimento' ? '#f57f17' :
                    apt.status === 'confirmado' ? '#2e7d32' :
                    '#1976d2'
                  }`
                }}
              >
                {/* Time & Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div className="apt-time-badge" style={{ minWidth: '85px', padding: '0.65rem' }}>
                    <span className="apt-time" style={{ fontSize: '1.2rem' }}>{apt.time}</span>
                    <span className="apt-duration">{apt.durationMinutes} min</span>
                  </div>

                  {/* Client & Service Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {apt.clientName}
                      </h4>
                      {client?.nailShape && (
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                          Formato: {client.nailShape}
                        </span>
                      )}
                      <span className={`badge badge-${apt.status}`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.925rem', marginTop: '0.2rem' }}>
                      {apt.servicesSummary}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>WhatsApp: <strong>{apt.clientPhone}</strong></span>
                      {apt.nailColorPreference && (
                        <span>Cor: <em>{apt.nailColorPreference}</em></span>
                      )}
                      {apt.notes && (
                        <span>Obs: <em>{apt.notes}</em></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount, Payment & Status Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatCurrency(apt.totalAmount)}
                    </div>
                    <button
                      onClick={() => onTogglePaymentStatus(apt.id)}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        background: apt.paymentStatus === 'pago' ? '#eef7ed' : '#fff3e0',
                        color: apt.paymentStatus === 'pago' ? '#2e7d32' : '#e65100',
                        cursor: 'pointer',
                        border: 'none',
                        marginTop: '0.2rem'
                      }}
                    >
                      {apt.paymentStatus === 'pago' ? '✓ Pago (' + apt.paymentMethod + ')' : '⏳ Pendente'}
                    </button>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={apt.status}
                    onChange={e => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                    style={{ width: 'auto', fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
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
                    className="btn btn-whatsapp"
                    title="Enviar lembrete e confirmação via WhatsApp"
                    style={{ padding: '0.55rem 0.85rem' }}
                  >
                    <MessageCircle size={16} />
                    <span>Lembrete</span>
                  </a>

                  {/* Delete Button */}
                  <button
                    className="btn btn-danger-outline"
                    onClick={() => {
                      if (confirm(`Excluir agendamento de ${apt.clientName}?`)) {
                        onDeleteAppointment(apt.id);
                      }
                    }}
                    title="Excluir Agendamento"
                    style={{ padding: '0.55rem' }}
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
