'use client';

import { useState, useEffect, FormEvent } from 'react';
import api from '../services/api';

// Tipos
interface Investment {
  id: string;
  asset: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvestmentUpdated: (investment: Investment) => void;
  investmentToEdit?: Investment | null;
}

export function InvestmentModal({ isOpen, onClose, onInvestmentUpdated, investmentToEdit }: InvestmentModalProps) {
  const [asset, setAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!investmentToEdit;

  useEffect(() => {
    if (isEditMode && investmentToEdit) {
      setAsset(investmentToEdit.asset);
      setQuantity(String(investmentToEdit.quantity));
      setPurchasePrice(String(investmentToEdit.purchasePrice));
      setPurchaseDate(new Date(investmentToEdit.purchaseDate).toISOString().split('T')[0]);
    } else {
      setAsset('');
      setQuantity('');
      setPurchasePrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, isEditMode, investmentToEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const investmentData = {
      asset,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: new Date(purchaseDate),
    };

    try {
      let response;
      if (isEditMode) {
        response = await api.put(`/api/investments/${investmentToEdit?.id}`, investmentData);
      } else {
        response = await api.post('/api/investments', investmentData);
      }
      onInvestmentUpdated(response.data);
      onClose();
    } catch (error) {
      console.error('Falha ao salvar investimento', error);
      alert('Erro ao salvar investimento.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gray-950 p-8 rounded-2xl shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white text-2xl">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-6">{isEditMode ? 'Editar Investimento' : 'Novo Investimento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="asset" className="block text-sm font-medium text-gray-400">Ativo (ex: PETR4, Tesouro Selic)</label>
            <input type="text" id="asset" value={asset} onChange={e => setAsset(e.target.value)} required className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-400">Quantidade</label>
            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0.000001" step="any" className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-400">Preço de Compra (Unitário)</label>
            <input type="number" id="purchasePrice" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-400">Data da Compra</label>
            <input type="date" id="purchaseDate" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" />
          </div>
          <div className="pt-4">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg" disabled={isLoading}>
              {isLoading ? 'A salvar...' : 'Salvar Investimento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
