import type {Handler} from '@netlify/functions';
import {connectToDatabase} from './_lib/db';
import Word from './_models/Word';

// Handles:
//   GET /api/words             -> all words
//   GET /api/words/:category   -> words in one category
export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {statusCode: 405, body: JSON.stringify({message: 'Method not allowed'})};
    }

    try {
        await connectToDatabase();

        const segments = event.path.split('/').filter(Boolean);
        const category = segments[segments.length - 1];
        const hasCategorySegment = category && category !== 'words';

        const words = hasCategorySegment
            ? await Word.find({category})
            : await Word.find();

        return {statusCode: 200, body: JSON.stringify(words)};
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Failed to fetch words', error: String(err)}),
        };
    }
};