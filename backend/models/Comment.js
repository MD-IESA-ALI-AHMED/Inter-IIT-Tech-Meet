import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  text: { type: String, required: true },
  // separate lists for upvoters and downvoters (each stores user refs)
  upVotes: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ],
  downVotes: [
    { type: Schema.Types.ObjectId, ref: 'User' }
  ],
  created_at: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }
});

export default mongoose.model('Comment', CommentSchema);
