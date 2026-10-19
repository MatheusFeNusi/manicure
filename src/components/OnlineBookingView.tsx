import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  Check, 
  Copy, 
  Share2, 
  MapPin, 
  Star, 
  MessageCircle, 
  ChevronRight
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
  const [copiedLink, setCopiedLink] = useState(false);
  const [step, setStep] = useState<number>(1);

  // Booking Form State
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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

    // Prepare WhatsApp message
    const waText = `Olá, BellaNail Studio! Gostaria de confirmar meu agendamento feito pelo site:\n\n✨ *Cliente:* ${clientName}\n💅 *Procedimento:* ${servicesSummary}\n📅 *Data:* ${formatDateBr(date)}\n⏰ *Horário:* ${time}\n💰 *Valor:* ${formatCurrency(totalAmount)}\n💖 *Formato desejado:* ${nailShape}\n\nPodemos confirmar?`;
    const waUrl = generateWhatsAppLink('(11) 98765-4321', waText);
    
    setTimeout(() => {
      window.open(waUrl, '_blank');
    }, 1200);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Banner with Link Sharing */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf4f7 0%, #fae8ee 100%)',
        border: '1.5px dashed var(--primary)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.75rem',
        marginBottom: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
            <Share2 size={18} /> Link de Agendamento para sua Bio do Instagram ou WhatsApp
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Envie este link para suas clientes agendarem sozinhas com cálculo automático de tempo e preços.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleCopyLink}
          style={{ fontSize: '0.85rem' }}
        >
          {copiedLink ? <Check size={16} /> : <Copy size={16} />}
          <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Público'}</span>
        </button>
      </div>

      {/* Booking Simulator Window */}
      <div className="booking-portal-container">
        {/* Salon Header Banner */}
        <div className="portal-banner">
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'white',
            color: 'var(--primary)',
            margin: '0 auto 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
          }}>
            <Sparkles size={32} />
          </div>
          <h2>Studio BellaNail</h2>
          <p>Alongamentos, Esmaltação em Gel & Nail Design</p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1.25rem',
            marginTop: '0.85rem',
            fontSize: '0.775rem',
            opacity: 0.95
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Star size={13} fill="#ffd700" color="#ffd700" /> 4.9 (128 avaliações)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={13} /> São Paulo - SP
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={13} /> 09:00 às 19:00
            </span>
          </div>
        </div>

        {/* Steps Breadcrumbs */}
        {!isSuccess && (
          <div className="portal-steps-bar">
            <div className={`portal-step ${step === 1 ? 'active' : ''}`}>
              1. Procedimentos
            </div>
            <div className={`portal-step ${step === 2 ? 'active' : ''}`}>
              2. Data & Horário
            </div>
            <div className={`portal-step ${step === 3 ? 'active' : ''}`}>
              3. Seus Dados
            </div>
          </div>
        )}

        <div className="portal-content">
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: '#eef7ed',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--text-main)' }}>
                Agendamento Solicitado!
              </h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.925rem' }}>
                O agendamento de <strong>{clientName}</strong> foi registrado no sistema e encaminhado ao WhatsApp da profissional!
              </p>

              <div style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                margin: '1.5rem auto',
                maxWidth: '420px',
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resumo da Reserva:</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                  {servicesSummary}
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  📅 <strong>{formatDateBr(date)}</strong> às <strong>{time}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  💅 Formato: <strong>{nailShape}</strong>
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.75rem' }}>
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
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Escolha os procedimentos que deseja realizar:
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Você pode selecionar mais de um serviço (ex: Alongamento + Nail Art).
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                    {services.map(srv => {
                      const isSelected = selectedServiceIds.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', minWidth: '0' }}>
                            {srv.imageUrl && (
                              <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                border: '1.5px solid var(--border-color)',
                                flexShrink: 0,
                                background: 'var(--surface-alt)'
                              }}>
                                <img
                                  src={srv.imageUrl}
                                  alt={srv.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              </div>
                            )}
                            <div style={{ minWidth: '0', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{srv.name}</span>
                                {srv.badge && (
                                  <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                                    {srv.badge}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                {srv.description}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                                ⏱️ Duração estimada: {srv.durationMinutes} minutos
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right', minWidth: '90px' }}>
                            <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>
                              {formatCurrency(srv.price)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                              {isSelected ? '✓ Selecionado' : '+ Adicionar'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Footer */}
                  <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tempo: {totalDuration} min</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {formatCurrency(totalAmount)}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => setStep(2)}
                      disabled={selectedServiceIds.length === 0}
                    >
                      Avançar para Data e Horário <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Data & Horário */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Escolha a melhor data e horário:
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Horários calculados para {totalDuration} minutos de atendimento.
                  </p>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
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
                      <Clock size={16} /> Horários Disponíveis para este dia
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.65rem' }}>
                      {AVAILABLE_TIMES.map(t => {
                        const isSelected = time === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTime(t)}
                            style={{
                              padding: '0.75rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                              background: isSelected ? 'var(--primary)' : 'var(--surface)',
                              color: isSelected ? 'white' : 'var(--text-main)',
                              fontWeight: 700,
                              fontSize: '0.95rem',
                              cursor: 'pointer'
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
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
                <form onSubmit={handleFinishBooking}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Informe seus dados para contato:
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                    Você receberá a confirmação direta no seu WhatsApp.
                  </p>

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

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">
                      <Sparkles size={15} /> Formato de unha desejado
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {NAIL_SHAPES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNailShape(s)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: nailShape === s ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            background: nailShape === s ? 'var(--primary-light)' : 'var(--surface)',
                            color: nailShape === s ? 'var(--primary)' : 'var(--text-main)',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Observações ou inspiração de cor</label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Gostaria de esmaltação vermelha clássica ou francesinha..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>

                  <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                      ← Voltar
                    </button>
                    <button type="submit" className="btn btn-whatsapp" style={{ padding: '0.75rem 1.25rem' }}>
                      <MessageCircle size={18} />
                      <span>Confirmar via WhatsApp ({formatCurrency(totalAmount)})</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
