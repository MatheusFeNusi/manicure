import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Client, Service, Appointment, Transaction, AppointmentStatus } from '../types';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://etcavgnvcsouujdnrnsf.supabase.co';

const DEFAULT_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y2F2Z252Y3NvdXVqZG5ybnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjQzMTgyNiwiZXhwIjoyMTA4MDA3ODI2fQ.bGNbCXneESfoLU9yBvCcn0xUfXdYQN2bj0jc87ZVwrA';

const STORAGE_KEY_ANON = 'bellanail_supabase_anon_key';

export const getSupabaseAnonKey = (): string => {
  const localKey = localStorage.getItem(STORAGE_KEY_ANON);
  if (localKey && localKey.trim()) return localKey.trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (envKey) return envKey;
  return DEFAULT_KEY;
};

export const setSupabaseAnonKey = (key: string) => {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_ANON, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!supabaseInstance) {
    const key = getSupabaseAnonKey();
    supabaseInstance = createClient(SUPABASE_URL, key);
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
// Mappers for Existing Supabase Tables:
// servicos, painel_agendamentos, agendamentos
// ==========================================

export const mapSupabaseService = (row: any): Service => {
  let category: Service['category'] = 'Alongamento';
  const nameLower = (row.nome || '').toLowerCase();
  if (nameLower.includes('manuten')) category = 'Manutenção';
  else if (nameLower.includes('gel') || nameLower.includes('blindagem')) category = 'Esmaltação & Gel';
  else if (nameLower.includes('spa') || nameLower.includes('podal')) category = 'SPA & Tratamentos';
  else if (nameLower.includes('art') || nameLower.includes('reversa')) category = 'Nail Art';
  else if (nameLower.includes('mão') || nameLower.includes('pé') || nameLower.includes('cutil')) category = 'Mãos & Pés';

  return {
    id: row.id,
    name: row.nome,
    category,
    price: Number(row.preco) || 0,
    durationMinutes: Number(row.duracao_minutos) || 60,
    description: `Procedimento profissional no Studio BellaNail. Duração média: ${row.duracao_minutos || 60} min.`,
    badge: (row.preco > 100 ? 'Mais Pedido' : row.duracao_minutos <= 45 ? 'Especial' : 'Tendência') as Service['badge'],
    imageUrl: row.image_url || undefined
  };
};

export const mapSupabaseAppointment = (row: any): Appointment => {
  let date = new Date().toISOString().split('T')[0];
  let time = '14:00';

  if (row.data_hora) {
    try {
      const d = new Date(row.data_hora);
      date = d.toISOString().split('T')[0];
      time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      // keep fallback
    }
  }

  let mappedStatus: AppointmentStatus = 'agendado';
  const statusStr = (row.status || '').toLowerCase();
  if (statusStr.includes('confirm')) mappedStatus = 'confirmado';
  else if (statusStr.includes('atend')) mappedStatus = 'em_atendimento';
  else if (statusStr.includes('conclu')) mappedStatus = 'concluido';
  else if (statusStr.includes('canc')) mappedStatus = 'cancelado';

  return {
    id: row.id,
    clientId: 'cli-' + (row.celular || row.id),
    clientName: row.nome_cliente || 'Cliente',
    clientPhone: row.celular || '',
    serviceIds: [row.servico_id || 'srv-default'],
    servicesSummary: row.servico || 'Procedimento',
    date,
    time,
    durationMinutes: 60,
    totalAmount: Number(row.preco) || 0,
    status: mappedStatus,
    paymentMethod: 'Pix',
    paymentStatus: row.sinal_valor > 0 ? 'pago' : 'pendente',
    notes: row.sinal_valor ? `Sinal pago: R$ ${row.sinal_valor}` : undefined
  };
};

// ==========================================
// Database Services (Fetch & Realtime Sync)
// ==========================================

export const syncFromSupabase = async () => {
  const client = getSupabase();

  try {
    // 1. Fetch Services from `servicos`
    const { data: servicosData, error: sErr } = await client
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('preco', { ascending: false });

    // 2. Fetch Appointments from `painel_agendamentos` (or `agendamentos`)
    const { data: agendamentosData, error: aErr } = await client
      .from('painel_agendamentos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (sErr) console.warn('Erro buscando servicos:', sErr);
    if (aErr) console.warn('Erro buscando agendamentos:', aErr);

    const services = servicosData && servicosData.length > 0
      ? servicosData.map(mapSupabaseService)
      : null;

    const appointments = agendamentosData && agendamentosData.length > 0
      ? agendamentosData.map(mapSupabaseAppointment)
      : null;

    // Derive clients from appointments if any
    let clients: Client[] | null = null;
    if (appointments && appointments.length > 0) {
      const clientMap = new Map<string, Client>();
      appointments.forEach(apt => {
        if (!clientMap.has(apt.clientPhone || apt.clientName)) {
          clientMap.set(apt.clientPhone || apt.clientName, {
            id: apt.clientId,
            name: apt.clientName,
            phone: apt.clientPhone,
            nailShape: 'Almond',
            notes: 'Cliente sincronizada via Supabase',
            totalSpent: apt.totalAmount,
            totalAppointments: 1,
            lastVisit: apt.date,
            createdAt: apt.date
          });
        }
      });
      clients = Array.from(clientMap.values());
    }

    return {
      services,
      appointments,
      clients,
      transactions: null as Transaction[] | null
    };
  } catch (err) {
    console.warn('Erro ao sincronizar com Supabase:', err);
    return null;
  }
};

export const syncUpsertService = async (serviceData: Service): Promise<{ ok: boolean; error?: string }> => {
  const client = getSupabase();
  if (!isSupabaseConnected()) {
    return { ok: false, error: 'Supabase nao conectado' };
  }
  try {
    await client.from('servicos').upsert({
      id: serviceData.id,
      nome: serviceData.name,
      preco: serviceData.price,
      duracao_minutos: serviceData.durationMinutes,
      ativo: true,
      image_url: serviceData.imageUrl || null
    });
    return { ok: true };
  } catch (err: any) {
    console.error('Falha ao salvar servico no Supabase:', err);
    return { ok: false, error: err?.message || 'Erro ao salvar servico' };
  }
};

export const syncDeleteService = async (id: string): Promise<{ ok: boolean; error?: string }> => {
  const client = getSupabase();
  if (!isSupabaseConnected()) {
    return { ok: false, error: 'Supabase nao conectado' };
  }
  try {
    await client.from('servicos').update({ ativo: false }).eq('id', id);
    return { ok: true };
  } catch (err: any) {
    console.error('Falha ao deletar servico no Supabase:', err);
    return { ok: false, error: err?.message || 'Erro ao deletar servico' };
  }
};

export const syncCreateAppointment = async (
  nome: string,
  celular: string,
  servicoId: string,
  date: string,
  time: string
) => {
  const client = getSupabase();
  try {
    // 1. Create horario slot
    const dataHora = `${date}T${time}:00-03:00`;
    const { data: slot, error: slotErr } = await client
      .from('horarios')
      .insert({ data_hora: dataHora, disponivel: false })
      .select('id')
      .single();

    if (slotErr || !slot) {
      console.warn('Aviso ao criar horário:', slotErr);
    }

    const horarioId = slot ? slot.id : null;

    // 2. Call agendar RPC or insert direct
    if (horarioId && servicoId) {
      const { data: rpcRes, error: rpcErr } = await client.rpc('agendar', {
        p_nome: nome,
        p_celular: celular,
        p_servico_id: servicoId,
        p_horario_id: horarioId
      });
      if (!rpcErr && rpcRes) return rpcRes;
    }

    // Direct insert fallback
    const { data: directApt } = await client
      .from('agendamentos')
      .insert({
        nome_cliente: nome,
        celular: celular,
        servico_id: servicoId,
        horario_id: horarioId,
        status: 'confirmado',
        sinal_valor: 0
      })
      .select('id')
      .single();

    return directApt?.id;
  } catch (err) {
    console.error('Erro ao agendar no Supabase:', err);
  }
};

export const syncUpdateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
  const client = getSupabase();
  try {
    if (status === 'cancelado') {
      await client.rpc('cancelar_agendamento', { p_agendamento_id: id });
    } else if (status === 'confirmado' || status === 'concluido') {
      await client.rpc('confirmar_sinal', { p_agendamento_id: id });
    }

    await client
      .from('agendamentos')
      .update({ status })
      .eq('id', id);
  } catch (err) {
    console.error('Falha ao atualizar status no Supabase:', err);
  }
};

export const syncDeleteAppointment = async (id: string) => {
  const client = getSupabase();
  try {
    await client.from('agendamentos').delete().eq('id', id);
  } catch (err) {
    console.error('Falha ao deletar agendamento no Supabase:', err);
  }
};

// Fallback no-op helpers for clients & transactions
export const syncUpsertClient = async (_c: Client) => {};
export const syncDeleteClient = async (_id: string) => {};
export const syncUpsertTransaction = async (_t: Transaction) => {};
export const syncDeleteTransaction = async (_id: string) => {};

/**
 * Inscreve em mudanças em tempo real da tabela 'servicos' no Supabase.
 * Chama onChange(services) sempre que houver INSERT/UPDATE/DELETE.
 * Retorna funcao para cancelar a inscricao.
 */
export const subscribeToServiceChanges = (onChange: (services: Service[]) => void) => {
  const client = getSupabase();
  const channel = client.channel('services-changes');

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'servicos'
      },
      async () => {
        try {
          const data = await syncFromSupabase();
          if (data?.services && data.services.length > 0) {
            onChange(data.services);
          }
        } catch (err) {
          console.warn('Erro ao sincronizar servicos em tempo real:', err);
        }
      }
    )
    .subscribe();

  return () => {
    try {
      channel.unsubscribe();
    } catch {
      // ignore
    }
  };
};
