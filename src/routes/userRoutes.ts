import express from 'express'
import {User} from '../models/User.ts';


const router = express.Router();

router.post('/', async (req, res) => {

    try {
        const {username} = req.body;
        const userExists = await User.exists({name: username});
        if (userExists) {
            return res.status(409).json({message: 'Username already taken'});
        }
        const newUser = new User({name: username});

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);

    } catch (error: any) {
        res.status(400).json({error: error.message});
    }
});

router.get('/check', async (req, res) => {
    try {
        const username = req.query.name ? String(req.query.name).trim() : "";

        if (!username) {
            console.log("Got to this!")
            return res.status(400).json({message: 'No username found.'});
        }

        const userExists = await User.exists({name: {$regex: new RegExp(`^${username}$`, 'i')}}); // This should check if the username exists regardless of casing.
        return res.json({exists: userExists !== null});
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({error: error.message});
    }
});

export default router;