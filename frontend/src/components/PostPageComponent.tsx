"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2Icon, MoreHorizontalIcon, SendIcon, Check } from "lucide-react";
import CommentBox from "./CommentBox";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IPost } from "@/types/post";
import PinPageSkeleton from "./PinPageSkeleton";
import { BACKEND_URL } from "@/lib/config";
import { IComment } from "@/types/comment";

export default function PostPageComponent({ postId }: { postId: string }) {
  const [postInfo, setPostInfo] = useState<IPost | null>(null);
  const [commentText, setCommentText] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { data } = useSession();

  const getPostInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      setPostInfo(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data.message || "Failed to load Post information"
      );
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/comment/post/${postId}`,
        {
          text: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      setCommentText("");
      toast.success("Comment successfully added!");
      setPostInfo({
        ...postInfo,
        comments: [res.data.comment, ...(postInfo?.comments || [])],
      } as IPost);
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.response.data.message);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/comment/${commentId}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      toast.success("comment successfully deleted!");
      setPostInfo({
        ...postInfo,
        comments: postInfo?.comments.filter((c: IComment) => c.id !== commentId),
      } as IPost);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const savePin = async () => {
    try {
      const res = await axios.post(`/api/pin/save?pinId=${postId}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      toast.success(res.data.message, { position: "bottom-center" });
      setIsSaved(res.data.isSaved);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const res = await axios.delete(`/api/pin/delete?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });
      toast.success(res.data.message);
      router.push("/home");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: postInfo?.title || "Check out this post",
      text: postInfo?.description || "Interesting post to share",
      url: `${window.location.origin}/pin/${postId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/pin/${postId}`
      );
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  useEffect(() => {
    getPostInfo();
  }, [postId]);

  if (loading || status == "loading" || !postInfo) {
    return <PinPageSkeleton />;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="h-[600px] md:w-1/2 bg-transparent">
            <img
              src={postInfo.image || "/placeholder.svg?height=600&width=400"}
              alt={postInfo.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="md:w-1/2 p-8 bg-white shadow-lg rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                {session?.user.id === postInfo.userId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-gray-100 rounded-full transition-all"
                      >
                        <MoreHorizontalIcon className="h-6 w-6 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-200 hover:bg-gray-300 ">
                      <DropdownMenuItem
                        onClick={() => deletePost(postId)}
                        className="cursor-pointer"
                      >
                        <div className="hover:text-red-500">Delete</div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Button
                  onClick={handleShare}
                  size="icon"
                  variant="ghost"
                  className="hover:bg-gray-100 rounded-full transition-all relative"
                >
                  {copied ? (
                    <Check className="h-6 w-6 text-green-600" />
                  ) : (
                    <Share2Icon className="h-6 w-6 text-gray-600" />
                  )}
                </Button>
              </div>

              <div onClick={savePin}>
                {!isSaved ? (
                  <Button className="bg-red-500 hover:bg-red-600 text-white rounded-xl">
                    Save
                  </Button>
                ) : (
                  <Button className="bg-black hover:bg-black text-white rounded-xl">
                    Saved
                  </Button>
                )}
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
              {postInfo.title || "Untitled Pin"}
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              {postInfo.description || "No description available."}
            </p>

            <div className="flex items-center space-x-4 mb-6">
              <div
                onClick={() => router.push(`/${postInfo.user?.username}`)}
                className="cursor-pointer text-gray-800 h-10 w-10 rounded-full flex justify-center items-center bg-gray-200"
              >
                {postInfo.user?.username.charAt(0).toUpperCase()}
              </div>
              <p
                onClick={() => router.push(`/${postInfo.user?.username}`)}
                className="cursor-pointer font-semibold text-gray-900"
              >
                {postInfo.user?.username || "Unknown User"}
              </p>
            </div>

            <div className="border-t border-gray-300 pt-6 max-h-[320px] overflow-auto">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                <textarea
                  className="w-full h-12 p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-shadow resize-none"
                  placeholder="Add a comment..."
                  value={commentText as string}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={addComment}
                  className="p-2 bg-pink-500 rounded-full text-white hover:bg-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-4">
                {postInfo.comments.length ?? 0} Comments
              </h2>
              {postInfo && postInfo.comments && postInfo.comments?.length > 0 ? (
                postInfo.comments.map((comment: IComment) => (
                  <CommentBox
                    onDelete={() => deleteComment(comment.id)}
                    key={comment.id}
                    comment={comment}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center my-4 text-center">
                  <span className="font-bold text-gray-800">
                    No comments yet!
                  </span>
                  <span className="text-gray-500">
                    Be the first to comment and start the conversation.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}