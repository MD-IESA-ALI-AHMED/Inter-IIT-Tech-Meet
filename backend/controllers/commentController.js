import Comment from "../models/Comment.js";
import User from "../models/User.js";
import mongoose from "mongoose";

async function buildNested(comments) {
  const map = new Map();
  comments.forEach((c) => {
    const key = c._id.toString();
    const base = typeof c.toObject === "function" ? c.toObject() : { ...c };
    map.set(key, { ...base, replies: [] });
  });
  const roots = [];
  comments.forEach((c) => {
    if (c.parent) {
      const p = map.get(c.parent.toString());
      if (p) p.replies.push(map.get(c._id.toString()));
    } else {
      roots.push(map.get(c._id.toString()));
    }
  });
  return roots;
}

export const list = async (req, res) => {
  try {
    const comments = await Comment.find().populate("user").sort({ created_at: 1 });

    const userId = req.user?.id?.toString();

    const enhanced = await Promise.all(
      comments.map(async (c) => {
        let comment = c;

        await comment.populate("user");

        comment = comment.toObject();

        if (!comment.user) {
          comment.user = { name: "Anonymous", avatar: null };
        }

        const upArr = comment.upVotes ?? comment.upvotes ?? [];
        const downArr = comment.downVotes ?? comment.downvotes ?? [];

        const upVoteCount = upArr.length;
        const downVoteCount = downArr.length;
        const netVotes = upVoteCount - downVoteCount;

        const userVote = userId
          ? upArr.some((u) => u.toString() === userId)
            ? 1
            : downArr.some((u) => u.toString() === userId)
            ? -1
            : 0
          : 0;

        return {
          ...comment,
          id: comment._id.toString(),
          upVoteCount,
          downVoteCount,
          netVotes,
          userVote,
        };
      })
    );

    // ✅ Now enhanced is an array of fully resolved objects
    const nested = await buildNested(enhanced);

    res.json(nested);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const create = async (req, res) => {
  try {
    const { text, parent_id } = req.body;
    if (!text) return res.status(400).json({ message: "Text required" });
    console.log(req.user.id);
    const c = await Comment.create({
      text,
      user: req.user.id,
      parent: parent_id || null,
    });
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const vote = async (req, res) => {
  try {
    // 1️⃣ Destructure input
    const { id: commentId } = req.params;
    const { id: userId } = req.user;
    const { value: voteValue } = req.body;

    // 2️⃣ Validate vote
    if (![1, -1].includes(voteValue)) {
      return res
        .status(400)
        .json({ message: "Invalid vote value. Must be 1 or -1." });
    }

    // 3️⃣ Clean commentId and handle hidden characters
    const cleanCommentId = commentId.trim();
    const comment = await Comment.findById(commentId);
    console.log(commentId,comment);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    // 5️⃣ Normalize vote arrays
    const upArr = (comment.upVotes ?? []).map((u) => u.toString());
    const downArr = (comment.downVotes ?? []).map((u) => u.toString());
    const uidStr = userId.toString();

    const isUpvoted = upArr.includes(uidStr);
    const isDownvoted = downArr.includes(uidStr);

    // 6️⃣ Apply voting logic
    if (voteValue === 1) {
      if (isUpvoted) {
        comment.upVotes = upArr.filter((u) => u !== uidStr);
      } else {
        comment.upVotes = [...upArr, uidStr];
        comment.downVotes = downArr.filter((u) => u !== uidStr);
      }
    } else if (voteValue === -1) {
      if (isDownvoted) {
        comment.downVotes = downArr.filter((u) => u !== uidStr);
      } else {
        comment.downVotes = [...downArr, uidStr];
        comment.upVotes = upArr.filter((u) => u !== uidStr);
      }
    }

    // 7️⃣ Save changes
    await comment.save();

    // 8️⃣ Compute net votes and current user vote
    const netVotes = (comment.upVotes?.length || 0) - (comment.downVotes?.length || 0);
    const currentUserVote = comment.upVotes?.includes(uidStr)
      ? 1
      : comment.downVotes?.includes(uidStr)
      ? -1
      : 0;

    // 9️⃣ Return response
    res.json({ success: true, netVotes, userVote: currentUserVote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- Dev debug endpoints ---
export const debugRawComments = async (req, res) => {
  try {
    const comments = await Comment.find().limit(20).lean();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const debugPopulatedComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .limit(20)
      .populate("user", "name email avatar")
      .lean();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
