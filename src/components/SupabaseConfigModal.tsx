import { useState } from 'react';
import { X, Database, Check, Copy, ExternalLink, AlertCircle, ShieldCheck } from 'lucide-react';
import { isSupabaseConnected } from '../utils/supabase';

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
  type text not null check (type in ('receita', 'despesa')),
  category text not null,
  description text not null,
  amount numeric not null default 0,
  date text not null,
  payment_method text,
  appointment_id text references public.appointments(id) on delete set null,
  created_at timestamptz default now()
);

-- RLS policies (permite acesso público com anon key)
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.transactions enable row level security;

create policy "Acesso público clients" on public.clients for all using (true) with check (true);
create policy "Acesso público services" on public.services for all using (true) with check (true);
create policy "Acesso público appointments" on public.appointments for all using (true) with check (true);
create policy "Acesso público transactions" on public.transactions for all using (true) with check (true);

-- Habilite Realtime na tabela 'servicos' no painel Supabase:
-- Database → Replication → Enable replication for 'servicos'`;

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestResult('testing');
    setTestError(null);
    try {
      // Tenta conectar usando as env vars
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        throw new Error('Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não definidas no .env');
      }
      
      const res = await fetch(`${url}/rest/v1/services?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Erro ${res.status}`);
      }
      
      setTestResult('success');
      onConnected();
    } catch (err: any) {
      setTestResult('error');
      setTestError(err.message);
    }
  };

  const handleCopyEnv = () => {
    const envContent = `VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui`;
    navigator.clipboard.writeText(envContent);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '720px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={22} />
            <h3>Conexão Supabase (via .env)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Status badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '1rem', borderRadius: 'var(--radius-md)',
            background: isSupabaseConnected() ? '#eef7ed' : '#fff8e1',
            border: `1px solid ${isSupabaseConnected() ? '#c8e6c9' : '#ffe0b2'}`,
            color: isSupabaseConnected() ? '#2e7d32' : '#e65100'
          }}>
            {isSupabaseConnected() ? (
              <>
                <ShieldCheck size={20} /> <strong>Configurado via .env</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.8rem' }}>
                  VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY detectadas
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={20} /> <strong>Não configurado</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.8rem' }}>
                  Crie um arquivo .env na raiz do projeto
                </span>
              </>
            )}
          </div>

          {/* Como configurar */}
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Como configurar o .env
            </h4>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Copie o arquivo <code>.env.example</code> para <code>.env</code> na raiz do projeto</li>
              <li>Preencha <code>VITE_SUPABASE_URL</code> (ex: <code>https://seu-projeto.supabase.co</code>)</li>
              <li>Preencha <code>VITE_SUPABASE_ANON_KEY</code> (chave <code>anon / public</code> do painel Supabase)</li>
              <li>Reinicie o servidor de desenvolvimento (<code>npm run dev</code>)</li>
            </ol>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleCopyEnv}
              style={{ marginTop: '0.75rem', width: 'auto' }}
            >
              <Copy size={14} /> Copiar template .env
            </button>
          </div>

          {/* Teste de conexão */}
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Testar conexão com Supabase
            </h4>
            <button
              type="button"
              className={`btn ${testResult === 'success' ? 'btn-success' : testResult === 'error' ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleTestConnection}
              disabled={testResult === 'testing' || !isSupabaseConnected()}
              style={{ width: 'auto' }}
            >
              {testResult === 'testing' ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                    <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="30 70" strokeLinecap="round"/></svg>
                  </span> Testando...
                </>
              ) : testResult === 'success' ? (
                <>
                  <Check size={16} /> Conectado com sucesso!
                </>
              ) : testResult === 'error' ? (
                <>
                  <AlertCircle size={16} /> Erro: {testError}
                </>
              ) : (
                <>
                  <Database size={16} /> Testar conexão
                </>
              )}
            </button>
          </div>

          {/* SQL Schema */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              Script SQL para criar as tabelas
            </h4>
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
                  Schema completo (tabelas + RLS + Realtime)
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
              <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
                ⚠️ <strong>Importante:</strong> Após criar as tabelas, vá em <strong>Database → Replication</strong> no painel Supabase e habilite <strong>Realtime</strong> para a tabela <code>servicos</code> para sincronização em tempo real.
              </p>
            </div>
          </div>

          {/* Link para painel */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'underline' }}
            >
              Abrir painel do Supabase <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};