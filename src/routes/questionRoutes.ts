import express from 'express'
import Question from '../models/Question.ts';


const router = express.Router();

// @ts-ignore
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch questions', error: err});
    }
});

// @ts-ignore
router.get('/categories', async (req, res) => {
    try {
        const categories = await Question.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch categories', error: err});
    }
});

// uses the url to match and find the selected category
router.get('/:category', async (req, res) => {
    try {
        const questions = await Question.find({category: req.params.category});
        res.json(questions);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch questions for category', error: err});
    }
});

router.post('/', (req, res) => {
    console.log(req.body) // temporary use of the parameters to not make the compiler mad.
    res.json({message: 'API is running!'})
});

export default router;