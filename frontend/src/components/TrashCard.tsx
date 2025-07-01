'use client';

interface Category { id: string; name: string; }
interface Transaction { id: string; date: string; description: string; category: Category; type: 'INCOME' | 'EXPENSE'; amount: number; }
interface TrashCardProps { trashedItems: Transaction[]; onRestore: (id: string) => void; }

export const TrashCard = ({ trashedItems, onRestore }: TrashCardProps) => { /* ... (código existente) ... */ };
