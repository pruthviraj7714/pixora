"use client";

import React, { useState, useEffect } from 'react';
import { Users, FileText, MessageSquare, TrendingUp, CheckCircle, Clock, Trash2, X, Check, IconNode } from 'lucide-react';
import { BACKEND_URL } from '@/lib/config';
import axios from 'axios'
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [usersData, setUsersData] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectMessage, setRejectMessage] = useState('');
  const { data } = useSession();

  useEffect(() => {
    if (data?.accessToken) {
      fetchData();
    }
  }, [activeTab, data?.accessToken]);

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
  
          const { data: allUsersData } = await axiosAuth.get("/admin/users/list");
          setAllUsers(allUsersData.users || []);
          break;
        }
  
        case "media": {
          const { data: media } = await axiosAuth.get("/admin/media");
          setMediaData(media);
  
          const { data: posts } = await axiosAuth.get("/admin/posts");
          setAllPosts(posts.posts || []);
          break;
        }
  
        case "approvals": {
          const { data: pending } = await axiosAuth.get("/admin/pending-approvals");
          setPendingPosts(pending);
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
  
  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axiosAuth.delete(`/admin/users/${userId}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
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

  const StatCard = ({ icon: Icon, title, value, subtitle, color } : {
    icon : IconNode,
    title : string,
    value  : string,
    subtitle : string,
    color : string
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8 border-b">
          {['overview', 'users', 'media', 'approvals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && dashboardData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={dashboardData.overview.totalUsers}
                color="bg-blue-500"
              />
              <StatCard
                icon={FileText}
                title="Total Posts"
                value={dashboardData.overview.totalPosts}
                subtitle={`${dashboardData.overview.approvedPosts} approved`}
                color="bg-green-500"
              />
              <StatCard
                icon={MessageSquare}
                title="Total Comments"
                value={dashboardData.overview.totalComments}
                color="bg-purple-500"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Likes"
                value={dashboardData.overview.totalLikes}
                color="bg-pink-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentPosts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {post.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.likes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

        {activeTab === 'users' && usersData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={usersData.totalUsers}
                color="bg-blue-500"
              />
              <StatCard
                icon={CheckCircle}
                title="Active Users"
                value={usersData.activeUsers}
                subtitle="Last 30 days"
                color="bg-green-500"
              />
              <StatCard
                icon={Users}
                title="Admins"
                value={usersData.adminCount}
                color="bg-purple-500"
              />
              <StatCard
                icon={Users}
                title="Regular Users"
                value={usersData.regularUsers}
                color="bg-gray-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user._count?.posts || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
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

        {activeTab === 'media' && mediaData && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                icon={FileText}
                title="Total Posts"
                value={mediaData.totalPosts}
                color="bg-blue-500"
              />
              <StatCard
                icon={CheckCircle}
                title="Approved"
                value={mediaData.approvedPosts}
                color="bg-green-500"
              />
              <StatCard
                icon={Clock}
                title="Pending"
                value={mediaData.pendingPosts}
                color="bg-yellow-500"
              />
              <StatCard
                icon={TrendingUp}
                title="Total Likes"
                value={mediaData.totalLikes}
                color="bg-pink-500"
              />
              <StatCard
                icon={MessageSquare}
                title="Total Comments"
                value={mediaData.totalComments}
                color="bg-purple-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Media</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Likes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allPosts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {post.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.user.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.likes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-900"
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

        {activeTab === 'approvals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingPosts.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                No pending approvals
              </div>
            ) : (
              pendingPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {post.mediaUrl && (
                    <img
                      src={post.mediaUrl}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{post.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded">{post.category}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(post.id)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center"
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
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Reject Post</h3>
            <p className="text-gray-600 mb-4">Provide a reason for rejection:</p>
            <textarea
              value={rejectMessage}
              onChange={(e) => setRejectMessage(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4 h-32"
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleReject(selectedPost.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setSelectedPost(null);
                  setRejectMessage('');
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