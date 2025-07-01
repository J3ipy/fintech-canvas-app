'use client';

interface Investment { id: string; asset: string; quantity: number; purchasePrice: number; purchaseDate: string; }
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
interface InvestmentsCardProps { investments: Investment[]; onOpenCreateModal: () => void; onOpenEditModal: (inv: Investment) => void; onDelete: (id: string) => void; }

export const InvestmentsCard = ({ 
    investments, 
    onOpenCreateModal, 
    onOpenEditModal, 
    onDelete 
}: InvestmentsCardProps) => {

    return (
        <div>
            <button onClick={onOpenCreateModal}>Add Investment</button> {/* Example Usage */}
            {investments.map(inv => (
                <div key={inv.id}>
                    {inv.asset}
                    <button onClick={() => onOpenEditModal(inv)}>Edit</button> {/* Example Usage */}
                    <button onClick={() => onDelete(inv.id)}>Delete</button> {/* Example Usage */}
                </div>
            ))}
        </div>
    );
};