import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Client, Service, Appointment, Transaction } from '../types';

export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://etcavgnvcsouujdnrnsf.supabase.co';

const STORAGE_KEY_ANON = 'bellanail_supabase_anon_key';

export const getSupabaseAnonKey = (): string => {
  const localKey = localStorage.getItem(STORAGE_KEY_ANON);
  if (localKey && localKey.trim()) return localKey.trim();
  return (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
};

export const setSupabaseAnonKey = (key: string) => {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const key = getSupabaseAnonKey();
  if (!key) return null;
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(SUPABASE_URL, key);
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }
  return supabaseInstance;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};

export const isSupabaseConnected = (): boolean => {
  return !!getSupabaseAnonKey();
};

// ==========================================
// MAPPERS: TypeScript <-> Supabase Database
// ==========================================

export const mapClientToDb = (c: Client) => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email || null,
  birth_date: c.birthDate || null,
  nail_shape: c.nailShape,
  notes: c.notes || null,
  total_spent: c.totalSpent || 0,
  total_appointments: c.totalAppointments || 0,
  last_visit: c.lastVisit || null
});

export const mapClientFromDb = (row: any): Client => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  email: row.email || undefined,
  birthDate: row.birth_date || undefined,
  nailShape: row.nail_shape || 'Almond',
  notes: row.notes || '',
  totalSpent: Number(row.total_spent) || 0,
  totalAppointments: Number(row.total_appointments) || 0,
  lastVisit: row.last_visit || new Date().toISOString().split('T')[0],
  createdAt: row.created_at || new Date().toISOString().split('T')[0]
});

export const mapServiceToDb = (s: Service) => ({
  id: s.id,
  name: s.name,
  category: s.category,
  price: s.price,
  duration_minutes: s.durationMinutes,
  description: s.description || null,
  badge: s.badge || null
});

export const mapServiceFromDb = (row: any): Service => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price) || 0,
  durationMinutes: Number(row.duration_minutes) || 60,
  description: row.description || '',
  badge: row.badge || undefined
});

export const mapAppointmentToDb = (a: Appointment) => ({
  id: a.id,
  client_id: a.clientId || null,
  client_name: a.clientName,
  client_phone: a.clientPhone || null,
  service_ids: a.serviceIds || [],
  services_summary: a.servicesSummary || '',
  date: a.date,
  time: a.time,
  duration_minutes: a.durationMinutes || 60,
  total_amount: a.totalAmount || 0,
  status: a.status || 'agendado',
  payment_method: a.paymentMethod || 'Pix',
  payment_status: a.paymentStatus || 'pendente',
  notes: a.notes || null,
  nail_color_preference: a.nailColorPreference || null
});

export const mapAppointmentFromDb = (row: any): Appointment => ({
  id: row.id,
  clientId: row.client_id || '',
  clientName: row.client_name,
  clientPhone: row.client_phone || '',
  serviceIds: row.service_ids || [],
  servicesSummary: row.services_summary || '',
  date: row.date,
  time: row.time,
  durationMinutes: Number(row.duration_minutes) || 60,
  totalAmount: Number(row.total_amount) || 0,
  status: row.status || 'agendado',
  paymentMethod: row.payment_method || 'Pix',
  paymentStatus: row.payment_status || 'pendente',
  notes: row.notes || undefined,
  nailColorPreference: row.nail_color_preference || undefined
});

export const mapTransactionToDb = (t: Transaction) => ({
  id: t.id,
  type: t.type,
  category: t.category,
  description: t.description,
  amount: t.amount,
  date: t.date,
  payment_method: t.paymentMethod || 'Pix',
  appointment_id: t.appointmentId || null
});

export const mapTransactionFromDb = (row: any): Transaction => ({
  id: row.id,
  type: row.type,
  category: row.category,
  description: row.description,
  amount: Number(row.amount) || 0,
  date: row.date,
  paymentMethod: row.payment_method || 'Pix',
  appointmentId: row.appointment_id || undefined
});

// ==========================================
// Database Services (Fetch & Upsert)
// ==========================================

export const syncFromSupabase = async () => {
  const client = getSupabase();
  if (!client) return null;

  try {
    const [cRes, sRes, aRes, tRes] = await Promise.all([
      client.from('clients').select('*'),
      client.from('services').select('*'),
      client.from('appointments').select('*'),
      client.from('transactions').select('*')
    ]);

    return {
      clients: cRes.data ? cRes.data.map(mapClientFromDb) : null,
      services: sRes.data ? sRes.data.map(mapServiceFromDb) : null,
      appointments: aRes.data ? aRes.data.map(mapAppointmentFromDb) : null,
      transactions: tRes.data ? tRes.data.map(mapTransactionFromDb) : null
    };
  } catch (err) {
    console.warn('Erro ao sincronizar com Supabase:', err);
    return null;
  }
};

export const syncUpsertClient = async (clientData: Client) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('clients').upsert(mapClientToDb(clientData));
  } catch (err) {
    console.error('Falha ao salvar cliente no Supabase:', err);
  }
};

export const syncDeleteClient = async (id: string) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('clients').delete().eq('id', id);
  } catch (err) {
    console.error('Falha ao deletar cliente no Supabase:', err);
  }
};

export const syncUpsertService = async (serviceData: Service) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('services').upsert(mapServiceToDb(serviceData));
  } catch (err) {
    console.error('Falha ao salvar serviço no Supabase:', err);
  }
};

export const syncDeleteService = async (id: string) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('services').delete().eq('id', id);
  } catch (err) {
    console.error('Falha ao deletar serviço no Supabase:', err);
  }
};

export const syncUpsertAppointment = async (aptData: Appointment) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('appointments').upsert(mapAppointmentToDb(aptData));
  } catch (err) {
    console.error('Falha ao salvar agendamento no Supabase:', err);
  }
};

export const syncDeleteAppointment = async (id: string) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('appointments').delete().eq('id', id);
  } catch (err) {
    console.error('Falha ao deletar agendamento no Supabase:', err);
  }
};

export const syncUpsertTransaction = async (txData: Transaction) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('transactions').upsert(mapTransactionToDb(txData));
  } catch (err) {
    console.error('Falha ao salvar transação no Supabase:', err);
  }
};

export const syncDeleteTransaction = async (id: string) => {
  const client = getSupabase();
  if (!client) return;
  try {
    await client.from('transactions').delete().eq('id', id);
  } catch (err) {
    console.error('Falha ao deletar transação no Supabase:', err);
  }
};
