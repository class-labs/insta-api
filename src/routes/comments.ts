import { HttpError } from '@nbit/express';

import { defineRoutes } from '../server';
import { schema } from '../support/schema';
import { db } from '../db';

const CommentCreateInput = schema(({ Record, String }) => {
  return Record({
    postId: String,
    text: String,
  });
});

export default defineRoutes((app) => [
  app.post('/comments', async (request) => {
    const user = await request.authenticate();
    const body = await request.json();
    if (!CommentCreateInput.guard(body)) {
      throw new HttpError({ status: 400 });
    }
    const { postId, text } = body;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError({ status: 400, message: 'Invalid postId' });
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
      throw new HttpError({ status: 400, message: 'Invalid commentId' });
    }
    const postId = comment.post;
    const post = await db.Post.getById(postId);
    if (!post) {
      throw new HttpError({
        status: 500,
        message: 'Comment does not belong to any known post',
      });
    }
    // TODO: Allow admin
    if (comment.author !== user.id && post.author !== user.id) {
      throw new HttpError({ status: 403, message: 'Forbidden' });
    }
    const newCommentList = post.comments.filter((id) => id !== comment.id);
    await db.Post.update(post.id, { comments: newCommentList });
    await db.Comment.delete(comment.id);
    return { success: true };
  }),
]);
