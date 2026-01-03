import db from '../db.js';

class Post {
    constructor(id, title, content, author_id, image_url, created_at) {
        this.__id = id;
        this.__title = title;
        this.__content = content;
        this.__authorId = author_id;
        this.__imageUrl = image_url;
        this.__createdAt = created_at;
    }

    getTitle() { return this.__title; }
    getContent() { return this.__content; }
    getImage() { return this.__imageUrl; }

    static create(title, content, author_id, image_url, callback) {
        const sql = "INSERT INTO posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)";
        db.query(sql, [title, content, author_id, image_url], callback);
    }

    static delete(id, callback) {
        const sql = "DELETE FROM posts WHERE id = ?";
        db.query(sql, [id], (err, result) => {
            if (err) return callback(err);
            if (result.affectedRows === 0) return callback(null, null);
            callback(null, result);
        });
    }

    static findById(id, callback) {
        const sql = "SELECT * FROM posts WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err);
            if (results.length === 0) return callback(null, null);
            callback(null, results[0]);
        });
    }

    static update(id, title, content, callback) {
        const sql = "UPDATE posts SET title = ?, content = ? WHERE id = ?";
        db.query(sql, [title, content, id], (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    }

    static updateWithImage(id, title, content, image_url, callback) {
        const sql = "UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?";
        db.query(sql, [title, content, image_url, id], (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    }

    static updateTitle(id, title, callback) {
        const sql = "UPDATE posts SET title = ? WHERE id = ?";
        db.query(sql, [title, id], (err, result) => {
            if (err) return callback(err);
            if (result.affectedRows === 0) return callback(null, null);
            callback(null, result);
        });
    }

    static updateContent(id, content, callback) {
        const sql = "UPDATE posts SET content = ? WHERE id = ?";
        db.query(sql, [content, id], (err, result) => {
            if (err) return callback(err);
            if (result.affectedRows === 0) return callback(null, null);
            callback(null, result);
        });
    }

    static findByUser(author_id, offset = 0, limit = 5, callback) {
        const sql = `
            SELECT * FROM posts
            WHERE author_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.query(sql, [author_id, limit, offset], (err, res) => {
            if (err) return callback(err);
            callback(null, res || []);
        });
    }

    static getAll(offset, limit, callback) {
        const sql = `
            SELECT p.*, u.username 
            FROM posts p
            JOIN users u ON p.author_id = u.id
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;
        db.query(sql, [limit, offset], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
}

export default Post;
