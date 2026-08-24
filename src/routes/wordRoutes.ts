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

// uses the url to match and find the selected category
router.get('/:category', async (req, res) => {
    try {
        const words = await Word.find({category: req.params.category});
        res.json(words);
        console.log();
        console.log(words);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch words for category', error: err});
    }
});

export default router;