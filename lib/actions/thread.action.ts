"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectDB } from "../mongoose";

interface Params {
  text: string
  author: string
  communityId: string | null
  path: string
}

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    connectDB();

    const createdThread = await Thread.create({
      text,
      author,
      communityId: null,
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id }
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`)
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    connectDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts/threads that have no parents (top-level threads...)
    const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({ 
        path: "children",
        populate: { 
          path: "author",
          model: User,
          select: "_id name parentId image"
        }
     })

    // count all the documents with the given query, in this case all the document with parentId thats equals to null | undefined
    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

    const posts = await postsQuery.exec();

    // if totalposts is greater than skip amount + posts.length meaning last page and current page then we still have next page
    const isNext = totalPostsCount > skipAmount + posts.length;

    return { posts, isNext };
  } catch (error: any) {
    throw new Error(`Failed fetching posts: ${error.message}`)
  }
}

export async function fetchThreadById(id: string) {
  try {
    connectDB();

    const thread = await Thread.findById(id)
    .populate({
      path: 'author',
      model: User,
      select: '_id id name image'
    })
    .populate({
      path: 'children',
      populate: [
        {
          path: 'author',
          model: User,
          select: '_id id parentId name image'
        },
        {
          path: 'children',
          model: Thread,
          populate: {
            path: 'author',
            model: User,
            select: '_id id parentId name image'
          }
        }
      ]
    }).exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread by id: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string, 
  commentText: string, 
  userId: string,
  path: string
) {

  try {
    connectDB();

    const parentThread = await Thread.findById(threadId);

    if (!parentThread){
      throw new Error('Thread not found');
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId
    });

    const savedCommentThread = await commentThread.save();

    parentThread.children.push(savedCommentThread._id);
    await parentThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`)
  }
}