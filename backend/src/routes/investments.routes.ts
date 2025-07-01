import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
export const investmentsRouter = Router();

// Protege todas as rotas de investimentos com autenticação
investmentsRouter.use(authMiddleware);

// Schema de validação para criar ou atualizar um investimento
const investmentSchema = z.object({
  asset: z.string().min(1, "O nome do ativo é obrigatório."),
  quantity: z.number().positive("A quantidade deve ser um número positivo."),
  purchasePrice: z.number().positive("O preço de compra deve ser um número positivo."),
  purchaseDate: z.coerce.date(),
});

// ROTA GET: Buscar todos os investimentos do utilizador logado
investmentsRouter.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: { purchaseDate: 'desc' },
  });
  res.json(investments);
});

// ROTA POST: Criar um novo investimento
investmentsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = investmentSchema.parse(req.body);
    const userId = req.userId as string;
    const newInvestment = await prisma.investment.create({
      data: { ...data, userId },
    });
    res.status(201).json(newInvestment);
  } catch (error) {
    res.status(400).json({ error: 'Dados inválidos.', details: error });
  }
});

// ROTA PUT: Atualizar um investimento existente
investmentsRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = investmentSchema.parse(req.body);
    const userId = req.userId as string;

    const result = await prisma.investment.updateMany({
      where: { id, userId }, // Garante que o utilizador só pode editar o seu próprio investimento
      data,
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Investimento não encontrado ou acesso não permitido." });
    }

    const updatedInvestment = await prisma.investment.findUnique({ where: { id } });
    res.json(updatedInvestment);
  } catch (error) {
    res.status(400).json({ error: "Dados inválidos.", details: error });
  }
});

// ROTA DELETE: Apagar um investimento
investmentsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId as string;

  try {
    const result = await prisma.investment.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Investimento não encontrado ou acesso não permitido." });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao apagar investimento." });
  }
});
