import React, { useState } from 'react';
import { X, Sparkles, User, Calendar, Clock, DollarSign, Heart } from 'lucide-react';
import type { Appointment, Client, Service, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/storage';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Partial<Appointment>, clientData?: Partial<Client>) => void;
  clients: Client[];
  services: Service[];
  defaultDate?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  services,
  defaultDate
}) => {
  const [isNewClient, setIsNewClient] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([services[0]?.id || '']);
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [notes, setNotes] = useState('');
  const [nailColor, setNailColor] = useState('');

  if (!isOpen) return null;

  const toggleService = (srvId: string) => {
    if (selectedServiceIds.includes(srvId)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter(id => id !== srvId));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, srvId]);
    }
  };

  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id));
  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const servicesSummary = selectedServices.map(s => s.name).join(' + ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let clientId = selectedClientId;
    let clientName = '';
    let clientPhone = '';

    if (isNewClient) {
      if (!newClientName.trim()) return;
      clientName = newClientName;
      clientPhone = newClientPhone || '(11) 99999-9999';
      clientId = 'cli-' + Date.now();
    } else {
      const client = clients.find(c => c.id === selectedClientId);
      clientName = client?.name || 'Cliente';
      clientPhone = client?.phone || '';
    }

    const appointment: Partial<Appointment> = {
      clientId,
      clientName,
      clientPhone,
      serviceIds: selectedServiceIds,
      servicesSummary,
      date,
      time,
      durationMinutes: totalMinutes,
      totalAmount,
      status: 'agendado',
      paymentMethod,
      paymentStatus: 'pendente',
      notes,
      nailColorPreference: nailColor
    };

    onSave(appointment, isNewClient ? { id: clientId, name: clientName, phone: clientPhone } : undefined);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3>Novo Agendamento</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Agende horário com cálculo de duração e valor</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Cliente */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label">
                  <User size={16} /> Selecionar Cliente
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewClient(!isNewClient)}
                  style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {isNewClient ? '← Escolher da lista' : '+ Cadastrar nova cliente'}
                </button>
              </div>

              {isNewClient ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Nome completo da cliente"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp: (XX) 9XXXX-XXXX"
                    value={newClientPhone}
                    onChange={e => setNewClientPhone(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.phone} ({c.nailShape})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Serviços */}
            <div className="form-group">
              <label className="form-label">
                <Sparkles size={16} /> Serviços Desejados (Selecione um ou mais)
              </label>
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                background: 'var(--surface-alt)'
              }}>
                {services.map(srv => {
                  const isChecked = selectedServiceIds.includes(srv.id);
                  return (
                    <label
                      key={srv.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: isChecked ? 'var(--primary-light)' : 'var(--surface)',
                        border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleService(srv.id)}
                          style={{ width: 'auto', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: isChecked ? 700 : 500 }}>{srv.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{srv.durationMinutes} min</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(srv.price)}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Total Summary Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #fcedf1 0%, #f7e6eb 100%)',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                border: '1px solid rgba(200,75,101,0.2)'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                  Tempo estimado: <strong>{totalMinutes} minutos</strong>
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800 }}>
                  Total: {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            {/* Data e Horário */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} /> Data do Atendimento
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} /> Horário de Início
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Pagamento e Preferência de Cor */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={16} /> Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Pendente">A Definir / No Atendimento</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Heart size={16} /> Cor / Inspiração
                </label>
                <input
                  type="text"
                  placeholder="Ex: Nude rosê, Francesinha, Vermelho..."
                  value={nailColor}
                  onChange={e => setNailColor(e.target.value)}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="form-group">
              <label className="form-label">Observações e Recomendações</label>
              <textarea
                rows={2}
                placeholder="Ex: Manutenção de outra profissional, cutícula sensível..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Confirmar Agendamento ({formatCurrency(totalAmount)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
