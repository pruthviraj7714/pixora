"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PinBox3 from "@/components/PinBox3";
import Link from "next/link";
import { Bookmark, Share2, XCircle, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import { IPost, ISavedPost } from "@/types/post";

export interface ProfileUserTypes {
  email: string;
  firstname: string;
  id: string;
  lastname: string;
  posts: IPost[];
  savedPosts: ISavedPost[];
  username: string;
}

type TabType = "created" | "saved" | "pending" | "rejected";

export default function ProfilePageComponent({
  username,
}: {
  username: string;
}) {
  const [userInfo, setUserInfo] = useState<ProfileUserTypes | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("created");
  const [createdPosts, setCreatedPosts] = useState<IPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<ISavedPost[]>([]);
  const [pendingPosts, setPendingPosts] = useState<IPost[]>([]);
  const [rejectedPosts, setRejectedPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setUserInfo(res.data);

      const allPosts = res.data.posts || [];
      setCreatedPosts(
        allPosts.filter((post: IPost) => post.status === "APPROVED")
      );
      setPendingPosts(
        allPosts.filter((post: IPost) => post.status === "PENDING")
      );
      setRejectedPosts(
        allPosts.filter((post: IPost) => post.status === "REJECTED")
      );
      setSavedPosts(res.data.savedPosts);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/${username}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      toast.success("Post deleted successfully");
      fetchUserInfo();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete post");
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserInfo();
    }
  }, [status]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex flex-col items-center min-h-screen p-4">
        <div className="flex flex-col items-center mt-5">
          <Skeleton className="w-32 h-32 rounded-full bg-gray-200" />
          <Skeleton className="mt-2 h-6 w-48 bg-gray-200" />
          <Skeleton className="mt-1 h-5 w-32 bg-gray-200" />
          <Skeleton className="mt-3 w-24 h-8 bg-gray-300 rounded-full" />
        </div>

        <div className="flex gap-6 mt-5">
          <Skeleton className="px-4 py-2 w-20 h-8 bg-gray-200" />
          <Skeleton className="px-4 py-2 w-20 h-8 bg-gray-200" />
          <Skeleton className="px-4 py-2 w-20 h-8 bg-gray-200" />
        </div>

        <div className="w-full mt-6">
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-4 min-h-screen p-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full h-64 bg-gray-200 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isOwnProfile = session?.user.id === userInfo?.id;

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="flex flex-col items-center mt-5">
        <div className="w-32 h-32 flex justify-center text-black font-bold text-5xl bg-gray-200 items-center rounded-full">
          {userInfo?.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-3xl text-black font-semibold mt-2">
          {userInfo?.firstname} {userInfo?.lastname}
        </div>
        <span className="text-gray-600 text-lg mt-1">
          @{userInfo?.username}
        </span>
        <div className="flex items-center gap-4 mt-3">
          <Button
            onClick={handleShare}
            className="rounded-full bg-gray-200 hover:bg-gray-300 text-black"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          {isOwnProfile && (
            <Button
              onClick={() => router.push("/edit-profile")}
              className="bg-pink-500 rounded-full hover:bg-pink-600 text-white"
            >
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center mt-5 w-full">
        <div className="flex gap-6">
          <div
            className={`px-4 py-1 cursor-pointer font-semibold ${
              activeTab === "created" ? "border-b-2 border-black" : ""
            }`}
            onClick={() => setActiveTab("created")}
          >
            Created
          </div>
          <div
            className={`px-4 py-1 cursor-pointer font-semibold ${
              activeTab === "saved" ? "border-b-2 border-black" : ""
            }`}
            onClick={() => setActiveTab("saved")}
          >
            Saved
          </div>
          {isOwnProfile && (
            <>
              <div
                className={`px-4 py-1 cursor-pointer font-semibold ${
                  activeTab === "pending" ? "border-b-2 border-black" : ""
                }`}
                onClick={() => setActiveTab("pending")}
              >
                Pending
                {pendingPosts.length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    {pendingPosts.length}
                  </span>
                )}
              </div>
              <div
                className={`px-4 py-1 cursor-pointer font-semibold ${
                  activeTab === "rejected" ? "border-b-2 border-black" : ""
                }`}
                onClick={() => setActiveTab("rejected")}
              >
                Rejected
                {rejectedPosts.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {rejectedPosts.length}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="w-full mt-6">
          {activeTab === "created" ? (
            createdPosts && createdPosts.length > 0 ? (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-4 min-h-screen p-6">
                {createdPosts.map((post: IPost) => (
                  <PinBox3 post={post} key={post.id} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-10 flex-grow text-center animate-fade-in">
                {isOwnProfile ? (
                  <div>
                    Nothing to show...yet! Posts that you create will live here.
                  </div>
                ) : (
                  <div className="text-xl font-semibold">
                    No Posts Posted by @{userInfo?.username} yet
                  </div>
                )}
                {isOwnProfile && (
                  <Link
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 mt-4 rounded-lg"
                    href={"/create"}
                  >
                    Create Pin
                  </Link>
                )}
              </div>
            )
          ) : activeTab === "saved" ? (
            <div className="w-full">
              {savedPosts && savedPosts.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-4 min-h-screen p-6">
                  {savedPosts.map((savedPost: ISavedPost) => (
                    <PinBox3 post={savedPost.post} key={savedPost.id} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-10 flex-grow text-center animate-fade-in">
                  <Bookmark className="h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Posts Found
                  </h2>
                  <p className="text-gray-500 max-w-md">
                    Start saving some Posts to see them here. Explore new ideas
                    and save your favorites!
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === "pending" ? (
            <div className="w-full">
              {pendingPosts && pendingPosts.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-4 min-h-screen p-6">
                  {pendingPosts.map((post: IPost) => (
                    <div key={post.id} className="relative">
                      <PinBox3 post={post} noRedirect />
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Pending Review
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-10 flex-grow text-center animate-fade-in">
                  <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">⏳</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Pending Posts
                  </h2>
                  <p className="text-gray-500 max-w-md">
                    Posts awaiting approval will appear here. Once approved,
                    they'll move to your Created tab.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full">
              {rejectedPosts && rejectedPosts.length > 0 ? (
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 space-y-4 min-h-screen p-6">
                  {rejectedPosts.map((post: IPost) => (
                    <div key={post.id} className="relative group">
                      <PinBox3 post={post} noRedirect />
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          onClick={() => handleDeletePost(post.id)}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 h-8 w-8"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-10 flex-grow text-center animate-fade-in">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    No Rejected Posts
                  </h2>
                  <p className="text-gray-500 max-w-md">
                    Posts that don't meet our guidelines will appear here. You
                    can review and delete them.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
