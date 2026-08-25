import type {Handler} from '@netlify/functions';
import {connectToDatabase} from './_lib/db';
import {User} from './_models/User';

// Handles:
//   POST /api/users             -> create a user { username }
//   GET  /api/users/check?name= -> { exists: boolean }
export const handler: Handler = async (event) => {
    try {
        await connectToDatabase();

        const segments = event.path.split('/').filter(Boolean);
        const lastSegment = segments[segments.length - 1];

        if (event.httpMethod === 'GET' && lastSegment === 'check') {
            const username = (event.queryStringParameters?.name || '').trim();

            if (!username) {
                return {statusCode: 400, body: JSON.stringify({message: 'No username found.'})};
            }

            const userExists = await User.exists({
                name: {$regex: new RegExp(`^${username}$`, 'i')},
            });

            return {statusCode: 200, body: JSON.stringify({exists: userExists !== null})};
        }

        if (event.httpMethod === 'POST') {
            const {username} = JSON.parse(event.body || '{}');

            const userExists = await User.exists({name: username});
            if (userExists) {
                return {statusCode: 409, body: JSON.stringify({message: 'Username already taken'})};
            }

            const newUser = new User({name: username});
            const savedUser = await newUser.save();

            return {statusCode: 201, body: JSON.stringify(savedUser)};
        }

        return {statusCode: 405, body: JSON.stringify({message: 'Method not allowed'})};
    } catch (err: any) {
        return {statusCode: 400, body: JSON.stringify({error: err.message})};
    }
};