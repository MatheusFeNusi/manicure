import React, { useState } from 'react';
import { X, UserPlus, Phone, Calendar, ShieldAlert, Sparkles } from 'lucide-react';
import type { Client, NailShape } from '../types';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initialData?: Client | null;
}

const NAIL_SHAPES: { shape: NailShape; desc: string }[] = [
  { shape: 'Almond', desc: 'Amendoada e clássica' },
  { shape: 'Quadrada', desc: 'Retas e modernas' },
  { shape: 'Bailarina', desc: 'Afunilada com ponta reta' },
  { shape: 'Stiletto', desc: 'Pontiaguda marcante' },
  { shape: 'Redonda', desc: 'Prática e delicada' },
  { shape: 'Oval', desc: 'Alongamento suave' },
];

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [nailShape, setNailShape] = useState<NailShape>(initialData?.nailShape || 'Almond');
  const [notes, setNotes] = useState(initialData?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const client: Client = {
      id: initialData?.id || 'cli-' + Date.now(),
      name,
      phone,
      email: email || undefined,
      birthDate: birthDate || undefined,
      nailShape,
      notes,
      totalSpent: initialData?.totalSpent || 0,
      totalAppointments: initialData?.totalAppointments || 0,
      lastVisit: initialData?.lastVisit || new Date().toISOString().split('T')[0],
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0]
    };

    onSave(client);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: '10px', color: 'var(--primary)' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3>{initialData ? 'Editar Cliente' : 'Nova Cliente & Ficha de Anamnese'}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mantenha o histórico e preferências de cada cliente</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Beatriz Lima"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={15} /> WhatsApp / Celular
                </label>
                <input
                  type="text"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} /> Data de Nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail (opcional)</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Formato de Unha Favorito */}
            <div className="form-group">
              <label className="form-label">
                <Sparkles size={15} /> Formato de Unha Favorito
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem'
              }}>
                {NAIL_SHAPES.map(item => {
                  const isSelected = nailShape === item.shape;
                  return (
                    <button
                      key={item.shape}
                      type="button"
                      onClick={() => setNailShape(item.shape)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-light)' : 'var(--surface)',
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.shape}</div>
                      <div style={{ fontSize: '0.7rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha de Anamnese / Cuidados Especiais */}
            <div className="form-group">
              <label className="form-label">
                <ShieldAlert size={15} /> Ficha & Cuidados Especiais (Alergias, Cutícula, etc.)
              </label>
              <textarea
                rows={3}
                placeholder="Ex: Cutícula fininha; tem alergia a esmaltes tradicionais com tolueno; gosta de café com leite durante o atendimento..."
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
              Salvar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
