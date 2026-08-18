import {ObjectId} from "mongodb";

export default class Question {
    constructor(id?: ObjectId, question: string, possible_answers: string[],
                right_answer: string, category: string) {
    }
}