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
  const { data } = useSession();

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/posts`, {
        headers : {
            Authorization : `Bearer ${data?.accessToken}`
        }
      });
      setPosts(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (pinId: string) => {
    try {
      const res = await axios.post(`/api/pin/save?pinId=${pinId}`);
      toast.success(res.data.message, { position: "bottom-center" });
      setPosts((prev: any) =>
        prev.map((post: IPost) =>
          post.id === pinId ? { ...post, isSaved: res.data.isSaved } : post
        )
      );
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
            <PinBox key={post.id} post={post} onSave={() => savePost(post.id)} />
          ))}
      </div>
    </div>
  );
}