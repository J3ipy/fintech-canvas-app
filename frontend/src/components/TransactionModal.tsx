'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';

// Tipos
interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: Category;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransactionUpdated: (updatedTransaction: Transaction) => void;
  transactionToEdit?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onTransactionUpdated, transactionToEdit }: TransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!transactionToEdit;

  useEffect(() => {
    if (isOpen) {
      api.get('/api/categories').then(response => {
        setCategories(response.data);
        if (isEditMode && transactionToEdit) {
          setDescription(transactionToEdit.description);
          setAmount(String(transactionToEdit.amount));
          setType(transactionToEdit.type);
          setCategoryId(transactionToEdit.category.id);
        } else if (response.data.length > 0) {
          setCategoryId(response.data[0].id);
        }
      });
    } else {
      setDescription('');
      setAmount('');
      setType('EXPENSE');
      setCategoryId('');
    }
  }, [isOpen, isEditMode, transactionToEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const transactionData = {
      description,
      amount: parseFloat(amount),
      type,
      categoryId,
      date: new Date().toISOString(),
    };

    try {
      let response;
      if (isEditMode) {
        response = await api.put(`/api/transactions/${transactionToEdit?.id}`, transactionData);
      } else {
        response = await api.post('/api/transactions', transactionData);
      }
      onTransactionUpdated(response.data);
      onClose();
    } catch (error) {
      console.error('Falha ao salvar transação', error);
      alert('Erro ao salvar transação.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-950 p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-6">{isEditMode ? 'Editar Transação' : 'Nova Transação'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* --- CÓDIGO DO FORMULÁRIO ADICIONADO DE VOLTA --- */}
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-400">Descrição</label>
            <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-400">Valor</label>
            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">Tipo</label>
            <div className="mt-2 flex rounded-lg bg-gray-800 p-1">
              <button type="button" onClick={() => setType('EXPENSE')} className={`w-full p-2 rounded-md text-sm font-semibold transition-colors ${type === 'EXPENSE' ? 'bg-red-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Despesa</button>
              <button type="button" onClick={() => setType('INCOME')} className={`w-full p-2 rounded-md text-sm font-semibold transition-colors ${type === 'INCOME' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Receita</button>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-400">Categoria</label>
            <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              {categories.length > 0 ? categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              )) : <option>A carregar...</option>}
            </select>
          </div>
          
          <div className="pt-4">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-500" disabled={isLoading}>
              {isLoading ? 'A salvar...' : 'Salvar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}