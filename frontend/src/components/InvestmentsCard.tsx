'use client';
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Card } from './Card';
interface Investment { id: string; asset: string; quantity: number; purchasePrice: number; purchaseDate: string; }
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
interface InvestmentsCardProps { investments: Investment[]; onOpenCreateModal: () => void; onOpenEditModal: (inv: Investment) => void; onDelete: (id: string) => void; }

export const InvestmentsCard = ({ investments, onOpenCreateModal, onOpenEditModal, onDelete }: InvestmentsCardProps) => { /* ... (código existente) ... */ };
