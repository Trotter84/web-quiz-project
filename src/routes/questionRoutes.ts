import express from 'express'
const router = express.Router();

// Can change .post to .get or .put depending on what you need to do
router.post('/', (req, res) => {
    console.log(req.body) // temporary use of the parameters to not make the compiler mad.
    res.json({message: 'API is running!'})
});



export default router;