import mongoose from 'mongoose';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interiit-dev';

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to', MONGO_URI);

    // Find comments where the referenced user does not exist
    const orphans = await Comment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDoc'
        }
      },
      {
        $match: {
          userDoc: { $size: 0 }
        }
      },
      {
        $project: { _id: 1, text: 1, user: 1 }
      }
    ]);

    if (!orphans || orphans.length === 0) {
      console.log('No orphaned comments found.');
      return process.exit(0);
    }

    console.log(`Found ${orphans.length} orphaned comment(s).`);

    // Ensure an Anonymous user exists
    let anon = await User.findOne({ email: 'anonymous@local' });
    if (!anon) {
      anon = await User.create({ name: 'Anonymous', email: 'anonymous@local', passwordHash: 'ANON', avatar: null });
      console.log('Created Anonymous user with id', anon._id.toString());
    }

    // Reassign orphan comments to anonymous user
    const ids = orphans.map(o => o._id);
    const res = await Comment.updateMany({ _id: { $in: ids } }, { $set: { user: anon._id } });
    console.log(`Updated ${res.modifiedCount || res.nModified || 0} comments to point to Anonymous user.`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
