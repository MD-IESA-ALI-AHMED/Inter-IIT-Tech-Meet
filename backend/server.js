import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import commentRoutes from './routes/comments.js';

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 4000;

app.use('/api', authRoutes);
app.use('/api', commentRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Nested comments API' }));

app.listen(PORT, ()=> console.log('Server listening on', PORT));
