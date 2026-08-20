import express from 'express'
import Question from '../models/Question';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch questions', error: err});
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Question.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({message: 'Failed to fetch categories', error: err});
    }
});

// Can change .post to .get or .put depending on what you need to do
router.post('/', (req, res) => {
    console.log(req.body) // temporary use of the parameters to not make the compiler mad.
    res.json({message: 'API is running!'})
});

export default router;