import TokenBlacklist from '../models/TokenBlacklist.js';

export const logout = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(400).json({ message: 'No token provided' });
    const parts = auth.split(' ');
    if (parts.length !== 2) return res.status(400).json({ message: 'Bad token' });
    const token = parts[1];

    // store token in blacklist
    const expiresAt = null; // optional: set expiration by decoding token
    await TokenBlacklist.create({ token, expires_at: expiresAt });
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
