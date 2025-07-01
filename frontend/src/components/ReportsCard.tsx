'use client';
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from './Card';
interface Transaction { id: string; date: string; description: string; category: { name: string }; type: 'INCOME' | 'EXPENSE'; amount: number; }

export const ReportsCard = () => {
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

      doc.setFontSize(18);
      doc.text(`Relatório Financeiro - ${capitalizedMonth} de ${year}`, 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Receitas: ${reportData.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 32);
      doc.text(`Despesas: ${reportData.totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 14, 38);
      
      autoTable(doc, { 
        startY: 55,
        head: [["Data", "Descrição", "Categoria", "Tipo", "Valor"]],
        body: reportData.transactions.map((t: any) => [
          new Date(t.date).toLocaleDateString('pt-BR'),
          t.description,
          t.category.name,
          t.type,
          t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        ]),
        theme: 'striped',
        headStyles: { fillColor: [38, 166, 154] }
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
      <Card>
        <div className="flex flex-col md:flex-row items-center gap-4 p-4">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-gray-800 ...">
             {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('pt-BR', { month: 'long' })}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-gray-800 ...">
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleGeneratePDF} disabled={isLoading} className="bg-blue-600 ...">
            {isLoading ? 'A gerar...' : 'Gerar PDF'}
          </button>
        </div>
      </Card>
    </div>
  );
};