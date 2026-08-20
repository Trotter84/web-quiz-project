import express from 'express'
import Word from '../models/Word';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const words = await Word.find();
        res.json(words);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch words', error: err});
    }
});

export default router;