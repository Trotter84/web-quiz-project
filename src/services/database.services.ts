import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';

export const collections: { questions?: mongoDB.Collection } = {};

export async function connectToDatabase() {
    dotenv.config();

    const connectionUrl = process.env.CONNECTION_URL;
    if (!connectionUrl) {
        throw new Error('CONNECTION_URL is not set. Copy .env.example to .env and fill it in.');
    }

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(connectionUrl);
    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const questionsCollection: mongoDB.Collection = db.collection(
        process.env.QUESTIONS_COLLECTION_NAME || 'questions'
    );

    collections.questions = questionsCollection;

    console.log(
        `Successfully connected to database: ${db.databaseName} and collection: ${questionsCollection.collectionName}`
    );
}
