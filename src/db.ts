import { fromSchema, Model } from './support/orm';
import type { Comment } from './types/Comment';
import type { Post } from './types/Post';
import type { Session } from './types/Session';
import type { User } from './types/User';

export const db = fromSchema({
  Comment: Model<Comment>(),
  Post: Model<Post>(),
  Session: Model<Session>(),
  User: Model<User>(),
});
