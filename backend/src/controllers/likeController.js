import Like from "../models/like.js";

export const toggleLike = (req, res) => {
    const { post_id } = req.body;
    const user_id = req.session.user?.id;

    if (!user_id) {
        return res.status(401).json({ message: "Please log in" });
    }
    if (!post_id) {
        return res.status(400).json({ message: "Post ID required" });
    }

    Like.toggle(post_id, user_id, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
        Like.countByPost(post_id, (err, count) => {
            if (err) {
                return res.status(500).json({ error: "Server error" });
            }
            res.json({
                success: true,
                action: result.action,
                likesCount: count,
                userLiked: result.action === 'liked'
            });
        });
    });
};

export const getLikesForPosts = (req, res) => {
    const { postIds } = req.body;
    const user_id = req.session.user?.id;

    if (!postIds || !Array.isArray(postIds)) {
        return res.status(400).json({ message: "Post IDs required" });
    }

    Like.getLikesInfoForPosts(postIds, user_id, (err, likesInfo) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json(likesInfo);
    });
};
