import type { Client, Service, Appointment, Transaction } from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_SERVICES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TRANSACTIONS 
} from './mockData';

const STORAGE_KEYS = {
  CLIENTS: 'bellanail_clients_v1',
  SERVICES: 'bellanail_services_v1',
  APPOINTMENTS: 'bellanail_appointments_v1',
  TRANSACTIONS: 'bellanail_transactions_v1',
};

export const getStoredClients = (): Client[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : INITIAL_CLIENTS;
  } catch {
    return INITIAL_CLIENTS;
  }
};

export const saveStoredClients = (clients: Client[]) => {
  localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const getStoredServices = (): Service[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return data ? JSON.parse(data) : INITIAL_SERVICES;
  } catch {
    return INITIAL_SERVICES;
  }
};

export const saveStoredServices = (services: Service[]) => {
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

export const getStoredAppointments = (): Appointment[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : INITIAL_APPOINTMENTS;
  } catch {
    return INITIAL_APPOINTMENTS;
  }
};

export const saveStoredAppointments = (appointments: Appointment[]) => {
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

export const getStoredTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatDateBr = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  // Strip non-numeric characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Default to Brazil country code +55 if not present
  const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
};
