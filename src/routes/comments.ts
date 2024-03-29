import { HttpError } from '@nbit/express';

import { defineRoutes } from '../server';
import { schema } from '../support/schema';
import { db } from '../db';

const CommentCreateInput = schema(({ Record, String }) => {
  return Record({
    text: String,
  });
});

export default defineRoutes((app) => [
  app.post('/posts/:id/comments', async (request) => {
    const postId = request.params.id;
    const user = await request.authenticate();
    const body = await request.json();
    if (!CommentCreateInput.guard(body)) {
      throw new HttpError(400);
    }
    const { text } = body;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError(400, 'Invalid postId');
    }
    const comment = await db.Comment.insert({
      post: post.id,
      author: user.id,
      text,
      createdAt: new Date().toISOString(),
    });
    const newCommentList = [...post.comments, comment.id];
    await db.Post.update(post.id, { comments: newCommentList });
    return comment;
  }),

  app.delete('/comments/:id', async (request) => {
    const user = await request.authenticate();
    const commentId = request.params.id;
    const comment = await db.Comment.getById(commentId);
    if (!comment) {
      throw new HttpError(400, 'Invalid commentId');
    }
    const postId = comment.post;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError(500, 'Comment does not belong to any known post');
    }
    // TODO: Allow admin
    if (comment.author !== user.id && post.author !== user.id) {
      throw new HttpError(403, 'Forbidden');
    }
    const newCommentList = post.comments.filter((id) => id !== comment.id);
    await db.Post.update(post.id, { comments: newCommentList });
    await db.Comment.delete(comment.id);
    return { success: true };
  }),
]);
