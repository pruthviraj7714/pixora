"use client";

import React, { useState, useEffect, FC } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Clock,
  Trash2,
  X,
  Check,
  LucideIcon,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/config";
import axios from "axios";
import { signOut, useSession } from "next-auth/react";
import { IPost } from "@/types/post";
import {
  IAdminDashboardData,
  IAdminMedia,
  IReportsData,
  IUser,
  IUsersData,
} from "@/types/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type TAB = "overview" | "users" | "media" | "approvals" | "reports";

interface StatCardProps {
  icon?: LucideIcon; 
  title: string;
  value: string | number;
  subtitle?: string;
  color: string; 
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TAB>("overview");
  const [dashboardData, setDashboardData] =
    useState<IAdminDashboardData | null>(null);
  const [usersData, setUsersData] = useState<IUsersData | null>(null);
  const [mediaData, setMediaData] = useState<IAdminMedia | null>(null);
  const [reportsData, setReportsData] = useState<IReportsData[] | null>(null);
  const [pendingPosts, setPendingPosts] = useState<IPost[]>([]);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [allPosts, setAllPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<IPost | null>(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [imageModal, setImageModal] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [isMediaRemoveModelOpen, setIsMediaRemoveModelOpen] = useState(false);
  const [postToRemove, setPostToRemove] = useState<{
    postId : string,
    reportId : string
  } | null>(null);
  const [messageForRemovingPost, setMessageForRemovingPost] = useState<string>("");
  const [reportFilter, setReportFilter] = useState("pending");
  const [pendingReportsCount, setPendingReportsCount] = useState<number>(0);
  const { data, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [activeTab, status]);

  const axiosAuth = axios.create({
    baseURL: BACKEND_URL,
    headers: {
      Authorization: `Bearer ${data?.accessToken}`,
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "overview": {
          const { data: dashboard } = await axiosAuth.get("/admin/");
          setDashboardData(dashboard);
          break;
        }

        case "users": {
          const { data: users } = await axiosAuth.get("/admin/users");
          setUsersData(users);

          const { data: allUsersData } = await axiosAuth.get(
            "/admin/users/list"
          );
          setAllUsers(allUsersData.users || []);
          break;
        }

        case "media": {
          const { data: media } = await axiosAuth.get("/admin/media");
          setMediaData(media);

          const { data: posts } = await axiosAuth.get("/admin/media/list");
          setAllPosts(posts.posts || []);
          break;
        }

        case "approvals": {
          const { data: pending } = await axiosAuth.get(
            "/admin/pending-approvals"
          );
          setPendingPosts(pending);
          break;
        }

        case "reports": {
          const { data: reports } = await axiosAuth.get(
            "/admin/reports"
          );
          setReportsData(reports);
          setPendingReportsCount(reports.filter((r : IReportsData) => r.status === "PENDING").length)
          break;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  const handleApprove = async (postId: string) => {
    try {
      await axiosAuth.put(`/admin/posts/${postId}/approve`);
      fetchData();
      setSelectedPost(null);
    } catch (error) {
      console.error("Error approving post:", error);
    }
  };

  const handleReject = async (postId: string) => {
    try {
      await axiosAuth.put(`/admin/posts/${postId}/reject`, {
        message: rejectMessage,
      });
      fetchData();
      setSelectedPost(null);
      setRejectMessage("");
    } catch (error) {
      console.error("Error rejecting post:", error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await axiosAuth.delete(`/admin/posts/${postId}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleRemoveReportedPost = async (reportId: string) => {
    try {
      await axiosAuth.put(`/admin/remove-reported-post/${reportId}`, {
        postId: postToRemove?.postId,
        message: messageForRemovingPost,
      });

      toast.info("Post Successfully Removed", { position: "top-center" });
      setIsMediaRemoveModelOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Error while removing Post");
      console.error("Error removing post:", error);
    }
  };

  const handleMarkPostAsReviewed = async (reportId: string) => {
    try {
      await axiosAuth.patch(`/admin/report/mark-reviewed/${reportId}`);

      fetchData();
      toast.success("Report Successfully Marked As Reviewed");
    } catch (error) {
      toast.error("Error while Marking Post As Reviewed", {
        position: "top-center",
      });
    }
  };

  const StatCard: FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className={`p-5 rounded-2xl shadow-lg bg-gradient-to-r ${color} text-white`}>
      <div className="flex items-center gap-3 mb-4">
        {Icon && <Icon className="w-8 h-8 opacity-80" />}
        <h4 className="text-lg font-semibold">{title}</h4>
      </div>
  
      <p className="text-4xl font-extrabold leading-tight">{value}</p>
  
      {subtitle && (
        <p className="text-sm opacity-80 mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  );
  
  if (loading && !dashboardData && !usersData && !mediaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage content, users, and platform activity</p>
            </div>
            <Button
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
              onClick={async () => await signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8 bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 w-fit">
          {["overview", "users", "media", "approvals", "reports"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as TAB)}
              className={`px-4 py-2 font-medium capitalize rounded-md transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && dashboardData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={dashboardData.overview.totalUsers}
                color="from-blue-600 to-blue-500"
              />
              <StatCard
                icon={FileText}
                title="Total Posts"
                value={dashboardData.overview.totalPosts}
                subtitle={`${dashboardData.overview.approvedPosts} approved`}
                color="from-emerald-600 to-emerald-500"
              />
              <StatCard
                icon={MessageSquare}
                title="Total Comments"
                value={dashboardData.overview.totalComments}
                color="from-purple-600 to-purple-500"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Likes"
                value={dashboardData.overview.totalLikes}
                color="from-pink-600 to-pink-500"
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
                <h2 className="text-xl font-semibold text-white">Recent Posts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/50">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Likes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {dashboardData.recentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {post.image ? (
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition shadow-md"
                              onClick={() =>
                                setImageModal({
                                  url: post.image,
                                  title: post.title,
                                })
                              }
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">{post.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{post.user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              post.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : post.status === "PENDING"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{post._count.likedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && usersData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={usersData.totalUsers}
                color="from-blue-600 to-blue-500"
              />
              <StatCard
                icon={CheckCircle}
                title="Active Users"
                value={usersData.activeUsers}
                subtitle="Last 30 days"
                color="from-emerald-600 to-emerald-500"
              />
              <StatCard
                icon={Users}
                title="Admins"
                value={usersData.adminCount}
                color="from-purple-600 to-purple-500"
              />
              <StatCard
                icon={Users}
                title="Regular Users"
                value={usersData.regularUsers}
                color="from-slate-600 to-slate-500"
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
                <h2 className="text-xl font-semibold text-white">All Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/50">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Posts
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              user.role === "ADMIN"
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-slate-500/20 text-slate-300"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {user._count?.posts || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "media" && mediaData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                icon={FileText}
                title="Total Posts"
                value={mediaData.totalPosts}
                color="from-blue-600 to-blue-500"
              />
              <StatCard
                icon={CheckCircle}
                title="Approved"
                value={mediaData.approvedPosts}
                color="from-emerald-600 to-emerald-500"
              />
              <StatCard
                icon={Clock}
                title="Pending"
                value={mediaData.pendingPosts}
                color="from-yellow-600 to-yellow-500"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Likes"
                value={mediaData.totalLikes}
                color="from-pink-600 to-pink-500"
              />
              <StatCard
                icon={MessageSquare}
                title="Total Comments"
                value={mediaData.totalComments}
                color="from-purple-600 to-purple-500"
              />
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
                <h2 className="text-xl font-semibold text-white">All Media</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/50">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Likes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {allPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {post.image ? (
                            <img
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition shadow-md"
                              onClick={() =>
                                setImageModal({
                                  url: post.image,
                                  title: post.title,
                                })
                              }
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-slate-500" />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{post.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{post.user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{post.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              post.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : post.status === "PENDING"
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-red-500/20 text-red-300"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{post._count.likedBy}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            {pendingPosts.length === 0 ? (
              <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-lg">
                No pending approvals
              </div>
            ) : (
              pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg overflow-hidden hover:border-slate-600/50 transition-all"
                >
                  {post.image && (
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-auto object-contain"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-white mb-2">{post.title}</h3>
                    <p className="text-slate-400 text-sm mb-2">{post.description}</p>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <span className="bg-slate-700/50 px-2 py-1 rounded-md text-xs font-medium">{post.category}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-emerald-600 flex items-center justify-center transition-all shadow-md"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-600 flex items-center justify-center transition-all shadow-md"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

{activeTab === "reports" && (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/50">
      <h2 className="text-xl font-semibold text-white">Reports</h2>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setReportFilter("pending")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            reportFilter === "pending"
              ? "bg-yellow-500/90 text-black"
              : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70"
          }`}
        >
          Pending <span className="ml-1 text-xs bg-slate-900/40 text-yellow-300 px-2 py-0.5 rounded-md">{pendingReportsCount}</span>
        </button>
        <button
          onClick={() => setReportFilter("all")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            reportFilter === "all"
              ? "bg-blue-500/90 text-white"
              : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70"
          }`}
        >
          All <span className="ml-1 text-xs bg-slate-900/40 text-blue-300 px-2 py-0.5 rounded-md">{reportsData?.length}</span>
        </button>
      </div>
    </div>

    {!reportsData || (Array.isArray(reportsData) && reportsData.length === 0) ? (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-lg">
        {reportFilter === "pending" ? "No pending reports" : "No reports found"}
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-900/50">
          <tr>
  {[
    "Report ID",
    "Reported Media",
    "Reported Content",
    "Reported By",
    "Reason",
    "Date",
    "Status",
    ...(reportFilter === "PENDING" ? ["Actions"] : []),
  ].map((heading) => (
    <th
      key={heading}
      className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
    >
      {heading}
    </th>
  ))}
</tr>

          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {reportsData && reportsData.length > 0 && reportsData.filter((r) => reportFilter === "pending" ? r.status === "PENDING" : r.status === "REVIEWED").map((report: any) => (
              <tr
                key={report.id}
                className={`hover:bg-slate-700/30 transition-colors ${
                  report.reviewed ? "opacity-80" : ""
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  #{report.id?.slice(0, 8)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {report.post.image ? (
                    <img
                      src={report.post.image}
                      alt={report.post.title}
                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition shadow-md"
                      onClick={() =>
                        setImageModal({
                          url: report.post.image,
                          title: report.post.title,
                        })
                      }
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-slate-500" />
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-white">
                  <div className="max-w-xs truncate">{report.post?.title || "N/A"}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {report.reporter?.username || "Unknown"}
                </td>

                <td className="px-6 py-4 text-sm text-slate-400">
                  <div className="max-w-xs truncate">
                    {report.reason || "No reason provided"}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleDateString()
                    : "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {report.status === "REVIEWED" ? (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-600/30 text-green-300 border border-green-600/40">
                      Reviewed
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-600/30 text-yellow-300 border border-yellow-600/40">
                      Pending
                    </span>
                  )}
                </td>
                  {reportFilter === "pending" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.status === "PENDING" ? (
                        <div className="flex flex-col gap-y-1">
                          <button
                            onClick={() => handleMarkPostAsReviewed(report.id)}
                            className="text-white hover:bg-yellow-600 cursor-pointer bg-yellow-500 py-2 rounded-lg transition-colors text-xs font-medium"
                          >
                            Mark as Reviewed
                          </button>
                          <button
                            onClick={() => {
                              setPostToRemove({
                                postId: report.post.id,
                                reportId: report.id,
                              })
                              setIsMediaRemoveModelOpen(true)
                            }}
                            className="text-white hover:bg-red-700 cursor-pointer bg-red-600 py-2 rounded-lg transition-colors text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="text-slate-500 italic text-xs">No actions available</div>
                      )}
                    </td>
                  )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Reject Post</h3>
            <p className="text-slate-400 mb-4">Provide a reason for rejection:</p>
            <textarea
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 mb-4 h-32 text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none transition"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleReject(selectedPost.id)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-md"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setSelectedPost(null)
                  setRejectMessage("")
                }}
                className="flex-1 bg-slate-700 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/40 flex items-center justify-center z-50"
          onClick={() => setImageModal(null)}
        >
          <div
            className="relative bg-slate-800 border border-slate-700/50 rounded-xl p-4 max-w-[75vw] max-h-[75vh] mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white z-10 bg-slate-700/50 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imageModal.url || "/placeholder.svg"}
              alt={imageModal.title}
              className="max-w-full max-h-[calc(75vh-6rem)] w-auto h-auto object-contain rounded-lg"
            />
            <p className="text-center text-slate-300 mt-3 font-medium">{imageModal.title}</p>
          </div>
        </div>
      )}

      {isMediaRemoveModelOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Remove Post</h3>
            <p className="text-slate-400 mb-4">Provide a reason for removal:</p>
            <textarea
              value={messageForRemovingPost}
              onChange={(e) => setMessageForRemovingPost(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 mb-4 h-32 text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none transition"
              placeholder="Enter removal reason..."
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleRemoveReportedPost(postToRemove?.reportId!)}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-md"
              >
                Confirm Remove
              </button>
              <button
                onClick={() => {
                  setIsMediaRemoveModelOpen(false)
                  setMessageForRemovingPost("")
                }}
                className="flex-1 bg-slate-700 text-slate-200 px-4 py-2 rounded-lg hover:bg-slate-600 transition-all"
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
