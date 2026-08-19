import express from 'express'
import { User } from '../models/User';
const router = express.Router();

router.post('/', async (req, res): Promise<void> => {

    try{
        const {username, password} = req.body;

        const newUser = new User({name: username, password});

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);

    }
    catch(error: any)
    {
        res.status(400).json({ error: error.message });
    }
});

export default router;