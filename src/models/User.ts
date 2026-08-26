import { Schema, model, Document } from 'mongoose';


interface ITopScores {
    timed_score: number;
    accuracy_score: number;
}


export interface IUser extends Document {
    name: string;
    password: string; // Note: In production, ensure you hash this!
    top_scores: ITopScores;
}


const userSchema = new Schema<IUser>({
    name: { type: String, required: true, unique: true},
    password: { type: String, required: false },
    top_scores: {
        timed_score: { type: Number, required: false, default: 0 },
        accuracy_score: { type: Number, required: false, default: 0 }
    },
}, { collection: 'User' });

export const User = model<IUser>('User', userSchema);