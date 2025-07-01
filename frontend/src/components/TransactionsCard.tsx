'use client';
import React from 'react';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card } from './Card';
interface Category { id: string; name: string; }
interface Transaction { id: string; date: string; description: string; category: Category; type: 'INCOME' | 'EXPENSE'; amount: number; }
interface TransactionsCardProps { transactions: Transaction[]; onOpenCreateModal: () => void; onOpenEditModal: (transaction: Transaction) => void; onDelete: (transactionId: string) => void; }

export const TransactionsCard = ({ transactions, onOpenCreateModal, onOpenEditModal, onDelete }: TransactionsCardProps) => { /* ... (código existente) ... */ };
