import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  photoUrl: { type: String },
  cardsProcessed: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);