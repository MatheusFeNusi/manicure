import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Zap
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

    const waText = `Ol\u00e1, BellaNail Studio! Gostaria de confirmar meu agendamento feito pelo site:\n\n\u2728 *Cliente:* ${clientName}\n\u270d\ufe0f *Procedimento:* ${servicesSummary}\n\uD83D\uDCC5 *Data:* ${formatDateBr(date)}\n\u23F0 *Hor\u00e1rio:* ${time}\n\uD83D\uDCB0 *Valor:* ${formatCurrency(totalAmount)}\n\uD83D\uDC8C *Formato desejado:* ${nailShape}\n\nPodemos confirmar?`;
    const waUrl = generateWhatsAppLink('(11) 98765-4321', waText);
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

  const goBack = () => setStep(step - 1);

  return (
    <div className="booking-view">
      {isSuccess ? (
        <div className="success-screen">
          <div className="success-icon">
            <Check size={32} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          </div>
          <h3>Agendamento Solicitado!</h3>
          <p>
            O agendamento de <strong>{clientName}</strong> foi enviado para o WhatsApp da profissional!
          </p>

          <div className="success-summary">
            <div className="summary-label">Resumo da Reserva</div>
            <div className="summary-services">{servicesSummary}</div>
            <div className="summary-meta">
              <span>\uD83D\uDCC5 {formatDateBr(date)} \u00e0s <strong>{time}</strong></span>
            </div>
            <div className="summary-meta">
              <span>\uD83D\uDC8C Formato: <strong>{nailShape}</strong></span>
            </div>
            <div className="summary-total">
              Total: {formatCurrency(totalAmount)}
            </div>
          </div>

          <button
            className="btn btn-primary btn-reset"
            onClick={() => {
              setIsSuccess(false);
              setStep(1);
              setClientName('');
              setClientPhone('');
            }}
          >
            Fazer Novo Agendamento <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* STEP 1: Escolha dos Procedimentos */}
          {step === 1 && (
            <div className="step-section">
              <div className="step-head">
                <h3>Escolha os procedimentos</h3>
                <p>Voc\u00ea pode selecionar mais de um servi\u00e7o.</p>
              </div>

              <div className="services-grid">
                {services.map(srv => {
                  const isSelected = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      className={`service-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleService(srv.id)}
                    >
                      <div className="service-wrap">
                        <div className="service-badge">
                          {srv.badge === 'Mais Pedido' && (
                            <span className="badge-pill">Mais pedido</span>
                          )}
                        </div>
                        {srv.imageUrl && (
                          <img
                            className="service-image"
                            src={srv.imageUrl}
                            alt={srv.name}
                            loading="lazy"
                          />
                        )}
                        <div className="service-body">
                          <h4 className="service-name">{srv.name}</h4>
                          {srv.description && (
                            <p className="service-desc">{srv.description}</p>
                          )}
                          <div className="service-meta">
                            <span>\u23F1 {srv.durationMinutes} min</span>
                          </div>
                        </div>
                        <div className="service-price-col">
                          <span className="service-price">{formatCurrency(srv.price)}</span>
                          {isSelected && (
                            <span className="service-check">
                              <Zap size={14} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="step-actions">
                <button
                  className="btn btn-primary btn-continue"
                  onClick={() => setStep(2)}
                  disabled={selectedServiceIds.length === 0}
                >
                  Escolher Data e Hor\u00e1rio <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Data & Horário */}
          {step === 2 && (
            <div className="step-section">
              <div className="step-head">
                <button className="btn btn-link btn-back" onClick={goBack}>
                  <ArrowLeft size={14} /> Voltar
                </button>
                <h3>Data e Hor\u00e1rio</h3>
                <p>Hor\u00e1rios para {totalDuration} minutos de atendimento.</p>
              </div>

              <div className="form-field">
                <label className="form-label">
                  <Calendar size={16} /> Data do Atendimento
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDate(e.target.value)}
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  <Clock size={16} /> Hor\u00e1rio Dispon\u00edvel
                </label>
                <div className="time-grid">
                  {AVAILABLE_TIMES.map(t => {
                    const isSelected = time === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        className={`time-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="step-actions">
                <button className="btn btn-outline btn-next" onClick={() => setStep(3)}>
                  Seus Dados <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Dados da Cliente */}
          {step === 3 && (
            <form onSubmit={handleFinishBooking} className="step-section">
              <div className="step-head">
                <button className="btn btn-link btn-back" onClick={goBack}>
                  <ArrowLeft size={14} /> Voltar
                </button>
                <h3>Seus Dados</h3>
                <p>Confirma\u00e7\u00e3o direta no seu WhatsApp.</p>
              </div>

              <div className="form-field">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Marina Souza"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  required
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  required
                  className="field-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  <Sparkles size={15} /> Formato de unha desejado
                </label>
                <div className="shape-grid">
                  {NAIL_SHAPES.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`shape-item ${nailShape === s ? 'active' : ''}`}
                      onClick={() => setNailShape(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label className="form-label">Observa\u00e7\u00f5es ou inspira\u00e7\u00e3o</label>
                <textarea
                  rows={3}
                  placeholder="Ex: vermelho cl\u00e1ssico ou francesinha..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="field-input field-textarea"
                />
              </div>

              <div className="step-actions">
                <button type="submit" className="btn btn-whatsapp btn-final">
                  <MessageCircle size={18} strokeLinecap="round" strokeLinejoin="round" />
                  <span>Confirmar via WhatsApp ({formatCurrency(totalAmount)})</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};
