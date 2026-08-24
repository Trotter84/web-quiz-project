import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

export const collections: {questions?: mongoDB.Collection} = {}

export async function connectToDatabase () {
    dotenv.config();

    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.CONNECTION_URL);

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const questionsCollection: mongoDB.Collection = db.collection(process.env.QUESTIONS_COLLLECTION_NAME);

    collections.questions = questionsCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${questionsCollection.collectionName}`);
}