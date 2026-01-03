import express from 'express';
import { 
    createPost, 
    deletePost, 
    updateTitle, 
    updateContent, 
    getPosts, 
    postsUser, 
    myPosts,
    updatePost,
    updatePostWithImage,
    getPost
} from '../controllers/postController.js';
import upload from '../controllers/postController.js'; 
import { requireAuth } from '../middlewares.js';

const postRouter = express.Router();

postRouter.get('/posts', getPosts);
postRouter.get('/post/:id', getPost);
postRouter.post('/post', requireAuth, upload.single('image'), createPost);
postRouter.delete('/deletePost', requireAuth, deletePost);
postRouter.put('/update', requireAuth, updatePost);
postRouter.put('/update-with-image', requireAuth, upload.single('image'), updatePostWithImage);
postRouter.put('/update/title', requireAuth, updateTitle);
postRouter.put('/update/content', requireAuth, updateContent);
postRouter.get('/my-posts', myPosts);
postRouter.get('/:username', postsUser);

export default postRouter;
