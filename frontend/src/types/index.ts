export interface Category {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: Category;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  deletedAt?: string | null;
}

export interface Investment {
  id: string;
  asset: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
}