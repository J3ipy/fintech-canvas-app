// Conteúdo completo para /backend/src/routes/transactions.routes.ts

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
export const transactionsRouter = Router();

transactionsRouter.use(authMiddleware);

const transactionSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.coerce.date(),
  categoryId: z.string().uuid(),
});

// ROTA GET: Agora só busca transações que NÃO foram apagadas
transactionsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const transactions = await prisma.transaction.findMany({
    where: { 
      userId,
      deletedAt: null // <-- A MUDANÇA ESTÁ AQUI
    },
    orderBy: { date: 'desc' },
    include: { category: true },
  });
  res.json(transactions);
});

// ROTA POST: Sem alterações
transactionsRouter.post('/', async (req: AuthRequest, res: Response) => {
  const data = transactionSchema.parse(req.body);
  const userId = req.userId as string;
  const newTransaction = await prisma.transaction.create({
    data: { ...data, userId },
    include: { category: true },
  });
  res.status(201).json(newTransaction);
});

// ROTA PUT: Sem alterações
transactionsRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = transactionSchema.parse(req.body);
  const userId = req.userId as string;
  await prisma.transaction.updateMany({ where: { id, userId }, data });
  const updatedTransaction = await prisma.transaction.findUnique({ where: { id }, include: { category: true } });
  res.json(updatedTransaction);
});

// ROTA DELETE: Agora faz o "soft delete"
transactionsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId as string;
  await prisma.transaction.updateMany({
    where: { id, userId },
    data: { deletedAt: new Date() }, // <-- A MUDANÇA ESTÁ AQUI
  });
  res.status(204).send();
});

// --- NOVAS ROTAS PARA A LIXEIRA ---

// ROTA GET /trash: Busca apenas as transações apagadas
transactionsRouter.get('/trash', async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const trashedTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      deletedAt: { not: null } // Onde deletedAt NÃO é nulo
    },
    orderBy: { deletedAt: 'desc' },
    include: { category: true },
  });
  res.json(trashedTransactions);
});

// ROTA PATCH /:id/restore: Restaura uma transação
transactionsRouter.patch('/:id/restore', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId as string;
  await prisma.transaction.updateMany({
    where: { id, userId },
    data: { deletedAt: null }, // Define deletedAt como nulo novamente
  });
  res.status(200).json({ message: 'Transação restaurada.' });
});
