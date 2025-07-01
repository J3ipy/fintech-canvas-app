import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const prisma = new PrismaClient();
export const reportsRouter = Router();
reportsRouter.use(authMiddleware);

// Schema para validar os parâmetros da query
const reportQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

// ROTA GET /monthly: Gera um relatório para um mês/ano específico
reportsRouter.get('/monthly', async (req: AuthRequest, res: Response) => {
  try {
    const { year, month } = reportQuerySchema.parse(req.query);
    const userId = req.userId as string;

    // Define o primeiro e o último dia do mês solicitado
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        deletedAt: null,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { category: true },
    });

    // Calcula os totais
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    
    // Agrupa despesas por categoria
    const expensesByCategory = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => {
        const categoryName = t.category.name;
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    res.json({
      year,
      month,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expensesByCategory,
      transactions, // Envia a lista completa de transações também
    });

  } catch (error) {
    res.status(400).json({ error: "Parâmetros de ano/mês inválidos.", details: error });
  }
});
