import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Comment from '../models/Comment.js';

// Fallback for local development
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interiit-dev';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected successfully.');

    // Clear existing data
    console.log('Clearing old users and comments...');
    await User.deleteMany({});
    await Comment.deleteMany({});
    console.log('Old data cleared.');

    // Create sample users
    console.log('Creating users...');
    const users = [
      { name: 'Alice', email: 'alice@example.com', password: 'password123', avatar: `https://i.pravatar.cc/40?u=alice` },
      { name: 'Bob', email: 'bob@example.com', password: 'password123', avatar: `https://i.pravatar.cc/40?u=bob` },
      { name: 'Carol', email: 'carol@example.com', password: 'password123', avatar: `https://i.pravatar.cc/40?u=carol` }
    ];

    const createdUsers = [];
    for (const u of users) {
      const hash = bcrypt.hashSync(u.password, 8);
      const cu = await User.create({ name: u.name, email: u.email, passwordHash: hash, avatar: u.avatar });
      createdUsers.push(cu);
    }
    console.log(`${createdUsers.length} users created.`);

    // Helper to pick user id
    const uid = (i) => createdUsers[i % createdUsers.length]._id;

    // Create sample comments (nested)
    console.log('Creating comments...');
    // root comments
    const c1 = await Comment.create({ text: 'This is the first comment', user: uid(0), parent: null, upvotes: [uid(1), uid(2)], downvotes: [] });
    const c2 = await Comment.create({ text: 'This is another top-level comment', user: uid(1), parent: null, upvotes: [uid(0)], downvotes: [uid(2)] });

    // replies
    const c3 = await Comment.create({ text: 'Reply to first comment', user: uid(2), parent: c1._id, upvotes: [uid(0)], downvotes: [] });
    const c4 = await Comment.create({ text: 'Nested reply', user: uid(1), parent: c3._id, upvotes: [], downvotes: [] });
    const c5 = await Comment.create({ text: 'Second reply to first comment', user: uid(1), parent: c1._id, upvotes: [], downvotes: [uid(2)] });

    console.log('Comments inserted:');
    console.log(' -', c1.text);
    console.log(' -', c2.text);
    console.log(' -', c3.text);
    console.log(' -', c4.text);
    console.log(' -', c5.text);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();
