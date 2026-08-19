import express from 'express'
const router = express.Router();

router.post('/', (req, res) => {
    console.log(req.body);

    // Crucial fix: Send a response back to prevent React from freezing
    res.status(201).json({
        message: "User data received successfully!",
        data: req.body
    });
});

export default router;