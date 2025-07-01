'use client';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './Card';
interface Category { name: string; }
interface Transaction { category: Category; type: 'INCOME' | 'EXPENSE'; amount: number; }

export const DashboardCard = ({ transactions }: { transactions: Transaction[] }) => {
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
