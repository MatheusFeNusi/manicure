import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  Calendar, 
  ShieldAlert
} from 'lucide-react';
import type { Client, NailShape } from '../types';
import { formatCurrency, generateWhatsAppLink } from '../utils/storage';

interface ClientsViewProps {
  clients: Client[];
  onOpenNewClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onScheduleForClient: (client: Client) => void;
}

const SHAPES: (NailShape | 'Todos')[] = [
  'Todos',
  'Almond',
  'Quadrada',
  'Bailarina',
  'Stiletto',
  'Redonda',
  'Oval'
];

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onOpenNewClient,
  onEditClient,
  onDeleteClient,
  onScheduleForClient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShape, setSelectedShape] = useState<NailShape | 'Todos'>('Todos');

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.phone.includes(searchQuery);
    const matchesShape = selectedShape === 'Todos' || c.nailShape === selectedShape;
    return matchesSearch && matchesShape;
  });

  return (
    <div className="animate-fade-in">
      {/* Search and Action Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Buscar cliente por nome ou WhatsApp..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewClient}>
          <Plus size={18} /> Nova Cliente
        </button>
      </div>

      {/* Nail Shape Filter */}
      <div className="filter-bar">
        {SHAPES.map(shape => (
          <button
            key={shape}
            className={`filter-pill ${selectedShape === shape ? 'active' : ''}`}
            onClick={() => setSelectedShape(shape)}
          >
            {shape === 'Todos' ? `Todas as Clientes (${clients.length})` : `Formato ${shape}`}
          </button>
        ))}
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>Nenhuma cliente encontrada.</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Cadastre uma nova cliente ou ajuste o filtro de busca.</p>
        </div>
      ) : (
        <div className="clients-grid">
          {filteredClients.map(client => {
            const initial = client.name.charAt(0).toUpperCase();
            const waGreeting = `Olá, ${client.name}! Como estão suas unhas? Vamos agendar sua próxima manutenção no Studio BellaNail? 💅✨`;
            const waLink = generateWhatsAppLink(client.phone, waGreeting);

            return (
              <div key={client.id} className="client-card">
                <div className="client-header">
                  <div className="client-avatar">{initial}</div>
                  <div className="client-details" style={{ flex: 1 }}>
                    <h4>{client.name}</h4>
                    <p>{client.phone}</p>
                    {client.email && <p style={{ fontSize: '0.75rem' }}>{client.email}</p>}
                  </div>
                  <span className="badge badge-rose" style={{ fontSize: '0.725rem' }}>
                    {client.nailShape}
                  </span>
                </div>

                {/* Metrics */}
                <div className="client-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Total Investido</span>
                    <span className="metric-val" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(client.totalSpent)}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Atendimentos</span>
                    <span className="metric-val">{client.totalAppointments} visitas</span>
                  </div>
                </div>

                {/* Anamnesis / Notes */}
                {client.notes && (
                  <div className="client-notes">
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldAlert size={12} color="var(--accent-gold)" /> Ficha de Preferências:
                    </div>
                    {client.notes}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp"
                      title="Chamar no WhatsApp"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </a>

                    <button
                      className="btn btn-secondary"
                      onClick={() => onScheduleForClient(client)}
                      title="Agendar Horário"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <Calendar size={15} color="var(--primary)" /> Agendar
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => onEditClient(client)}
                      title="Editar Ficha"
                      style={{ padding: '0.45rem 0.65rem' }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => {
                        if (confirm(`Excluir a cliente ${client.name}?`)) {
                          onDeleteClient(client.id);
                        }
                      }}
                      title="Excluir Cliente"
                      style={{ padding: '0.45rem 0.65rem' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
