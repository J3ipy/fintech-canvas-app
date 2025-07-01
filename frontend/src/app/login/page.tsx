'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('password123');
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn({ email, password });
      // O redirecionamento é tratado pelo AuthContext
    } catch (error) {
      console.error(error);
      alert('Falha no login. Verifique as suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // --- CORREÇÃO AQUI ---
    // Adicionamos padding (p-4) para que o card não toque nas bordas no mobile
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Adicionamos w-full e max-w-sm para um melhor controlo da largura */}
      <div className="bg-gray-950 p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-bold text-emerald-400 mb-8 text-center">FinanCanvas</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-emerald-800 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
