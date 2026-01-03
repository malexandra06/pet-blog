import db from '../db.js';

class Comment {
    static create(post_id, author_id, content, callback) {
        const sql = "INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)";
        db.query(sql, [post_id, author_id, content], (err, result) => {
            if (err) return callback(err);
            callback(null, { id: result.insertId });
        });
    }

    static delete(id, author_id, callback) {
        const checkSql = "SELECT author_id FROM comments WHERE id = ?";
        db.query(checkSql, [id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) {
                return callback(null, { success: false, message: 'Comment not found' });
            }
            if (results[0].author_id !== author_id) {
                return callback(null, { success: false, message: 'Not authorized' });
            }
            const deleteSql = "DELETE FROM comments WHERE id = ?";
            db.query(deleteSql, [id], (err) => {
                if (err) return callback(err);
                callback(null, { success: true });
            });
        });
    }

    static getByPost(post_id, offset, limit, callback) {
        const sql = `
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.author_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.query(sql, [post_id, limit, offset], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    static countByPost(post_id, callback) {
        const sql = "SELECT COUNT(*) as count FROM comments WHERE post_id = ?";
        db.query(sql, [post_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0].count);
        });
    }

    static getCommentsInfoForPosts(postIds, callback) {
        if (!postIds || postIds.length === 0) {
            return callback(null, {});
        }
        const placeholders = postIds.map(() => '?').join(',');
        const sql = `SELECT post_id, COUNT(*) as count FROM comments WHERE post_id IN (${placeholders}) GROUP BY post_id`;
        db.query(sql, postIds, (err, results) => {
            if (err) return callback(err);
            const commentsInfo = {};
            postIds.forEach(id => {
                const found = results.find(r => r.post_id === id);
                commentsInfo[id] = found ? found.count : 0;
            });
            callback(null, commentsInfo);
        });
    }
}

export default Comment;
