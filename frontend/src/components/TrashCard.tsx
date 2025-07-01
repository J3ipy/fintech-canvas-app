'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

// Tipos
interface Category { id: string; name: string; }
interface Transaction { id: string; date: string; description: string; category: Category; type: 'INCOME' | 'EXPENSE'; amount: number; }

interface TrashCardProps {
  trashedItems: Transaction[];
  onRestore: (transactionId: string) => void;
}

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-gray-950/70 border border-gray-800 rounded-2xl p-6 ${className}`}>
        {children}
    </div>
);

export function TrashCard({ trashedItems, onRestore }: TrashCardProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lixeira de Transações</h1>
      </div>
      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="p-4">Data</th>
              <th className="p-4">Descrição</th>
              <th className="p-4 text-right">Valor</th>
              <th className="p-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {trashedItems.length > 0 ? (
              trashedItems.map(t => (
                <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/50">
                  <td className="p-4">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">{t.description}</td>
                  <td className={`p-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.type === 'EXPENSE' && '- '}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => onRestore(t.id)} className="text-emerald-400 hover:text-emerald-300 flex items-center mx-auto">
                      <RotateCcw size={18} className="mr-2"/> Restaurar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">A lixeira está vazia.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}