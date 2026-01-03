import express from 'express';
import { toggleLike, getLikesForPosts } from '../controllers/likeController.js';
import { requireAuth } from '../middlewares.js';

const likeRouter = express.Router();

likeRouter.post('/toggle', requireAuth, toggleLike);
likeRouter.post('/batch', getLikesForPosts);

export default likeRouter;
