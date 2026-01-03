import express from 'express';
import { createComment, deleteComment, getComments, getCommentsForPosts } from '../controllers/commentController.js';
import { requireAuth } from '../middlewares.js';

const commentRouter = express.Router();

commentRouter.post('/', requireAuth, createComment);
commentRouter.delete('/', requireAuth, deleteComment);
commentRouter.get('/:post_id', getComments);
commentRouter.post('/batch', getCommentsForPosts);

export default commentRouter;
