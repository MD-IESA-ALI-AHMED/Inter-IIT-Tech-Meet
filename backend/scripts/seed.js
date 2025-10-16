import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nested_comments_demo';

async function seed(){
  await mongoose.connect(MONGO);
  await User.deleteMany({});
  await Comment.deleteMany({});

  const alice = await User.create({ name: 'Alice', email: 'alice@example.com', passwordHash: bcrypt.hashSync('password',8), avatar: 'https://i.pravatar.cc/40?u=alice' });
  const bob = await User.create({ name: 'Bob', email: 'bob@example.com', passwordHash: bcrypt.hashSync('password',8), avatar: 'https://i.pravatar.cc/40?u=bob' });

  const c1 = await Comment.create({ text: 'This is a great post!', user: alice._id });
  const c2 = await Comment.create({ text: 'I agree with you.', user: bob._id, parent: c1._id });
  const c3 = await Comment.create({ text: 'Thanks for sharing.', user: bob._id });

  console.log('Seed complete');
  mongoose.disconnect();
}

seed().catch(err=>{ console.error(err); process.exit(1) });
