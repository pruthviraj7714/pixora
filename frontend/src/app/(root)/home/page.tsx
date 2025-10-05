"use client";

import PinBox from "@/components/Pinbox";
import { BACKEND_URL } from "@/lib/config";
import { IPost } from "@/types/post";
import axios from "axios";
import { LucideLoader } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [posts, setPosts] = useState<IPost[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { data, status } = useSession();

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/posts`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      const posts = res.data;
      const formattedPosts = posts.map((post: IPost) => ({
        ...post,
        isSaved: post.savedBy.length > 0,
      }));
      setPosts(formattedPosts);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
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
          post.id === postId
            ? {
                ...post,
                isSaved: true,
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
          post.id === postId
            ? {
                ...post,
                isSaved: false,
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
      fetchPosts();
    }
  }, [status]);

  if (loading) {
    return (
      <div className="flex flex-col items-center min-h-screen mt-40 space-y-4 p-6">
        <p className="text-xl font-medium text-gray-700">
          We are adding new feed to your gallery...
        </p>
        <div>
          <LucideLoader size={35} className="text-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="columns-2 md:columns-3 xl:columns-4">
        {posts &&
          posts.length > 0 &&
          posts.map((post: IPost) => (
            <PinBox
              key={post.id}
              post={post}
              onSave={() => savePost(post.id)}
              onUnsave={() => unsavePost(post.id)}
            />
          ))}
      </div>
    </div>
  );
}
