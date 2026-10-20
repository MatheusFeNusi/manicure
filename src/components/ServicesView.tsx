import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Search
} from 'lucide-react';
import type { Service } from '../types';
import { formatCurrency } from '../utils/storage';

interface ServicesViewProps {
  services: Service[];
  onOpenNewService: () => void;
  onEditService: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

const CATEGORIES = [
  'Todas',
  'Alongamento',
  'Manutenção',
  'Esmaltação & Gel',
  'Mãos & Pés',
  'SPA & Tratamentos',
  'Nail Art'
];

export const ServicesView: React.FC<ServicesViewProps> = ({
  services,
  onOpenNewService,
  onEditService,
  onDeleteService
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = services.filter(srv => {
    const matchesCat = selectedCategory === 'Todas' || srv.category === selectedCategory;
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 'auto' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input
              type="text"
              placeholder="Buscar serviço por nome ou descrição..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewService}>
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      {/* Category Pills */}
      <div className="filter-bar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat} {cat === 'Todas' ? `(${services.length})` : ''}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="section-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted)' }}>
          <Sparkles size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <h3>Nenhum serviço encontrado.</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Experimente alterar a categoria ou o termo de busca.</p>
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map(srv => (
            <div key={srv.id} className="service-card">
              <div>
                <div className="service-card-top">
                  {srv.imageUrl && (
                    <div className="service-image-wrapper">
                      <img src={srv.imageUrl} alt={srv.name} className="service-image" />
                    </div>
                  )}
                  <span className="service-category-tag">{srv.category}</span>
                  {srv.badge && (
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {srv.badge}
                    </span>
                  )}
                </div>

                <h4>{srv.name}</h4>
                <p>{srv.description}</p>
              </div>

              <div className="service-card-bottom">
                <div>
                  <div className="service-price">{formatCurrency(srv.price)}</div>
                  <div className="service-duration">
                    <Clock size={13} /> {srv.durationMinutes} minutos de cabine
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => onEditService(srv)}
                    title="Editar Serviço"
                    style={{ padding: '0.45rem 0.65rem' }}
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    className="btn btn-danger-outline"
                    onClick={() => {
                      if (confirm(`Excluir o serviço "${srv.name}"?`)) {
                        onDeleteService(srv.id);
                      }
                    }}
                    title="Excluir Serviço"
                    style={{ padding: '0.45rem 0.65rem' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};