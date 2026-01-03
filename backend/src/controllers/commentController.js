import Comment from "../models/comment.js";

export const createComment = (req, res) => {
    const { post_id, content } = req.body;
    const author_id = req.session.user?.id;
    const username = req.session.user?.username;

    if (!author_id) {
        return res.status(401).json({ message: "Please log in" });
    }
    if (!post_id || !content || content.trim().length === 0) {
        return res.status(400).json({ message: "Post ID and content required" });
    }

    Comment.create(post_id, author_id, content.trim(), (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
        res.status(201).json({
            success: true,
            comment: {
                id: result.id,
                post_id,
                author_id,
                username,
                content: content.trim(),
                created_at: new Date()
            }
        });
    });
};

export const deleteComment = (req, res) => {
    const { id } = req.body;
    const author_id = req.session.user?.id;

    if (!author_id) {
        return res.status(401).json({ message: "Please log in" });
    }
    if (!id) {
        return res.status(400).json({ message: "Comment ID required" });
    }

    Comment.delete(id, author_id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
        if (!result.success) {
            return res.status(403).json({ message: result.message });
        }
        res.json({ success: true });
    });
};

export const getComments = (req, res) => {
    const { post_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    Comment.getByPost(post_id, offset, limit, (err, comments) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
        Comment.countByPost(post_id, (err, total) => {
            if (err) {
                return res.status(500).json({ error: "Server error" });
            }
            res.json({
                comments,
                total,
                page,
                totalPages: Math.ceil(total / limit),
                currentUserId: req.session.user?.id || null
            });
        });
    });
};

export const getCommentsForPosts = (req, res) => {
    const { postIds } = req.body;

    if (!postIds || !Array.isArray(postIds)) {
        return res.status(400).json({ message: "Post IDs required" });
    }

    Comment.getCommentsInfoForPosts(postIds, (err, commentsInfo) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json(commentsInfo);
    });
};
