"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2, MoreHorizontal, Send, Check, Heart } from "lucide-react";
import CommentBox from "./CommentBox";
import { redirect, useRouter } from "next/navigation";
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
  const [copied, setCopied] = useState(false);
  const { data: session, status } = useSession();
  const [category, setCategory] = useState(null);
  const [similarPosts, setSimilarPosts] = useState<IPost[]>([]);
  const router = useRouter();
  const [showReportModel, setShowReportModel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportReason, setReportReason] = useState("");
  const { data } = useSession();

  const getPostInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/posts/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${data?.accessToken}`,
        },
      });

      const info = res.data;

      setPostInfo({
        ...info,
        isSaved: info.savedBy.length > 0 ? true : false,
        isLiked: info.likedBy.length > 0 ? true : false,
        likes: info._count.likedBy,
      });
      setCategory(info.category);
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
        comments: postInfo?.comments.filter(
          (c: IComment) => c.id !== commentId
        ),
      } as IPost);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const savePost = async () => {
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
      setPostInfo((prev) => prev && { ...prev, isSaved: true });
      toast.success(res.data.message, { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const unsavePost = async () => {
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
      setPostInfo((prev) => prev && { ...prev, isSaved: false });
      toast.success(res.data.message, { position: "bottom-center" });
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const deletePost = async () => {
    try {
      const res = await axios.delete(`${BACKEND_URL}/post/${postId}`, {
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
      url: `${window.location.origin}/post/${postId}`,
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
        `${window.location.origin}/post/${postId}`
      );
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleLikePost = async () => {
    try {
      const res = await axios.patch(
        `${BACKEND_URL}/posts/toggle-like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );

      const likeStatus = res.data.likeStatus;

      setPostInfo(
        (prev) =>
          prev && {
            ...prev,
            likes: likeStatus ? prev.likes + 1 : prev.likes - 1,
            isLiked: likeStatus,
          }
      );
    } catch (error: any) {
      toast.error(error.response.data.message || error.message);
    }
  };

  const fetchSimilarImagesForGivenCategory = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/posts/similar-images?category=${category}`,
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      const posts = res.data.filter((post: IPost) => post.id !== postId);
      setSimilarPosts(posts);
    } catch (error: any) {
      toast.error(error.response.data.message || error.message);
    }
  };

  const handleReportPost = async () => {
    try {
      setShowReportModel(true);
    } catch (error) {
      toast.error("Failed to report post");
    }
  };

  const reportPost = async () => {
    try {
      await axios.post(`${BACKEND_URL}/report`, {
        reason : reportReason,
        postId
      }, {
        headers : {
          Authorization : `Bearer ${data?.accessToken}`
        }
      });
      toast.info("Report Successfully Submitted", {
        position: "top-center",
      });
      router.push("/home");
    } catch (error) {
      toast.error("Failed to Report Post");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      getPostInfo();
    }
  }, [postId, status]);

  useEffect(() => {
    if (category && status === "authenticated") {
      fetchSimilarImagesForGivenCategory();
    }
  }, [category, status]);

  if (loading || status == "loading" || !postInfo) {
    return <PinPageSkeleton />;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
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
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-gray-100 rounded-full transition-all"
                      >
                        <MoreHorizontal className="h-6 w-6 text-gray-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                      <DropdownMenuItem
                        onClick={handleReportPost}
                        className="cursor-pointer"
                      >
                        <div className="hover:text-red-500">Report Post</div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={async () => {
                          if (
                            confirm(
                              "are you sure you want to delete this post?"
                            )
                          ) {
                            await deletePost();
                          }
                        }}
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
                    <Share2 className="h-6 w-6 text-gray-600" />
                  )}
                </Button>
                <div className="flex gap-1.5 items-center">
                  <div onClick={handleLikePost}>
                    {postInfo.isLiked ? (
                      <Heart className="fill-pink-500 border border-black cursor-pointer" />
                    ) : (
                      <Heart className="border-black cursor-pointer" />
                    )}
                  </div>
                  <span className="font-bold">{postInfo.likes}</span>
                </div>
              </div>

              <div
                onClick={() => {
                  if (postInfo.isSaved) {
                    unsavePost();
                  } else {
                    savePost();
                  }
                }}
              >
                {!postInfo.isSaved ? (
                  <Button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white rounded-xl">
                    Save
                  </Button>
                ) : (
                  <Button className="bg-black cursor-pointer hover:bg-black text-white rounded-xl">
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
                  value={commentText || ""}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  onClick={addComment}
                  className="p-2 bg-pink-500 rounded-full text-white hover:bg-pink-600 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 mb-4">
                {postInfo.comments.length ?? 0} Comments
              </h2>
              {postInfo &&
              postInfo.comments &&
              postInfo.comments?.length > 0 ? (
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

      {similarPosts && similarPosts.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            More like this
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {similarPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/post/${post.id}`)}
                className="group cursor-pointer relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title || "Similar post"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">
                        {post.title || "Untitled"}
                      </h3>
                      {post.user?.username && (
                        <p className="text-white/80 text-xs mt-1">
                          by {post.user.username}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReportModel && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Report Post</h3>
            <p className="text-gray-600 mb-4">Provide a reason for Report:</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-32"
              placeholder="Enter report reason..."
            />
            <div className="flex space-x-2">
              <button
                onClick={reportPost}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirm Report
              </button>
              <button
                onClick={() => {
                  setShowReportModel(false);
                  setReportReason("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
