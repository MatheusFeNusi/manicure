import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import type { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

const CATEGORIES_RECEITA: TransactionCategory[] = [
  'Atendimento',
  'Venda de Produtos',
  'Outros'
];

const CATEGORIES_DESPESA: TransactionCategory[] = [
  'Insumos & Esmaltes',
  'Aluguel & Contas',
  'Marketing & Cursos',
  'Outros'
];

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [type, setType] = useState<TransactionType>('despesa');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Insumos & Esmaltes');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'receita') {
      setCategory('Atendimento');
    } else {
      setCategory('Insumos & Esmaltes');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const transaction: Transaction = {
      id: 'tx-' + Date.now(),
      type,
      category,
      description,
      amount: parseFloat(amount) || 0,
      date,
      paymentMethod
    };

    onSave(transaction);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: type === 'receita' ? '#eef7ed' : '#ffebee',
              padding: '0.5rem',
              borderRadius: '10px',
              color: type === 'receita' ? '#2e7d32' : '#c62828'
            }}>
              {type === 'receita' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
            </div>
            <div>
              <h3>Nova Movimentação Financeira</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mantenha o fluxo de caixa do seu estúdio equilibrado</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Tipo: Receita ou Despesa */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('receita')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: type === 'receita' ? '2px solid #2e7d32' : '1px solid var(--border-color)',
                  background: type === 'receita' ? '#eef7ed' : 'var(--surface)',
                  color: type === 'receita' ? '#2e7d32' : 'var(--text-muted)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <ArrowUpCircle size={18} /> Entrada (Receita)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('despesa')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: type === 'despesa' ? '2px solid #c62828' : '1px solid var(--border-color)',
                  background: type === 'despesa' ? '#ffebee' : 'var(--surface)',
                  color: type === 'despesa' ? '#c62828' : 'var(--text-muted)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <ArrowDownCircle size={18} /> Saída (Despesa)
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Descrição da Movimentação</label>
              <input
                type="text"
                placeholder={type === 'receita' ? 'Ex: Venda de óleo fortalecedor de cutícula' : 'Ex: Compra de 5 géis e broca diamantada'}
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={15} /> Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  <Tag size={15} /> Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TransactionCategory)}
                >
                  {(type === 'receita' ? CATEGORIES_RECEITA : CATEGORIES_DESPESA).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={15} /> Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="Pix">Pix</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: type === 'receita' ? 'linear-gradient(135deg, #2e7d32, #43a047)' : 'linear-gradient(135deg, #c62828, #e53935)'
              }}
            >
              Registrar {type === 'receita' ? 'Entrada' : 'Despesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
