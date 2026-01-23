import cors from 'cors';
import express from 'express';
import userRoutes from './Registrations/userRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);

app.get('/', (_req: any, res: { send: (arg0: string) => void; }) => {
  res.send('Hello Express!');
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
