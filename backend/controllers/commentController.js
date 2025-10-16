import Comment from "../models/Comment.js";

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
    const comments = await Comment.find()
      .sort({ created_at: 1 })
      .populate("user", "name avatar");

    const userId = req.user?._id?.toString();

    const enhanced = comments.map((c) => {
      const comment = c.toObject(); 

     
      const upVoteCount = (comment.upVotes || []).length;
      const downVoteCount = (comment.downVotes || []).length;
      const netVotes = upVoteCount - downVoteCount;

      
      const userVote = userId
        ? comment.upVotes.some((u) => u.toString() === userId)
          ? 1
          : comment.downVotes.some((u) => u.toString() === userId)
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
    });

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
    // 1. Destructure and validate input for clarity
    const { id: commentId } = req.params;
    const { id: userId } = req.user; // Use a consistent variable name
    const { value: voteValue } = req.body;

    if (![1, -1].includes(voteValue)) {
      return res.status(400).json({ message: "Invalid vote value. Must be 1 or -1." });
    }

    // 2. Fetch the comment document
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found." });
    }

    const isUpvoted = comment.upVotes.includes(userId);
    const isDownvoted = comment.downVotes.includes(userId);


    if (voteValue === 1) {
      
      comment.downVotes.pull(userId);
      
      if (isUpvoted) {
        comment.upVotes.pull(userId);
      } else {
        comment.upVotes.addToSet(userId); 
      }
    } else if (voteValue === -1) {

      comment.upVotes.pull(userId);

      if (isDownvoted) {
        comment.downVotes.pull(userId);
      } else {
        comment.downVotes.addToSet(userId); 
      }
    }

    await comment.save();

    const netVotes = comment.upVotes.length - comment.downVotes.length;
    const currentUserVote = comment.upVotes.includes(userId)
      ? 1
      : comment.downVotes.includes(userId)
      ? -1
      : 0;

    res.json({
      success: true,
      netVotes,
      userVote: currentUserVote,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};