'use client';

import React from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card } from './Card';

// Tipos
interface Category { id: string; name: string; }
interface Transaction { id: string; date: string; description: string; category: Category; type: 'INCOME' | 'EXPENSE'; amount: number; }

interface TransactionsCardProps {
  transactions: Transaction[];
  onOpenCreateModal: () => void;
  onOpenEditModal: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export const TransactionsCard = ({ transactions, onOpenCreateModal, onOpenEditModal, onDelete }: TransactionsCardProps) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Transações</h1>
                <button onClick={onOpenCreateModal} className="flex items-center space-x-2 bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                    <PlusCircle size={20} />
                    <span>Nova Transação</span>
                </button>
            </div>
            <Card>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-800"><th className="p-4">Data</th><th className="p-4">Descrição</th><th className="p-4">Categoria</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Ações</th></tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map(t => (
                                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                                    <td className="p-4">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4">{t.description}</td>
                                    <td className="p-4"><span className="bg-gray-700 px-2 py-1 rounded-full text-sm">{t.category.name}</span></td>
                                    <td className={`p-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'EXPENSE' && '- '}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="p-4 flex justify-center items-center space-x-4">
                                        <button onClick={() => onOpenEditModal(t)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button>
                                        <button onClick={() => onDelete(t.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-8 text-gray-500">Nenhuma transação encontrada.</td></tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
