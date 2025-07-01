'use client';

interface Investment { id: string; asset: string; quantity: number; purchasePrice: number; purchaseDate: string; }
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
interface InvestmentsCardProps { investments: Investment[]; onOpenCreateModal: () => void; onOpenEditModal: (inv: Investment) => void; onDelete: (id: string) => void; }

export const InvestmentsCard = ({ investments, onOpenCreateModal, onOpenEditModal, onDelete }: InvestmentsCardProps) => { /* ... (código existente) ... */ };
