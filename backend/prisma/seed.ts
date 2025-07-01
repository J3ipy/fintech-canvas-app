// Conteúdo para /backend/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Limpar dados existentes
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Criar um utilizador de exemplo
  const user = await prisma.user.create({
    data: {
      email: `user@example.com`,
      name: `Usuário Exemplo`,
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Criar categorias
  const catReceitas = await prisma.category.create({ data: { name: 'Salário', userId: user.id } });
  const catMoradia = await prisma.category.create({ data: { name: 'Moradia', userId: user.id } });
  const catLazer = await prisma.category.create({ data: { name: 'Lazer', userId: user.id } });
  const catAlimentacao = await prisma.category.create({ data: { name: 'Alimentação', userId: user.id } });

  // Criar transações
  await prisma.transaction.createMany({
    data: [
      { description: 'Salário da Empresa X', amount: 8000, type: 'INCOME', date: new Date('2025-06-05'), categoryId: catReceitas.id, userId: user.id },
      { description: 'Aluguel do apartamento', amount: 2500, type: 'EXPENSE', date: new Date('2025-06-06'), categoryId: catMoradia.id, userId: user.id },
      { description: 'Jantar com amigos', amount: 150, type: 'EXPENSE', date: new Date('2025-06-10'), categoryId: catLazer.id, userId: user.id },
      { description: 'Compras do mês', amount: 950, type: 'EXPENSE', date: new Date('2025-06-12'), categoryId: catAlimentacao.id, userId: user.id },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });