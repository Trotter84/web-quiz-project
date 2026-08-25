import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import userRoutes from './src/routes/userRoutes';
import questionRoutes from './src/routes/questionRoutes';
import wordRoutes from './src/routes/wordRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

const CONNECTION_URL = process.env.CONNECTION_URL;
if (!CONNECTION_URL) {
    throw new Error('CONNECTION_URL is not set. Copy .env.example to .env and fill it in.');
}

mongoose
    .connect(CONNECTION_URL, {
        dbName: process.env.DB_NAME || 'Web-Quiz-Project',
    })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'API is running!'});
});

app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/words', wordRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});