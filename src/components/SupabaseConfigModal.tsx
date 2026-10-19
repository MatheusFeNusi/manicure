import { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import { SUPABASE_URL, getSupabaseAnonKey, setSupabaseAnonKey, resetSupabaseClient } from '../utils/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

const SQL_SCHEMA = `-- Copie e cole este script no SQL Editor do Supabase:
create table if not exists public.clients (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  birth_date text,
  nail_shape text default 'Almond',
  notes text,
  total_spent numeric default 0,
  total_appointments integer default 0,
  last_visit text,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id text primary key,
  name text not null,
  category text not null,
  price numeric not null default 0,
  duration_minutes integer not null default 60,
  description text,
  badge text,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id text primary key,
  client_id text references public.clients(id) on delete set null,
  client_name text not null,
  client_phone text,
  service_ids text[],
  services_summary text,
  date text not null,
  time text not null,
  duration_minutes integer default 60,
  total_amount numeric default 0,
  status text default 'agendado',
  payment_method text default 'Pix',
  payment_status text default 'pendente',
  notes text,
  nail_color_preference text,
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id text primary key,
  type text not null,
  category text not null,
  description text not null,
  amount numeric not null default 0,
  date text not null,
  payment_method text,
  appointment_id text references public.appointments(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.transactions enable row level security;

create policy "Acesso público clients" on public.clients for all using (true) with check (true);
create policy "Acesso público services" on public.services for all using (true) with check (true);
create policy "Acesso público appointments" on public.appointments for all using (true) with check (true);
create policy "Acesso público transactions" on public.transactions for all using (true) with check (true);
`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected
}) => {
  const [anonKey, setAnonKey] = useState(getSupabaseAnonKey());
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseAnonKey(anonKey);
    resetSupabaseClient();
    setSavedSuccess(true);
    onConnected();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: '#eef7ed', padding: '0.5rem', borderRadius: '10px', color: '#2e7d32' }}>
              <Database size={22} />
            </div>
            <div>
              <h3>Conectar Banco Supabase</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sincronização em nuvem para clientes, serviços e agenda</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Project URL */}
            <div className="form-group">
              <label className="form-label">
                <Database size={15} /> URL do seu Projeto Supabase
              </label>
              <input
                type="text"
                value={SUPABASE_URL}
                disabled
                style={{ background: 'var(--surface-alt)', color: 'var(--text-muted)', fontWeight: 600 }}
              />
              <span className="form-hint">URL vinculada: {SUPABASE_URL}</span>
            </div>

            {/* Anon Key */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">
                  <ShieldCheck size={15} color="#2e7d32" /> Chave Pública (Anon Key)
                </label>
                <a
                  href={`${SUPABASE_URL}/project/default/settings/api`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}
                >
                  Onde achar no painel? <ExternalLink size={12} />
                </a>
              </div>
              <input
                type="password"
                placeholder="Cole sua anon key (ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                required
              />
              <span className="form-hint">
                No painel Supabase: <strong>Project Settings ⚙️ → API → Project API Keys → anon / public</strong>
              </span>
            </div>

            {/* SQL Script Accordion / Copy */}
            <div style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Script de Tabelas SQL (Schema)
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCopySql}
                  style={{ fontSize: '0.775rem', padding: '0.35rem 0.65rem' }}
                >
                  {copiedSql ? <Check size={14} color="#2e7d32" /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                Se ainda não criou as tabelas no Supabase, clique em <strong>Copiar SQL</strong> e cole no menu <strong>SQL Editor</strong> do painel Supabase.
              </p>
            </div>

            {savedSuccess && (
              <div style={{
                background: '#eef7ed',
                border: '1px solid #c8e6c9',
                color: '#2e7d32',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Check size={18} /> Chave salva com sucesso! Sincronizando com Supabase...
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" style={{ background: '#2e7d32' }}>
              <Database size={16} /> Salvar e Conectar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
