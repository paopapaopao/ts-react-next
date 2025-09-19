import { PrismaClient, ReactionType } from '@prisma/client';

type DummyJSONComment = {
  id: number;
  body: string;
  user: { id: number };
  postId: number;
  likes: number;
};

type DummyJSONPost = {
  id: number;
  title: string;
  body: string;
  userId: number;
  reactions: {
    likes: number;
    dislikes: number;
  };
  views: number;
};

type DummyJSONUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  image: string;
};

const database = new PrismaClient();

const getUsers = async (): Promise<DummyJSONUser[]> => {
  let users: DummyJSONUser[] = [];

  try {
    const response: Response = await fetch(
      'https://dummyjson.com/users?limit=0&select=id,firstName,lastName,username,image'
    );

    if (!response.ok) {
      throw new Error('An error occurred while getting users.');
    }

    const data: { users: DummyJSONUser[] } = await response.json();
    users = data.users;
  } catch (error) {
    console.error(error);
  }

  return users;
};

const getPosts = async (): Promise<DummyJSONPost[]> => {
  let posts: DummyJSONPost[] = [];

  try {
    const response: Response = await fetch(
      'https://dummyjson.com/posts?limit=0&select=id,title,body,userId,reactions,views'
    );

    if (!response.ok) {
      throw new Error('An error occurred while getting posts.');
    }

    const data: { posts: DummyJSONPost[] } = await response.json();
    posts = data.posts;
  } catch (error) {
    console.error(error);
  }

  return posts;
};

const getComments = async (): Promise<DummyJSONComment[]> => {
  let comments: DummyJSONComment[] = [];

  try {
    const response: Response = await fetch(
      'https://dummyjson.com/comments?limit=0&select=id,body,user,postId,likes'
    );

    if (!response.ok) {
      throw new Error('An error occurred while getting comments.');
    }

    const data: { comments: DummyJSONComment[] } = await response.json();
    comments = data.comments;
  } catch (error) {
    console.error(error);
  }

  return comments;
};

async function main() {
  await database.view.deleteMany({});
  await database.reaction.deleteMany({});
  await database.comment.deleteMany({});
  // *Resets the id to 1
  await database.$executeRawUnsafe(
    `ALTER SEQUENCE "Comment_id_seq" RESTART WITH 1`
  );
  await database.post.deleteMany({});
  // *Resets the id to 1
  await database.$executeRawUnsafe(
    `ALTER SEQUENCE "Post_id_seq" RESTART WITH 1`
  );
  await database.user.deleteMany({});
  // *Resets the id to 1
  await database.$executeRawUnsafe(
    `ALTER SEQUENCE "User_id_seq" RESTART WITH 1`
  );

  const initialUsers: DummyJSONUser[] = await getUsers();
  const initialPosts: DummyJSONPost[] = await getPosts();
  const initialComments: DummyJSONComment[] = await getComments();
  const initialPostReactions: { likes: number; dislikes: number }[] = [];
  const initialCommentReactions: number[] = [];
  const initialViews: number[] = [];

  for (const user of initialUsers) {
    await database.user.create({
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        image: user.image,
      },
    });
  }

  for (const post of initialPosts) {
    await database.post.create({
      data: {
        body: post.body,
        title: post.title,
        userId: post.userId,
      },
    });

    initialPostReactions.push({
      likes: Math.floor((post.reactions.likes % initialUsers.length) / 2),
      dislikes: Math.floor((post.reactions.dislikes % initialUsers.length) / 2),
    });

    initialViews.push(post.views);
  }

  for (const comment of initialComments) {
    await database.comment.create({
      data: {
        body: comment.body,
        postId: comment.postId,
        userId: comment.user.id,
      },
    });

    initialCommentReactions.push(comment.likes);
  }

  for (let index = 0; index < initialPostReactions.length; index++) {
    let userId = 1;

    for (let i = 0; i < initialPostReactions[index].likes % 10; i++) {
      await database.reaction.create({
        data: {
          type: ReactionType.LIKE,
          userId,
          postId: index + 1,
        },
      });

      userId++;
    }

    for (let i = 0; i < initialPostReactions[index].dislikes % 10; i++) {
      await database.reaction.create({
        data: {
          type: ReactionType.DISLIKE,
          userId,
          postId: index + 1,
        },
      });

      userId++;
    }
  }

  for (let index = 0; index < initialCommentReactions.length; index++) {
    let userId = 1;

    for (let i = 0; i < initialCommentReactions[index] % 10; i++) {
      await database.reaction.create({
        data: {
          type: ReactionType.LIKE,
          userId,
          commentId: index + 1,
        },
      });

      userId++;
    }
  }

  for (let index = 0; index < initialViews.length; index++) {
    let userId = 1;

    for (let i = 0; i < initialViews[index] % 10; i++) {
      await database.view.create({
        data: {
          userId,
          postId: index + 1,
        },
      });

      userId++;
    }
  }
}

main()
  .then(async () => {
    await database.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await database.$disconnect();
    process.exit(1);
  });
