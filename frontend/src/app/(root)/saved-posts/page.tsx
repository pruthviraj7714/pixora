"use client";

import PinBox from "@/components/Pinbox";
import { BACKEND_URL } from "@/lib/config";
import { IPost, ISavedPost } from "@/types/post";
import axios from "axios";
import { Bookmark, LucideLoader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface SavedPostType {
  id: string;
  post: IPost;
  userId: string;
  postId: string;
}

export default function SavedPinsPage() {
  const [posts, setPosts] = useState<ISavedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data, status } = useSession();

  const fetchSavedPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/saved`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      const posts = res.data.map((post: ISavedPost) => ({
        ...post,
        post: {
          ...post.post,
          isSaved: true,
        },
      }));

      setPosts(posts);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const savePost = async (postId: string) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/posts/save/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      setPosts((prev) =>
        (prev || []).map((post) =>
          post.post.id === postId
            ? {
                ...post,
                post: {
                  ...post.post,
                  isSaved: true,
                },
              }
            : post
        )
      );
      toast.success(res.data.message, { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const unsavePost = async (postId: string) => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/posts/unsave/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      setPosts((prev) =>
        (prev || []).map((post) =>
          post.post.id === postId
            ? {
                ...post,
                post: {
                  ...post.post,
                  isSaved: false,
                },
              }
            : post
        )
      );
      toast.success(res.data.message, { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedPosts();
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center min-h-screen mt-40 space-y-4 p-6">
        <p className="text-xl font-medium text-gray-700">
          fetching your beautiful picks...
        </p>
        <div>
          <LucideLoader size={35} className="text-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-6 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          Your Saved Posts
        </h1>
        <p className="text-lg text-gray-600">
          Discover and organize your favorite ideas
        </p>
      </header>

      {posts && posts.length > 0 ? (
        <div className="columns-1 space-y-4 sm:columns-2-2 lg:columns-3-3 xl:columns-4 animate-fade-in">
          {posts.map((post: ISavedPost) => (
            <div key={post.id} className="animate-scale-in">
              <PinBox
                post={post.post}
                onSave={() => savePost(post.postId)}
                onUnsave={() => unsavePost(post.postId)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow text-center animate-fade-in">
          <Bookmark className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Posts Found
          </h2>
          <p className="text-gray-500 max-w-md">
            Start saving some posts to see them here. Explore new ideas and save
            your favorites!
          </p>
        </div>
      )}
    </div>
  );
}
