import React, { useState } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Trash2, 
  TrendingUp
} from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, formatDateBr } from '../utils/storage';

interface FinanceViewProps {
  transactions: Transaction[];
  onOpenNewTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  onOpenNewTransaction,
  onDeleteTransaction
}) => {
  const [filterType, setFilterType] = useState<string>('todos');

  // Calculations
  const receitas = transactions.filter(t => t.type === 'receita');
  const despesas = transactions.filter(t => t.type === 'despesa');

  const totalReceitas = receitas.reduce((sum, t) => sum + t.amount, 0);
  const totalDespesas = despesas.reduce((sum, t) => sum + t.amount, 0);
  const lucroLiquido = totalReceitas - totalDespesas;

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'receitas') return t.type === 'receita';
    if (filterType === 'despesas') return t.type === 'despesa';
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="animate-fade-in">
      {/* Financial Summary KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Entradas (Receitas)</span>
            <div className="kpi-icon-wrapper" style={{ background: '#eef7ed', color: '#2e7d32' }}>
              <ArrowUpCircle size={22} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#2e7d32' }}>
            {formatCurrency(totalReceitas)}
          </div>
          <div className="kpi-subtext">
            <span>{receitas.length} lançamentos de atendimentos e vendas</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Saídas (Despesas)</span>
            <div className="kpi-icon-wrapper" style={{ background: '#ffebee', color: '#c62828' }}>
              <ArrowDownCircle size={22} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#c62828' }}>
            {formatCurrency(totalDespesas)}
          </div>
          <div className="kpi-subtext">
            <span>Insumos, géis, aluguel e custos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Lucro Líquido</span>
            <div className="kpi-icon-wrapper" style={{ background: 'var(--accent-gold-light)', color: 'var(--accent-gold)' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: lucroLiquido >= 0 ? 'var(--text-main)' : '#c62828' }}>
            {formatCurrency(lucroLiquido)}
          </div>
          <div className="kpi-subtext highlight-green">
            <span>Margem estimada: {totalReceitas > 0 ? Math.round((lucroLiquido / totalReceitas) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {/* Action and Filter Header */}
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
        <div className="filter-bar" style={{ margin: 0, padding: 0 }}>
          <button
            className={`filter-pill ${filterType === 'todos' ? 'active' : ''}`}
            onClick={() => setFilterType('todos')}
          >
            Todas ({transactions.length})
          </button>
          <button
            className={`filter-pill ${filterType === 'receitas' ? 'active' : ''}`}
            onClick={() => setFilterType('receitas')}
          >
            Receitas ({receitas.length})
          </button>
          <button
            className={`filter-pill ${filterType === 'despesas' ? 'active' : ''}`}
            onClick={() => setFilterType('despesas')}
          >
            Despesas ({despesas.length})
          </button>
        </div>

        <button className="btn btn-primary" onClick={onOpenNewTransaction}>
          <Plus size={18} /> Nova Movimentação
        </button>
      </div>

      {/* Transactions Table */}
      <div className="finance-table-wrapper">
        <table className="finance-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Forma Pagto</th>
              <th style={{ textAlign: 'right' }}>Valor</th>
              <th style={{ textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Nenhuma transação financeira registrada neste filtro.
                </td>
              </tr>
            ) : (
              filteredTransactions.map(tx => (
                <tr key={tx.id}>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      color: tx.type === 'receita' ? '#2e7d32' : '#c62828'
                    }}>
                      {tx.type === 'receita' ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
                      {tx.type === 'receita' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {formatDateBr(tx.date)}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {tx.description}
                  </td>
                  <td>
                    <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td style={{
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '1rem',
                    color: tx.type === 'receita' ? '#2e7d32' : '#c62828'
                  }}>
                    {tx.type === 'receita' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-danger-outline"
                      onClick={() => {
                        if (confirm(`Remover lançamento "${tx.description}"?`)) {
                          onDeleteTransaction(tx.id);
                        }
                      }}
                      title="Excluir Lançamento"
                      style={{ padding: '0.35rem 0.55rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
