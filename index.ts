import express from 'express'
import cors from "cors";
import mongoose from 'mongoose';
const app = express();
const PORT = 3000;

mongoose.connect('mongodb+srv://gcrichton_db_user:Didq48hWtx5N46gV@cluster0.irlkoas.mongodb.net/')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));


app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'API is running!'})
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.post("/api/signup", (req, res) => {
    console.log("This got called!")
})