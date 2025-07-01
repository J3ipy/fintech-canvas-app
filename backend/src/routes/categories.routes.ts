import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
export const categoriesRouter = Router();

// @ts-ignore
categoriesRouter.use(authMiddleware);

// ROTA GET: Buscar todas as categorias do utilizador logado
categoriesRouter.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  try {
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Não foi possível buscar as categorias.' });
  }
});

// @ts-ignore
categoriesRouter.post('/', async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.userId as string;

  if (!name) {
    return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
  }

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        userId,
      },
    });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar categoria.' });
  }
});