import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
