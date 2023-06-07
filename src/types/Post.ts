export type Post = {
  id: string;
  author: string;
  photo: string;
  caption: string;
  likedBy: Array<string>;
  comments: Array<string>;
  createdAt: string;
};
