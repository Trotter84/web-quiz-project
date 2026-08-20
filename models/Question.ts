import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {type: String, required: true},
    possible_answers: {type: [String], required: true},
    right_answer: {type: String, required: true},
    category: {type: String, required: true},
});

export default mongoose.model('Question', questionSchema, 'Trivia');