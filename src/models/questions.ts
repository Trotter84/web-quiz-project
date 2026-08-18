import {ObjectId} from "mongodb";

export default class Question {
    constructor(public id?: ObjectId, public question: string, public possible_answers: string[],
                public right_answer: string, public category: string) {
    }
}