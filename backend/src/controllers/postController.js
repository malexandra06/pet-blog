import Post from "../models/post.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createPost = (req, res) => {
    const { title, content } = req.body;
    const author_id = req.session.user.id;
    
    if (!req.file) {
        return res.status(400).json({ message: "Image is required!" });
    }
    
    const image_url = `/uploads/${req.file.filename}`;

    if (!title || !author_id) {
        return res.status(400).json({ message: "Title and user are required!" });
    }

    Post.create(title, content || '', author_id, image_url, (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: err });
        }
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(201).json({ message: "Post created successfully!" });
        } else {
            res.redirect('/my-posts');
        }
    });
};

export const deletePost = (req, res) => {
    const { id } = req.body;
  
    if (!id) {
        return res.status(400).json({ error: "Post ID is required!" });
    }

    Post.delete(id, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: "Database error" });
        }
        
        if (result && result.affectedRows && result.affectedRows > 0) {
            return res.status(200).json({ 
                message: "Post deleted successfully!",
                success: true 
            });
        } else {
            return res.status(404).json({ 
                error: "Post not found" 
            });
        }
    });
};

export const updatePost = (req, res) => {
    const { id, title, content } = req.body;
    const author_id = req.session.user?.id;

    if (!author_id) {
        return res.status(401).json({ message: "Please log in" });
    }

    if (!id) {
        return res.status(400).json({ message: "Post ID is required" });
    }

    Post.findById(id, (err, post) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.author_id !== author_id) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }

        const newTitle = title || post.title;
        const newContent = content !== undefined ? content : post.content;

        Post.update(id, newTitle, newContent, (err) => {
            if (err) return res.status(500).json({ error: "Error updating post" });
            res.json({ 
                success: true, 
                message: "Post updated!",
                post: { id, title: newTitle, content: newContent }
            });
        });
    });
};

export const updatePostWithImage = (req, res) => {
    const { id, title, content } = req.body;
    const author_id = req.session.user?.id;

    if (!author_id) {
        return res.status(401).json({ message: "Please log in" });
    }

    if (!id) {
        return res.status(400).json({ message: "Post ID is required" });
    }

    Post.findById(id, (err, post) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.author_id !== author_id) {
            return res.status(403).json({ message: "You can only edit your own posts" });
        }

        const newTitle = title || post.title;
        const newContent = content !== undefined ? content : post.content;
        let newImageUrl = post.image_url;

        if (req.file) {
            newImageUrl = `/uploads/${req.file.filename}`;
            if (post.image_url) {
                const oldPath = path.join(__dirname, "../../../frontend/public", post.image_url);
                fs.unlink(oldPath, () => {});
            }
        }

        Post.updateWithImage(id, newTitle, newContent, newImageUrl, (err) => {
            if (err) return res.status(500).json({ error: "Error updating post" });
            res.json({ 
                success: true,
                post: { id, title: newTitle, content: newContent, image_url: newImageUrl }
            });
        });
    });
};

export const getPost = (req, res) => {
    const { id } = req.params;
    Post.findById(id, (err, post) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.json(post);
    });
};

export const updateTitle = (req, res) => {
    const { id, title } = req.body;
    if (!id || !title) {
        return res.status(400).json({ message: "ID and title required!" });
    }
  
    Post.updateTitle(id, title, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (!result) return res.status(404).json({ message: "Post not found!" });
        res.json({ message: "Title updated!" });
    });
};

export const updateContent = (req, res) => {
    const { id, content } = req.body;
    if (!id || !content) {
        return res.status(400).json({ message: "ID and content required!" });
    }
    Post.updateContent(id, content, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (!result) return res.status(404).json({ message: "Post not found!" });
        res.json({ message: "Content updated!" });
    });
};

export const getPosts = (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    let offset = (page - 1) * limit;

    Post.getAll(offset, limit, (err, posts) => {
        if (err) return res.status(500).json({ error: err });
        res.json(posts);
    });
};

export const postsUser = (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;
    let offset = (page - 1) * limit;
    let username = req.params.username;

    User.findByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (!user) return res.status(404).json({ error: "User not found" });
    
        Post.findByUser(user.getId(), offset, limit, (err, posts) => {
            if (err) return res.status(500).json({ error: "Server error" });
            res.json(posts);
        });
    });
};

export const myPosts = (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
  
    const author_id = req.session.user.id;
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 5;
    let offset = (page - 1) * limit;
  
    Post.findByUser(author_id, offset, limit, (err, posts) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json(posts || []);
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsPath = path.join(__dirname, "../../../frontend/public/uploads");
        cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files allowed!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;
