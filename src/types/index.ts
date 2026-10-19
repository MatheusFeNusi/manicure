export type NailShape = 'Quadrada' | 'Almond' | 'Stiletto' | 'Bailarina' | 'Redonda' | 'Oval';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  nailShape: NailShape;
  notes: string;
  totalSpent: number;
  totalAppointments: number;
  lastVisit: string;
  createdAt: string;
}

export type ServiceCategory = 
  | 'Alongamento' 
  | 'Manutenção' 
  | 'Esmaltação & Gel' 
  | 'Mãos & Pés' 
  | 'SPA & Tratamentos' 
  | 'Nail Art';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  description: string;
  badge?: 'Mais Pedido' | 'Tendência' | 'Especial' | 'Novo';
  icon?: string;
  imageUrl?: string;
}

export type AppointmentStatus = 
  | 'agendado' 
  | 'confirmado' 
  | 'em_atendimento' 
  | 'concluido' 
  | 'cancelado';

export type PaymentMethod = 
  | 'Pix' 
  | 'Cartão de Crédito' 
  | 'Cartão de Débito' 
  | 'Dinheiro' 
  | 'Pendente';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceIds: string[];
  servicesSummary: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  totalAmount: number;
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pago' | 'pendente';
  notes?: string;
  nailColorPreference?: string;
}

export type TransactionType = 'receita' | 'despesa';

export type TransactionCategory = 
  | 'Atendimento' 
  | 'Venda de Produtos' 
  | 'Insumos & Esmaltes' 
  | 'Aluguel & Contas' 
  | 'Marketing & Cursos' 
  | 'Outros';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  appointmentId?: string;
}

export type ActiveTab = 
  | 'dashboard' 
  | 'agenda' 
  | 'servicos' 
  | 'clientes' 
  | 'financeiro' 
  | 'agendamento_online';
