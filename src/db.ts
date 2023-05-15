import { fromSchema, Model } from './support/orm';
import type { Session } from './types/Session';
import type { User } from './types/User';

export const db = fromSchema({
  Session: Model<Session>(),
  User: Model<User>(),
});
