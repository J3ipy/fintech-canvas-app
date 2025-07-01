'use client';

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, Trash2, Edit, RotateCcw, Settings, Menu, X } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importação dos componentes externos
import { TransactionModal } from '../components/TransactionModal';
import { InvestmentModal } from '../components/InvestmentModal';

// =======================================================================
// DEFINIÇÃO DOS TIPOS DE DADOS
// =======================================================================
import { Transaction, Investment, Category } from '../types';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// =======================================================================
// COMPONENTE PRINCIPAL DA PÁGINA
// =======================================================================
export default function MainPage() {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const router = useRouter();
  
  // Estados da página
  const [activeView, setActiveView] = useState('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trashedItems, setTrashedItems] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estados para os modais
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentToEdit, setInvestmentToEdit] = useState<Investment | null>(null);

  // Efeito para buscar todos os dados
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          setDataLoading(true);
          const [transactionsRes, investmentsRes, trashedRes] = await Promise.all([
            api.get('/api/transactions'),
            api.get('/api/investments'),
            api.get('/api/transactions/trash'),
          ]);
          setTransactions(transactionsRes.data);
          setInvestments(investmentsRes.data);
          setTrashedItems(trashedRes.data);
        } catch (err) {
          console.error("Falha ao buscar dados:", err);
        } finally {
          setDataLoading(false);
        }
      };
      fetchData();
    }
  }, [isAuthenticated, loading, router]);
  
  // Funções de Gestão de Transações
  const handleOpenCreateTransactionModal = () => { setTransactionToEdit(null); setIsTransactionModalOpen(true); };
  const handleOpenEditTransactionModal = (transaction: Transaction) => { setTransactionToEdit(transaction); setIsTransactionModalOpen(true); };
  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Tem a certeza que quer mover esta transação para a lixeira?')) {
      const itemToMove = transactions.find(t => t.id === transactionId);
      await api.delete(`/api/transactions/${transactionId}`);
      setTransactions(current => current.filter(t => t.id !== transactionId));
      if(itemToMove) setTrashedItems(current => [itemToMove, ...current]);
    }
  };
  const handleRestoreTransaction = async (transactionId: string) => {
    const itemToRestore = trashedItems.find(t => t.id === transactionId);
    await api.patch(`/api/transactions/${transactionId}/restore`);
    setTrashedItems(current => current.filter(t => t.id !== transactionId));
    if(itemToRestore) setTransactions(current => [itemToRestore, ...current]);
  };
  const handleTransactionUpdated = (updatedTransaction: Transaction) => {
    const existingIndex = transactions.findIndex(t => t.id === updatedTransaction.id);
    if (existingIndex !== -1) {
      setTransactions(current => current.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    } else {
      setTransactions(current => [updatedTransaction, ...current]);
    }
  };

  // Funções de Gestão de Investimentos
  const handleOpenCreateInvestmentModal = () => { setInvestmentToEdit(null); setIsInvestmentModalOpen(true); };
  const handleOpenEditInvestmentModal = (investment: Investment) => { setInvestmentToEdit(investment); setIsInvestmentModalOpen(true); };
  const handleDeleteInvestment = async (investmentId: string) => {
    if (window.confirm('Tem a certeza que quer apagar este investimento?')) {
      await api.delete(`/api/investments/${investmentId}`);
      setInvestments(current => current.filter(inv => inv.id !== investmentId));
    }
  };
  const handleInvestmentUpdated = (updatedInvestment: Investment) => {
    const existingIndex = investments.findIndex(inv => inv.id === updatedInvestment.id);
    if (existingIndex !== -1) {
      setInvestments(current => current.map(inv => inv.id === updatedInvestment.id ? updatedInvestment : inv));
    } else {
      setInvestments(current => [updatedInvestment, ...current]);
    }
  };

  if (loading || !isAuthenticated) {
    return <div className="h-screen w-full bg-gray-900 flex items-center justify-center text-white">A carregar autenticação...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <div className="flex">
          {/* --- Overlay para fechar a sidebar no mobile --- */}
          {isSidebarOpen && (<div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsSidebarOpen(false)}></div>)}

          {/* --- Sidebar de Navegação (Agora com classes responsivas corrigidas) --- */}
          <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-950 p-6 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:h-screen`}>
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-bold text-emerald-400">FinanCanvas</h1>
              <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}><X size={28} /></button>
            </div>
            <nav className="flex flex-col space-y-2">
              <button onClick={() => { setActiveView('dashboard'); setIsSidebarOpen(false); }} className={`text-left p-3 rounded-lg ${activeView === 'dashboard' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-gray-800'}`}>Dashboard</button>
              <button onClick={() => { setActiveView('transactions'); setIsSidebarOpen(false); }} className={`text-left p-3 rounded-lg ${activeView === 'transactions' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-gray-800'}`}>Transações</button>
              <button onClick={() => { setActiveView('investments'); setIsSidebarOpen(false); }} className={`text-left p-3 rounded-lg ${activeView === 'investments' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-gray-800'}`}>Investimentos</button>
              <button onClick={() => { setActiveView('reports'); setIsSidebarOpen(false); }} className={`text-left p-3 rounded-lg ${activeView === 'reports' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-gray-800'}`}>Relatórios</button>
              <button onClick={() => { setActiveView('trash'); setIsSidebarOpen(false); }} className={`text-left p-3 rounded-lg ${activeView === 'trash' ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-gray-800'}`}>Lixeira</button>
            </nav>
            <div className="mt-auto border-t border-gray-800 pt-6">
                <div className="flex items-center space-x-3">
                    <img width={40} height={40} className="h-10 w-10 rounded-full object-cover bg-gray-700" src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=0D836E&color=fff`} alt="User Avatar"/>
                    <div><p className="font-semibold">{user?.name}</p><button onClick={logout} className="text-sm text-gray-400 hover:text-emerald-400">Sair</button></div>
                </div>
                <button onClick={() => { setActiveView('settings'); setIsSidebarOpen(false); }} className={`w-full mt-4 text-left p-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 ${activeView === 'settings' ? 'bg-emerald-500/20 text-emerald-300' : ''}`}>
                  <Settings size={20} />
                  <span>Configurações</span>
                </button>
            </div>
          </aside>

          <div className="flex flex-col flex-1">
            {/* --- Header para Mobile --- */}
            <header className="md:hidden bg-gray-950 p-4 flex justify-between items-center sticky top-0 z-30 border-b border-gray-800">
              <h1 className="text-xl font-bold text-emerald-400">FinanCanvas</h1>
              <button onClick={() => setIsSidebarOpen(true)}><Menu size={28} /></button>
            </header>

            {/* --- Conteúdo Principal (Agora sem a margem, pois a sidebar empurra o conteúdo) --- */}
            <main className="flex-1 p-4 sm:p-6 md:p-8">
              {dataLoading ? ( <p className="text-center text-gray-400">A carregar...</p> ) : (
                <>
                  {activeView === 'dashboard' && <DashboardCard transactions={transactions} />}
                  {activeView === 'transactions' && <TransactionsCard transactions={transactions} onOpenCreateModal={handleOpenCreateTransactionModal} onOpenEditModal={handleOpenEditTransactionModal} onDelete={handleDeleteTransaction} />}
                  {activeView === 'investments' && <InvestmentsCard investments={investments} onOpenCreateModal={handleOpenCreateInvestmentModal} onOpenEditModal={handleOpenEditInvestmentModal} onDelete={handleDeleteInvestment} />}
                  {activeView === 'reports' && <ReportsCard />}
                  {activeView === 'trash' && <TrashCard trashedItems={trashedItems} onRestore={handleRestoreTransaction} />}
                  {activeView === 'settings' && <SettingsCard />}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
      
      <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} onTransactionUpdated={handleTransactionUpdated} transactionToEdit={transactionToEdit} />
      <InvestmentModal isOpen={isInvestmentModalOpen} onClose={() => setIsInvestmentModalOpen(false)} onInvestmentUpdated={handleInvestmentUpdated} investmentToEdit={investmentToEdit} />
    </>
  );
}

// =======================================================================
// DEFINIÇÃO DOS COMPONENTES DE CARD (FORA DO COMPONENTE MAINPAGE)
// =======================================================================

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (<div className={`bg-gray-950/70 border border-gray-800 rounded-2xl p-4 sm:p-6 ${className}`}>{children}</div>);

const DashboardCard = ({ transactions }: { transactions: Transaction[] }) => {
    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [transactions]);
    
    const expenseData = useMemo(() => {
        const expensesByCategory = transactions.filter(t => t.type === 'EXPENSE').reduce((acc: { [key: string]: number }, t) => {
                const categoryName = t.category.name;
                acc[categoryName] = (acc[categoryName] || 0) + t.amount;
                return acc;
            }, {});
        return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <h1 className="col-span-full text-3xl font-bold mb-4">Dashboard</h1>
            <Card className="lg:col-span-1"><h2 className="text-gray-400 text-lg">Saldo Atual</h2><p className={`text-3xl sm:text-4xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></Card>
            <Card className="lg:col-span-1"><h2 className="text-gray-400 text-lg">Receitas vs. Despesas</h2><div className="flex flex-col sm:flex-row justify-around mt-4 gap-4 sm:gap-0"><div><p className="text-xl sm:text-2xl font-semibold text-emerald-400">{totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-sm text-gray-500">Receitas</p></div><div><p className="text-xl sm:text-2xl font-semibold text-red-400">{totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-sm text-gray-500">Despesas</p></div></div></Card>
            <Card className="lg:col-span-2 h-80 md:h-96"><h2 className="text-gray-400 text-lg mb-4">Gastos por Categoria</h2><ResponsiveContainer width="100%" height="100%"><BarChart data={expenseData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" /><XAxis dataKey="name" stroke="#888" fontSize={12} /><YAxis stroke="#888" fontSize={12} tickFormatter={(value) => `R$${value}`} /><Tooltip contentStyle={{ backgroundColor: '#222', border: 'none' }} formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} /><Bar dataKey="value" fill="#10b981" /></BarChart></ResponsiveContainer></Card>
        </div>
    );
};

const TransactionsCard = ({ transactions, onOpenCreateModal, onOpenEditModal, onDelete }: { transactions: Transaction[], onOpenCreateModal: () => void, onOpenEditModal: (transaction: Transaction) => void, onDelete: (transactionId: string) => void }) => {
    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"><h1 className="text-3xl font-bold">Transações</h1><button onClick={onOpenCreateModal} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"><PlusCircle size={20} /><span>Nova Transação</span></button></div>
            <Card>
                <div className="hidden md:block"><table className="w-full text-left"><thead><tr className="border-b border-gray-800"><th className="p-4">Data</th><th className="p-4">Descrição</th><th className="p-4">Categoria</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Ações</th></tr></thead><tbody>{transactions.map(t => (<tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/50"><td className="p-4">{new Date(t.date).toLocaleDateString('pt-BR')}</td><td className="p-4">{t.description}</td><td className="p-4"><span className="bg-gray-700 px-2 py-1 rounded-full text-sm">{t.category.name}</span></td><td className={`p-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'EXPENSE' && '- '}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-4 flex justify-center items-center space-x-4"><button onClick={() => onOpenEditModal(t)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button><button onClick={() => onDelete(t.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button></td></tr>))}</tbody></table></div>
                <div className="md:hidden space-y-4">{transactions.map(t => (<div key={t.id} className="bg-gray-800/50 p-4 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-bold">{t.description}</p><p className="text-sm text-gray-400">{t.category.name}</p></div><p className={`font-semibold text-lg ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div><div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-700"><p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p><div className="flex space-x-4"><button onClick={() => onOpenEditModal(t)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button><button onClick={() => onDelete(t.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button></div></div></div>))}</div>
                {transactions.length === 0 && <p className="text-center p-8 text-gray-500">Nenhuma transação encontrada.</p>}
            </Card>
        </div>
    );
};

const InvestmentsCard = ({ investments, onOpenCreateModal, onOpenEditModal, onDelete }: { investments: Investment[], onOpenCreateModal: () => void, onOpenEditModal: (inv: Investment) => void, onDelete: (id: string) => void }) => {
    const { portfolioData, totalValue } = useMemo(() => {
        const data = investments.map(inv => ({ name: inv.asset, value: inv.quantity * inv.purchasePrice }));
        const total = data.reduce((acc, item) => acc + item.value, 0);
        return { portfolioData: data, totalValue: total };
    }, [investments]);

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => { const RADIAN = Math.PI / 180; const radius = innerRadius + (outerRadius - innerRadius) * 0.5; const x = cx + radius * Math.cos(-midAngle * RADIAN); const y = cy + radius * Math.sin(-midAngle * RADIAN); return (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">{`${(percent * 100).toFixed(0)}%`}</text>); };
    const CustomTooltip = ({ active, payload }: any) => { if (active && payload && payload.length) { return ( <div className="bg-gray-800 p-3 rounded-lg border border-gray-700"><p className="font-bold text-white">{`${payload[0].name}`}</p><p className="text-emerald-400">{`Valor: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p></div> ); } return null; };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"><h1 className="text-3xl font-bold">Meus Investimentos</h1><button onClick={onOpenCreateModal} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"><PlusCircle size={20} /><span>Novo Investimento</span></button></div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2"><Card><div className="hidden md:block"><table className="w-full text-left"><thead><tr className="border-b border-gray-800"><th className="p-4">Ativo</th><th className="p-4">Quantidade</th><th className="p-4">Preço de Compra</th><th className="p-4 text-center">Ações</th></tr></thead><tbody>{investments.length > 0 ? investments.map(inv => (<tr key={inv.id} className="border-b border-gray-800/50 hover:bg-gray-800/50"><td className="p-4 font-semibold">{inv.asset}</td><td className="p-4">{inv.quantity.toLocaleString('pt-BR')}</td><td className="p-4">{inv.purchasePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-4 flex justify-center items-center space-x-4"><button onClick={() => onOpenEditModal(inv)} className="text-blue-400 hover:text-blue-300"><Edit size={18} /></button><button onClick={() => onDelete(inv.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18} /></button></td></tr>)) : (<tr><td colSpan={4} className="text-center p-8 text-gray-500">Nenhum investimento encontrado.</td></tr>)}</tbody></table></div><div className="md:hidden space-y-4">{investments.map(inv=>(<div key={inv.id} className="bg-gray-800/50 p-4 rounded-lg"><div className="flex justify-between items-center"><div><p className="font-bold text-lg">{inv.asset}</p><p className="text-sm text-gray-400">Quantidade: {inv.quantity.toLocaleString('pt-BR')}</p></div><p className="font-semibold text-lg">{inv.purchasePrice.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p></div><div className="flex justify-end items-center mt-4 pt-2 border-t border-gray-700 space-x-4"><button onClick={()=>onOpenEditModal(inv)} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button><button onClick={()=>onDelete(inv.id)} className="text-red-500 hover:text-red-400"><Trash2 size={18}/></button></div></div>))}</div></Card></div>
                <div className="xl:col-span-1 flex flex-col gap-6"><Card><h2 className="text-xl font-semibold mb-2">Valor Total da Carteira</h2><p className="text-3xl font-bold text-emerald-400">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></Card><Card className="h-96 flex flex-col"><h2 className="text-xl font-semibold mb-4">Composição da Carteira</h2><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={portfolioData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} fill="#8884d8" labelLine={false} label={renderCustomizedLabel}>{portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip content={<CustomTooltip />} /><Legend /></PieChart></ResponsiveContainer></Card></div>
            </div>
        </div>
    );
};

const TrashCard = ({ trashedItems, onRestore }: { trashedItems: Transaction[], onRestore: (id: string) => void }) => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Lixeira</h1>
            <Card>
                <div className="hidden md:block"><table className="w-full text-left"><thead><tr className="border-b border-gray-800"><th className="p-4">Data</th><th className="p-4">Descrição</th><th className="p-4 text-right">Valor</th><th className="p-4 text-center">Ações</th></tr></thead><tbody>{trashedItems.map(t => (<tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/50"><td className="p-4">{new Date(t.date).toLocaleDateString('pt-BR')}</td><td className="p-4">{t.description}</td><td className={`p-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td className="p-4 text-center"><button onClick={() => onRestore(t.id)} className="text-emerald-400 hover:text-emerald-300 flex items-center mx-auto"><RotateCcw size={18} className="mr-2"/>Restaurar</button></td></tr>))}</tbody></table></div>
                <div className="md:hidden space-y-4">{trashedItems.map(t => (<div key={t.id} className="bg-gray-800/50 p-4 rounded-lg"><div className="flex justify-between items-start"><div><p className="font-bold">{t.description}</p></div><p className={`font-semibold text-lg ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>{t.amount.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p></div><div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-700"><p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p><button onClick={()=>onRestore(t.id)} className="text-emerald-400 hover:text-emerald-300 flex items-center"><RotateCcw size={18} className="mr-2"/>Restaurar</button></div></div>))}</div>
                {trashedItems.length === 0 && <p className="text-center p-8 text-gray-500">A lixeira está vazia.</p>}
            </Card>
        </div>
    );
};

const ReportsCard = () => {
  const { user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/api/reports/monthly?year=${year}&month=${month}`);
      const reportData = response.data;
      const doc = new jsPDF();
      const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long' });
      const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      doc.setFontSize(18); doc.text(`Relatório Financeiro - ${capitalizedMonth} de ${year}`, 14, 22);
      doc.setFontSize(11); doc.setTextColor(100);
      doc.text(`Relatório para: ${user?.name || ''}`, 14, 30);
      doc.text(`Receitas: ${reportData.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 38);
      doc.text(`Despesas: ${reportData.totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 44);
      doc.setFontSize(12); doc.setTextColor(0); doc.text(`Saldo do Mês: ${reportData.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 52);
      
      autoTable(doc, { 
        startY: 60,
        head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
        body: reportData.transactions.map((t: Transaction) => [ new Date(t.date).toLocaleDateString('pt-BR'), t.description, t.category.name, t.type, t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ]),
        theme: 'striped',
        headStyles: { fillColor: [13, 131, 110] }
      });

      doc.save(`relatorio_${year}_${month}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar relatório", error);
      alert("Não foi possível gerar o relatório para esta data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Relatórios</h1>
      <Card><div className="flex flex-col md:flex-row items-center gap-4 p-4"><select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-gray-800 border-gray-700 rounded-lg p-2 text-white w-full md:w-auto">{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>)}</select><select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-gray-800 border-gray-700 rounded-lg p-2 text-white w-full md:w-auto">{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}</select><button onClick={handleGeneratePDF} disabled={isLoading} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg disabled:bg-gray-500 transition-colors">{isLoading ? 'A gerar...' : 'Gerar PDF'}</button></div></Card>
    </div>
  );
};

const SettingsCard = () => {
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
            <img width={96} height={96} src={avatarUrl || `https://ui-avatars.com/api/?name=${name}&background=0D836E&color=fff`} alt="Avatar" className="h-24 w-24 rounded-full object-cover bg-gray-700" />
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
