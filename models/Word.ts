import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
    word: {type: String, required: true},
    timer: {type: Number, required: true},
    fact: {type: String, required: true},
    category: {type: String, required: true},
});


export default mongoose.model('Word', wordSchema);