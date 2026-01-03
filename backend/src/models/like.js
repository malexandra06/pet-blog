import db from '../db.js';

class Like {
    static toggle(post_id, user_id, callback) {
        const checkSql = "SELECT id FROM likes WHERE post_id = ? AND user_id = ?";
        db.query(checkSql, [post_id, user_id], (err, results) => {
            if (err) return callback(err);

            if (results.length > 0) {
                const deleteSql = "DELETE FROM likes WHERE post_id = ? AND user_id = ?";
                db.query(deleteSql, [post_id, user_id], (err) => {
                    if (err) return callback(err);
                    callback(null, { action: 'unliked' });
                });
            } else {
                const insertSql = "INSERT INTO likes (post_id, user_id) VALUES (?, ?)";
                db.query(insertSql, [post_id, user_id], (err) => {
                    if (err) return callback(err);
                    callback(null, { action: 'liked' });
                });
            }
        });
    }

    static countByPost(post_id, callback) {
        const sql = "SELECT COUNT(*) as count FROM likes WHERE post_id = ?";
        db.query(sql, [post_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0].count);
        });
    }

    static hasUserLiked(post_id, user_id, callback) {
        const sql = "SELECT id FROM likes WHERE post_id = ? AND user_id = ?";
        db.query(sql, [post_id, user_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results.length > 0);
        });
    }

    static getLikesInfoForPosts(postIds, userId, callback) {
        if (!postIds || postIds.length === 0) {
            return callback(null, {});
        }

        const placeholders = postIds.map(() => '?').join(',');
        const countSql = `SELECT post_id, COUNT(*) as count FROM likes WHERE post_id IN (${placeholders}) GROUP BY post_id`;

        db.query(countSql, postIds, (err, countResults) => {
            if (err) return callback(err);

            if (!userId) {
                const likesInfo = {};
                postIds.forEach(id => {
                    const found = countResults.find(r => r.post_id === id);
                    likesInfo[id] = { count: found ? found.count : 0, userLiked: false };
                });
                return callback(null, likesInfo);
            }

            const userLikesSql = `SELECT post_id FROM likes WHERE post_id IN (${placeholders}) AND user_id = ?`;
            db.query(userLikesSql, [...postIds, userId], (err, userLikesResults) => {
                if (err) return callback(err);

                const userLikedPosts = new Set(userLikesResults.map(r => r.post_id));
                const likesInfo = {};
                postIds.forEach(id => {
                    const found = countResults.find(r => r.post_id === id);
                    likesInfo[id] = {
                        count: found ? found.count : 0,
                        userLiked: userLikedPosts.has(id)
                    };
                });
                callback(null, likesInfo);
            });
        });
    }
}

export default Like;
