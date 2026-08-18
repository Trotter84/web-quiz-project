import express from 'express'
import cors from "cors";
const app = express();
const PORT = 3000;

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