import type { Client, Service, Appointment, Transaction } from '../types';

const formatDate = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Alongamento em Fibra de Vidro',
    category: 'Alongamento',
    price: 160,
    durationMinutes: 120,
    description: 'Alongamento super natural e resistente com acabamento fino e cutilagem russa inclusa.',
    badge: 'Mais Pedido',
    imageUrl: 'https://images.unsplash.com/photo-1596452760668-5369013c5e6b?w=400&h=400&fit=crop'
  },
  {
    id: 'srv-2',
    name: 'Manutenção Fibra de Vidro',
    category: 'Manutenção',
    price: 110,
    durationMinutes: 90,
    description: 'Nivelamento do crescimento, reposição de fibra, reforço de estrutura e esmaltação.',
    badge: 'Mais Pedido'
  },
  {
    id: 'srv-3',
    name: 'Esmaltação em Gel (Mãos)',
    category: 'Esmaltação & Gel',
    price: 75,
    durationMinutes: 60,
    description: 'Unhas impecáveis, com brilho espelhado e secagem imediata na cabine UV/LED por até 21 dias.',
    badge: 'Tendência'
  },
  {
    id: 'srv-4',
    name: 'Blindagem Diamante com Gel',
    category: 'Esmaltação & Gel',
    price: 85,
    durationMinutes: 60,
    description: 'Camada protetora nas unhas naturais para evitar quebras e descamações, mantendo a esmaltação intacta.',
    badge: 'Tendência'
  },
  {
    id: 'srv-5',
    name: 'Manicure e Pedicure Tradicional',
    category: 'Mãos & Pés',
    price: 65,
    durationMinutes: 75,
    description: 'Higienização profunda, cutilagem alinhada, esfoliação leve e esmaltação tradicional impecável.',
  },
  {
    id: 'srv-6',
    name: 'Cutilagem e Esmaltação (Apenas Mãos)',
    category: 'Mãos & Pés',
    price: 40,
    durationMinutes: 45,
    description: 'Cutilagem delicada, lixamento no formato desejado e esmaltação com acabamento perfeito.',
  },
  {
    id: 'srv-7',
    name: 'SPA dos Pés com Plástica Podal',
    category: 'SPA & Tratamentos',
    price: 90,
    durationMinutes: 60,
    description: 'Tratamento intensivo contra ressecamento e rachaduras, hidratação profunda com parafina térmica e massagem relaxante.',
    badge: 'Especial'
  },
  {
    id: 'srv-8',
    name: 'Nail Art Encapsulada / Francesa Reversa',
    category: 'Nail Art',
    price: 35,
    durationMinutes: 30,
    description: 'Decoração artística personalizada: encapsulamento de folhas de ouro, glitter fino, pedrarias ou babyboomer.',
    badge: 'Tendência'
  },
  {
    id: 'srv-9',
    name: 'Remoção Segura de Alongamento',
    category: 'Alongamento',
    price: 50,
    durationMinutes: 45,
    description: 'Remoção com brocas especiais sem danificar a lâmina ungueal, com hidratação reconstrutora.',
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Camila Fernandes',
    phone: '(11) 98765-4321',
    email: 'camila.fernandes@email.com',
    birthDate: '1995-04-12',
    nailShape: 'Almond',
    notes: 'Cutícula muito sensível. Ama tons nude e francesinha fina com brilho sutil.',
    totalSpent: 640,
    totalAppointments: 5,
    lastVisit: formatDate(0),
    createdAt: formatDate(-60)
  },
  {
    id: 'cli-2',
    name: 'Larissa Albuquerque',
    phone: '(11) 97654-3210',
    email: 'larissa.alb@email.com',
    birthDate: '1998-08-25',
    nailShape: 'Bailarina',
    notes: 'Gosta de unhas longas, esmaltes escuros (vermelho fechado, preto) e nail art encapsulada.',
    totalSpent: 480,
    totalAppointments: 3,
    lastVisit: formatDate(-14),
    createdAt: formatDate(-45)
  },
  {
    id: 'cli-3',
    name: 'Juliana Paes Ribeiro',
    phone: '(11) 99123-4567',
    email: 'ju.ribeiro@email.com',
    birthDate: '1992-11-03',
    nailShape: 'Quadrada',
    notes: 'Faz esmaltação em gel frequente para eventos corporativos. Pontualíssima.',
    totalSpent: 525,
    totalAppointments: 7,
    lastVisit: formatDate(0),
    createdAt: formatDate(-90)
  },
  {
    id: 'cli-4',
    name: 'Beatriz Martins',
    phone: '(11) 98234-5678',
    email: 'bia.martins@email.com',
    birthDate: '2001-02-18',
    nailShape: 'Stiletto',
    notes: 'Alergia a esmaltes com tolueno (usar sempre linha hipoalergênica / gel aprovado).',
    totalSpent: 320,
    totalAppointments: 2,
    lastVisit: formatDate(-5),
    createdAt: formatDate(-30)
  },
  {
    id: 'cli-5',
    name: 'Mariana Duarte',
    phone: '(11) 97345-6789',
    birthDate: '1989-07-30',
    nailShape: 'Redonda',
    notes: 'Prefere corte natural curto e SPA dos pés a cada 15 dias.',
    totalSpent: 450,
    totalAppointments: 5,
    lastVisit: formatDate(-1),
    createdAt: formatDate(-75)
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clientId: 'cli-1',
    clientName: 'Camila Fernandes',
    clientPhone: '(11) 98765-4321',
    serviceIds: ['srv-2', 'srv-8'],
    servicesSummary: 'Manutenção Fibra + Nail Art Encapsulada',
    date: formatDate(0),
    time: '09:00',
    durationMinutes: 120,
    totalAmount: 145,
    status: 'concluido',
    paymentMethod: 'Pix',
    paymentStatus: 'pago',
    notes: 'Pediu francesinha clássica na ponta.',
    nailColorPreference: 'Nude Rosê com Glitter Dourado'
  },
  {
    id: 'apt-2',
    clientId: 'cli-3',
    clientName: 'Juliana Paes Ribeiro',
    clientPhone: '(11) 99123-4567',
    serviceIds: ['srv-3'],
    servicesSummary: 'Esmaltação em Gel (Mãos)',
    date: formatDate(0),
    time: '11:30',
    durationMinutes: 60,
    totalAmount: 75,
    status: 'em_atendimento',
    paymentMethod: 'Cartão de Crédito',
    paymentStatus: 'pendente',
    notes: 'Escolheu cor Vinho Marsala.',
    nailColorPreference: 'Vinho Marsala'
  },
  {
    id: 'apt-3',
    clientId: 'cli-2',
    clientName: 'Larissa Albuquerque',
    clientPhone: '(11) 97654-3210',
    serviceIds: ['srv-1'],
    servicesSummary: 'Alongamento em Fibra de Vidro',
    date: formatDate(0),
    time: '14:00',
    durationMinutes: 120,
    totalAmount: 160,
    status: 'confirmado',
    paymentMethod: 'Pix',
    paymentStatus: 'pendente',
    notes: 'Primeira aplicação de fibra da temporada.',
    nailColorPreference: 'Baby Boomer degradê'
  },
  {
    id: 'apt-4',
    clientId: 'cli-5',
    clientName: 'Mariana Duarte',
    clientPhone: '(11) 97345-6789',
    serviceIds: ['srv-5', 'srv-7'],
    servicesSummary: 'Manicure & Pedicure + SPA dos Pés',
    date: formatDate(0),
    time: '16:30',
    durationMinutes: 135,
    totalAmount: 155,
    status: 'agendado',
    paymentMethod: 'Pendente',
    paymentStatus: 'pendente',
    notes: 'Massagem relaxante nos pés com essência de lavanda.'
  },
  {
    id: 'apt-5',
    clientId: 'cli-4',
    clientName: 'Beatriz Martins',
    clientPhone: '(11) 98234-5678',
    serviceIds: ['srv-4'],
    servicesSummary: 'Blindagem Diamante com Gel',
    date: formatDate(1),
    time: '10:00',
    durationMinutes: 60,
    totalAmount: 85,
    status: 'agendado',
    paymentMethod: 'Pix',
    paymentStatus: 'pendente',
    notes: 'Lembrar de produto hipoalergênico.'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'receita',
    category: 'Atendimento',
    description: 'Atendimento Camila Fernandes (Manutenção + Nail Art)',
    amount: 145,
    date: formatDate(0),
    paymentMethod: 'Pix',
    appointmentId: 'apt-1'
  },
  {
    id: 'tx-2',
    type: 'receita',
    category: 'Atendimento',
    description: 'Atendimento Mariana Duarte (SPA dos Pés)',
    amount: 155,
    date: formatDate(-1),
    paymentMethod: 'Cartão de Débito'
  },
  {
    id: 'tx-3',
    type: 'receita',
    category: 'Venda de Produtos',
    description: 'Óleo Hidratante de Cutículas com Caneta',
    amount: 35,
    date: formatDate(-1),
    paymentMethod: 'Pix'
  },
  {
    id: 'tx-4',
    type: 'despesa',
    category: 'Insumos & Esmaltes',
    description: 'Reposição de Géis Volia e Fibras de Vidro',
    amount: 240,
    date: formatDate(-2),
    paymentMethod: 'Cartão de Crédito'
  },
  {
    id: 'tx-5',
    type: 'despesa',
    category: 'Insumos & Esmaltes',
    description: 'Pacote de Lixas descartáveis e Brocas diamantadas',
    amount: 78,
    date: formatDate(-3),
    paymentMethod: 'Pix'
  },
  {
    id: 'tx-6',
    type: 'despesa',
    category: 'Marketing & Cursos',
    description: 'Anúncios Instagram Local para captação de clientes',
    amount: 100,
    date: formatDate(-5),
    paymentMethod: 'Cartão de Crédito'
  }
];
