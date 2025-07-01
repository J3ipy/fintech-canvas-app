import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { transactionsRouter } from './routes/transactions.routes';
import { categoriesRouter } from './routes/categories.routes';
import { investmentsRouter } from './routes/investments.routes';
import { reportsRouter } from './routes/reports.routes'; 
import { usersRouter } from './routes/users.routes'; 

const app = express();
const port = 8000;

app.use(cors());
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
  console.log(`Backend rodando em http://localhost:${port}`);
});