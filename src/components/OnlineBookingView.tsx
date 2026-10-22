import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Service, NailShape, Appointment } from '../types';
import { formatCurrency, formatDateBr, generateWhatsAppLink } from '../utils/storage';

interface OnlineBookingViewProps {
  services: Service[];
  onAppointmentBooked: (appointment: Partial<Appointment>) => void;
}

const AVAILABLE_TIMES = [
  '09:00', '10:30', '13:00', '14:30', '16:00', '17:30', '19:00'
];

const NAIL_SHAPES: NailShape[] = [
  'Almond', 'Quadrada', 'Bailarina', 'Stiletto', 'Redonda', 'Oval'
];

export const OnlineBookingView: React.FC<OnlineBookingViewProps> = ({
  services,
  onAppointmentBooked
}) => {
  const [step, setStep] = useState<number>(1);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([services[0]?.id || '']);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:30');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [nailShape, setNailShape] = useState<NailShape>('Almond');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

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
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
  const servicesSummary = selectedServices.map(s => s.name).join(' + ');

  const handleFinishBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newAppointment: Partial<Appointment> = {
      clientId: 'cli-' + Date.now(),
      clientName,
      clientPhone,
      serviceIds: selectedServiceIds,
      servicesSummary,
      date,
      time,
      durationMinutes: totalDuration,
      totalAmount,
      status: 'agendado',
      paymentMethod: 'Pendente',
      paymentStatus: 'pendente',
      notes: notes ? `Online: ${notes} | Formato: ${nailShape}` : `Formato: ${nailShape}`
    };

    onAppointmentBooked(newAppointment);
    setIsSuccess(true);

    const waText = `Olá, BellaNail Studio! Gostaria de confirmar meu agendamento feito pelo site:\n\n✨ *Cliente:* ${clientName}\n💅 *Procedimento:* ${servicesSummary}\n📅 *Data:* ${formatDateBr(date)}\n⏰ *Horário:* ${time}\n💰 *Valor:* ${formatCurrency(totalAmount)}\n💖 *Formato desejado:* ${nailShape}\n\nPodemos confirmar?`;
    const waUrl = generateWhatsAppLink('(11) 98765-4321', waText);
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

  return (
    <div className="booking-view" style={{ paddingBottom: '110px' }}>
      {isSuccess ? (
        <div className="success-screen">
          <div className="success-icon">
            <Check size={36} strokeWidth={3} />
          </div>
          <h3>Agendamento Solicitado!</h3>
          <p>
            O agendamento de <strong>{clientName}</strong> foi registrado no sistema e encaminhado ao WhatsApp da profissional!
          </p>

          <div className="success-summary">
            <div className="summary-label">Resumo da Reserva:</div>
            <div className="summary-services">{servicesSummary}</div>
            <div className="summary-meta">
              <span>📅 <strong>{formatDateBr(date)}</strong> às <strong>{time}</strong></span>
            </div>
            <div className="summary-meta">
              <span>💅 Formato: <strong>{nailShape}</strong></span>
            </div>
            <div className="summary-total">
              Total: {formatCurrency(totalAmount)}
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setClientName('');
              setClientPhone('');
            }}
          >
            Simular Novo Agendamento
          </button>
        </div>
      ) : (
        <>
          {/* STEP 1: Escolha dos Procedimentos */}
          {step === 1 && (
            <div className="step-container">
              <h3>Escolha os procedimentos que deseja realizar:</h3>
              <p>Você pode selecionar mais de um serviço (ex: Alongamento + Nail Art).</p>

              <div className="services-list">
                {services.map(srv => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      className={`service-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService(srv.id)}
                    >
                      <div className="service-info">
                        {srv.imageUrl && (
                          <img
                            className="service-image"
                            src={srv.imageUrl}
                            alt={srv.name}
                            loading="lazy"
                          />
                        )}
                        <div className="service-details">
                          <div className="service-header">
                            <span className="service-name">{srv.name}</span>
                            {srv.badge === 'Mais Pedido' && (
                              <span className="badge badge-rose">Mais pedido</span>
                            )}
                          </div>
                          <div className="service-description">{srv.description}</div>
                          <div className="service-meta">
                            <span>⏱️ {srv.durationMinutes} min</span>
                          </div>
                        </div>
                      </div>
                      <div className="service-price">
                        <span className="price">{formatCurrency(srv.price)}</span>
                        <span className="selected-tag">{isSelected ? '✓ Selecionado' : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Data & Horário */}
          {step === 2 && (
            <div className="step-container">
              <h3>Escolha a melhor data e horário:</h3>
              <p>Horários calculados para {totalDuration} minutos de atendimento.</p>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={16} /> Data do Atendimento
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} /> Horários Disponíveis
                </label>
                <div className="time-grid">
                  {AVAILABLE_TIMES.map(t => {
                    const isSelected = time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`time-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="step-nav">
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  ← Voltar
                </button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  Avançar para Seus Dados <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dados da Cliente */}
          {step === 3 && (
            <form onSubmit={handleFinishBooking} className="step-container">
              <h3>Informe seus dados para contato:</h3>
              <p>Você receberá a confirmação direta no seu WhatsApp.</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Seu Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Marina Souza"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Seu WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Sparkles size={15} /> Formato de unha desejado
                </label>
                <div className="shape-grid">
                  {NAIL_SHAPES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`shape-btn ${nailShape === s ? 'active' : ''}`}
                      onClick={() => setNailShape(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Observações ou inspiração de cor</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Gostaria de esmaltação vermelha clássica ou francesinha..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="step-nav">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                  ← Voltar
                </button>
                <button type="submit" className="btn btn-whatsapp">
                  <MessageCircle size={18} />
                  <span>Confirmar via WhatsApp ({formatCurrency(totalAmount)})</span>
                </button>
              </div>
            </form>
          )}

          {/* Barra de resumo fixa no rodapé */}
          <div className="summary-bar">
            <div className="summary-info">
              <div className="summary-row">
                <span className="summary-label">Tempo total</span>
                <span className="summary-value">{totalDuration} min</span>
              </div>
              <div className="summary-row total">
                <span className="summary-label">Valor total</span>
                <span className="summary-amount">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary btn-next"
              onClick={() => setStep(2)}
              disabled={selectedServiceIds.length === 0}
            >
              Avançar para Data e Horário <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
