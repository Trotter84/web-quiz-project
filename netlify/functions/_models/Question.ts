import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    question: {type: String, required: true},
    possible_answers: {type: [String], required: true},
    right_answer: {type: String, required: true},
    category: {type: String, required: true},
});

// Reuse the compiled model across warm invocations instead of recompiling it,
// which mongoose throws on if the file is imported more than once.
export default mongoose.models.Question ||
mongoose.model('Question', questionSchema, 'Trivia');