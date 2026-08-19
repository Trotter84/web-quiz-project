import express from 'express'
const router = express.Router();

router.post('/', (req, res) => {
    console.log(req.body);

    res.status(201).json({
        message: "User data received successfully!",
        data: req.body
    });
});

export default router;