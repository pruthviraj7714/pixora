"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Loader2, LogOut, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
};

export default function Appbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setNotifications(res.data);
    } catch (error: any) {
      toast.error("Error while fetching notifications: ", error.message);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status]);

  return (
    <header className="bg-gradient-to-r from-pink-100 via-pink-200 to-pink-300 shadow-lg transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center h-20 px-6">
        <div className="flex items-center gap-6">
          <Link href="/home">
            <div className="text-2xl font-extrabold">
              <span className="text-orange-400">
                Pixo
                <span className="text-pink-400">ra</span>
              </span>
            </div>
          </Link>
          <Button
            onClick={() => router.push("/create")}
            variant="outline"
            className="bg-white hover:bg-pink-50 text-pink-600 border-pink-300 hover:border-pink-400 transition-all duration-300 ease-in-out hover:shadow-lg rounded-full"
          >
            <PlusCircle className="w-5 h-5 mr-2 transition-transform duration-300 ease-in-out group-hover:rotate-90" />
            Create
          </Button>
        </div>

        <div className="flex gap-4 items-center mr-5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative h-10 w-10 rounded-full border-2 bg-white border-gray-200 hover:border-black flex justify-center items-center">
                <Bell className="w-5 h-5 text-pink-600" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-white shadow-lg rounded-lg border border-pink-300">
              <DropdownMenuLabel className="font-semibold text-pink-600">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {notifications.length === 0 ? (
                <DropdownMenuItem className="text-gray-500">
                  No notifications yet
                </DropdownMenuItem>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`cursor-pointer flex flex-col items-start ${
                      notif.read ? "bg-white" : "bg-pink-50"
                    }`}
                  >
                    <span
                      className={`text-sm ${
                        notif.type === "MEDIA_APPROVED"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {notif.message}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <span className="h-10 w-10 rounded-full border-2 bg-white border-gray-200 hover:border-black flex justify-center items-center">
                <span className="font-bold text-lg">
                  {status === "loading" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    session?.user.username.charAt(0).toUpperCase()
                  )}
                </span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white shadow-lg rounded-lg border border-pink-300 w-[200px]">
              <DropdownMenuLabel className="font-semibold text-pink-600">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/${session?.user.username}`)}
                className="cursor-pointer text-md hover:bg-pink-100"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/saved-posts")}
                className="cursor-pointer text-md hover:bg-pink-100"
              >
                Saved Pins
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button className="ml-0.5 bg-pink-500 hover:bg-pink-600 text-white mt-2 w-full rounded-full transition-all duration-300 ease-in-out hover:shadow-lg">
                    <LogOut className="w-5 h-5 mr-2 transition-transform duration-300 ease-in-out group-hover:-translate-x-1" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to log out?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You will need to sign in again to access your account and
                      saved content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await signOut({ redirect: false });
                        router.push("/");
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
