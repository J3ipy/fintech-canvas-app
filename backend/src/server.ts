import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { transactionsRouter } from './routes/transactions.routes';
import { categoriesRouter } from './routes/categories.routes';
import { investmentsRouter } from './routes/investments.routes';
import { reportsRouter } from './routes/reports.routes';
import { usersRouter } from './routes/users.routes';

const app = express();
// É uma boa prática usar a porta que o Render fornece, com um fallback para desenvolvimento local.
const port = process.env.PORT || 8000;

// ====================================================================
// SUBSTITUA A LINHA 'app.use(cors());' POR ESTA CONFIGURAÇÃO ABAIXO:
// ====================================================================
app.use(cors({
  origin: process.env.FRONTEND_URL, // Usa a variável de ambiente que você configurou no Render
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// Registo das Rotas
app.use('/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/investments', investmentsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => res.send('API do FinanCanvas no ar!'));

app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});