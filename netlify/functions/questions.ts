import type {Handler} from '@netlify/functions';
import {connectToDatabase} from './_lib/db.ts';
import Question from './_models/Question.ts';

// Handles:
//   GET /api/questions                -> all questions
//   GET /api/questions/categories     -> distinct list of categories
//   GET /api/questions/:category      -> questions in one category
export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {statusCode: 405, body: JSON.stringify({message: 'Method not allowed'})};
    }

    try {
        await connectToDatabase();

        // event.path looks like /.netlify/functions/questions/<category>
        // (or /api/questions/<category> once the redirect in netlify.toml rewrites it)
        const segments = event.path.split('/').filter(Boolean);
        const category = segments[segments.length - 1];
        const hasCategorySegment = category && category !== 'questions';

        if (hasCategorySegment && category === 'categories') {
            const categories = await Question.distinct('category');
            return {statusCode: 200, body: JSON.stringify(categories)};
        }

        if (hasCategorySegment) {
            const questions = await Question.find({category});
            return {statusCode: 200, body: JSON.stringify(questions)};
        }

        const questions = await Question.find();
        return {statusCode: 200, body: JSON.stringify(questions)};
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: 'Failed to fetch questions', error: String(err)}),
        };
    }
};