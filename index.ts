import express from 'express'
import cors from "cors";
import mongoose from 'mongoose';
const app = express();
const PORT = 3000;
import userRoutes from './src/routes/userRoutes';
import questionRoutes from './src/routes/questionRoutes';
mongoose.connect('mongodb+srv://gcrichton_db_user:Didq48hWtx5N46gV@cluster0.irlkoas.mongodb.net/', {dbName: 'Web-Quiz-Project'})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'API is running!'})
});

app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


