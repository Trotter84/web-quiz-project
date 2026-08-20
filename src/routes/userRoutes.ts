import express from 'express'
import { User } from '../models/User';
const router = express.Router();

router.post('/', async (req, res) => {

    try{
        const {username} = req.body;
        const userExists = await User.exists({name: username});
        if (userExists)
        {
            return res.status(409).json({message: 'Username already taken'});
        }
        const newUser = new User({name: username});

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);

    }
    catch(error: any)
    {
        res.status(400).json({ error: error.message });
    }
});

export default router;