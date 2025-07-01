import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
export const usersRouter = Router();
usersRouter.use(authMiddleware);

const profileSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  avatarUrl: z.string().url("URL do avatar inválida.").optional().or(z.literal('')),
});

// ROTA PUT /profile: Atualiza o perfil do utilizador
usersRouter.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string;
    const data = profileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatarUrl: data.avatarUrl || null,
      },
    });
    
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: "Dados inválidos.", details: error });
  }
});