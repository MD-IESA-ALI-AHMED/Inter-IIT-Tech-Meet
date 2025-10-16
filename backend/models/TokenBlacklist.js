import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const TokenBlacklistSchema = new Schema({
  token: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date }
});

export default mongoose.model('TokenBlacklist', TokenBlacklistSchema);
