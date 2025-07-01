import { Router, Request, Response } from 'express'; // Importamos Request e Response
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// @ts-ignore
authRouter.post('/login', async (req: Request, res: Response) => { 
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }
    
    // --- CORREÇÃO AQUI ---
    // Garantimos que o 'secret' é tratado como uma string
    const secret = process.env.JWT_SECRET as string;
    
    // @ts-ignore
    const token = jwt.sign({ id: user.id }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });

  } catch (error) {
    res.status(400).json({ error: 'Erro ao fazer login.', details: error });
  }
});