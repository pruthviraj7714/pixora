"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, Bell, BellOff, Image, User } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { INotification } from "@/types/notification";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { data, status } = useSession();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status, data]);

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `${BACKEND_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${data?.accessToken}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin h-10 w-10 text-pink-500" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-pink-600" />
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-pink-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <BellOff className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-xl font-medium text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-2">
            You'll see updates about your media submissions here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.read && markAsRead(notif.id)}
              className={`rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer ${
                notif.read
                  ? "bg-white border border-gray-200"
                  : "bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-300"
              }`}
            >
              <div className="p-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {notif.type === "MEDIA_APPROVED" ? (
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="text-green-600 w-7 h-7" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <XCircle className="text-red-600 w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className={`text-base font-semibold ${
                          notif.type === "MEDIA_APPROVED"
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {notif.type === "MEDIA_APPROVED"
                          ? "✓ Media Approved"
                          : "✗ Media Rejected"}
                      </h3>
                      {!notif.read && (
                        <span className="flex-shrink-0 w-2.5 h-2.5 bg-pink-500 rounded-full"></span>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3">
                      {notif.message || 
                        (notif.type === "MEDIA_APPROVED"
                          ? "Your media has been approved and is now visible to everyone."
                          : "Your media submission did not meet our guidelines.")}
                    </p>

                    <div className="bg-gray-50 rounded-md p-3 mb-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {notif.mediaTitle || "Untitled Media"}
                        </span>
                      </div>
                      {notif.mediaUrl && (
                        <img
                          src={notif.mediaUrl}
                          alt={notif.mediaTitle}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>By {notif.user?.username || "Admin"}</span>
                      </div>
                      <span>•</span>
                      <span>
                        {new Date(notif.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {notif.postId && (
                        <>
                          <span>•</span>
                          <a
                            href={`/post/${notif.postId}`}
                            className="text-pink-600 hover:text-pink-700 font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Post →
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}