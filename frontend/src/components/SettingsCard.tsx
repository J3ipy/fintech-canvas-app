'use client';
import React, { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Card } from './Card';

export const SettingsCard = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put('/api/users/profile', { name, avatarUrl });
      setUser(response.data);
      localStorage.setItem('fintech.user', JSON.stringify(response.data));
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar o perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configurações do Perfil</h1>
      <Card>
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          <div className="flex items-center space-x-6">
            <Image width={96} height={96} src={avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=0D836E&color=fff`} alt="Avatar" className="h-24 w-24 rounded-full object-cover bg-gray-700" />
            <div className="flex-1">
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-400">URL da Foto de Perfil</label>
              <input type="url" id="avatarUrl" placeholder="https://exemplo.com/sua-foto.jpg" value={avatarUrl || ''} onChange={e => setAvatarUrl(e.target.value)} className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" />
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400">Nome</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white" />
          </div>
          <div>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg" disabled={isSaving}>
              {isSaving ? 'A salvar...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
