/* eslint-disable no-console */
import { db } from '../db';
import type { User } from '../types/User';

const users = [
  {
    name: 'Julie',
    profilePhoto:
      'https://user-images.githubusercontent.com/369384/192453593-560d6ae3-0e11-44dd-90f5-f0b87a8b4ce9.jpg',
    username: 'julie',
    password: '123',
  },
  {
    name: 'Kevin',
    profilePhoto:
      'https://user-images.githubusercontent.com/369384/192453596-ea862041-f1de-4e71-880b-2573c1f47ce8.jpg',
    username: 'kevin',
    password: '123',
  },
  {
    name: 'Liza',
    profilePhoto:
      'https://user-images.githubusercontent.com/369384/192453597-cc7bff73-b838-4db6-a137-6706805195bf.jpg',
    username: 'liza',
    password: '123',
  },
  {
    name: 'Zach',
    profilePhoto:
      'https://user-images.githubusercontent.com/369384/192453599-affcb8f9-b475-40c1-94dc-2f7d23f820c6.jpg',
    username: 'zach',
    password: '123',
  },
];

const posts = [
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451321-c511a886-1ecd-42dd-9afc-a1f2ae86d75b.jpeg',
    caption: 'Turnips are delicious',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-24T00:14:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451325-5bbd11b9-2ed9-4166-9987-ac52abfeb637.jpeg',
    caption: 'Arctic Penguins',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-24T03:23:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451326-beed0b86-28f2-4979-8250-d304b57e7801.jpeg',
    caption: "Enjoy life for it's beauty",
    likedBy: [],
    comments: [],
    createdAt: '2022-09-25T12:32:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451328-6c4b2bd5-3443-44b7-ac55-2b7dfa0176de.jpeg',
    caption: 'Farm life',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-25T14:41:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451331-12e2bf6c-d4d5-4df3-b445-75d986ae86a1.jpeg',
    caption: 'Summer breeze',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-25T19:59:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451334-1ee81ecb-cab0-47b9-a601-0fbfc0fd3fdd.jpeg',
    caption: 'Arizona cactus',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451337-6b988d5f-af92-48cc-9c94-4e3f7a435f1c.jpeg',
    caption: 'No better time to be alive',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451339-f66ff3ae-eda6-4715-8896-7e021904a283.jpeg',
    caption: 'Stay frosty',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451342-6095f8d0-3138-4b5a-8e94-aede107f18a9.jpeg',
    caption: "Enjoy life's subtle moments",
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451345-81ab917e-f1e2-4b61-8cf5-9d685dacab75.jpeg',
    caption: "It's colder at night than outside",
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451346-acabcb5f-7f06-4113-bc54-adba78932a0b.jpeg',
    caption: 'Wyoming is great',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451348-dac99392-7620-4369-b653-4b894abc154e.jpeg',
    caption: 'Stay hydrated',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
  {
    photo:
      'https://user-images.githubusercontent.com/369384/192451350-2c2d995e-9fce-45a0-a65a-9d5fa412702a.jpeg',
    caption: 'Turtle paradise',
    likedBy: [],
    comments: [],
    createdAt: '2022-09-26T01:12:00.000Z',
  },
];

async function seed() {
  const insertedUsers: Array<User> = [];
  for (const user of users) {
    const newUser = await db.User.insert(user);
    console.log(`Inserted user: ${newUser.username}`);
    insertedUsers.push(newUser);
  }
  for (const post of posts) {
    const userIndex = Math.floor(Math.random() * insertedUsers.length);
    const user = insertedUsers[userIndex];
    if (user) {
      const newPost = await db.Post.insert({
        author: user.id,
        ...post,
      });
      console.log(`Inserted post: ${newPost.id}`);
    }
  }
  console.log('Done.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
