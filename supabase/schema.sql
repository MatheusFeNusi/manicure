-- ========================================================
-- Schema BellaNail Studio para Supabase
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://etcavgnvcsouujdnrnsf.supabase.co
-- ========================================================

-- 1. Tabela de Clientes
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

-- 2. Tabela de Catálogo de Serviços
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

-- 3. Tabela de Agendamentos
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

-- 4. Tabela de Transações Financeiras (Fluxo de Caixa)
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

-- ========================================================
-- Políticas de Segurança (Row Level Security - RLS)
-- Permite leitura e escrita pública com anon key
-- ========================================================

alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.transactions enable row level security;

-- Policies para clients
create policy "Acesso público clients" on public.clients for all using (true) with check (true);

-- Policies para services
create policy "Acesso público services" on public.services for all using (true) with check (true);

-- Policies para appointments
create policy "Acesso público appointments" on public.appointments for all using (true) with check (true);

-- Policies para transactions
create policy "Acesso público transactions" on public.transactions for all using (true) with check (true);
