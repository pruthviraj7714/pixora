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
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

export default function Appbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/notifications/count`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        setNotificationCount(res.data.count);
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    if (status === "authenticated") {
      fetchNotifications();
    }

    const interval = setInterval(() => {
      if (status === "authenticated") {
        fetchNotifications;
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [status]);

  return (
    <header className="bg-gradient-to-r from-pink-100 via-pink-200 to-pink-300 shadow-md transition-all duration-300">
      <div className="flex justify-between items-center h-20 px-6">
        <div className="flex items-center gap-6">
          <Link href="/home">
            <div className="text-2xl font-extrabold cursor-pointer">
              <span className="text-orange-400">
                Pixo<span className="text-pink-400">ra</span>
              </span>
            </div>
          </Link>
          <Button
            onClick={() => router.push("/create")}
            variant="outline"
            className="bg-white hover:bg-pink-50 text-pink-600 border-pink-300 hover:border-pink-400 transition-all duration-300 hover:shadow-lg rounded-full"
          >
            <PlusCircle className="w-5 h-5 mr-2 transition-transform group-hover:rotate-90" />
            Create
          </Button>
        </div>

        <div className="flex gap-4 items-center mr-5">
          <button
            onClick={() => router.push("/notifications")}
            className="relative h-10 w-10 rounded-full border-2 bg-white border-gray-200 hover:border-pink-400 flex justify-center items-center transition-all duration-300 hover:shadow-md"
          >
            <Bell className="w-5 h-5 text-pink-600" />
              {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notificationCount}
              </span>
              )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 rounded-full border-2 bg-white border-gray-200 hover:border-pink-400 flex justify-center items-center transition-all duration-300 hover:shadow-md">
                <span className="font-bold text-lg">
                  {status === "loading" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    session?.user.username.charAt(0).toUpperCase()
                  )}
                </span>
              </button>
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
                <AlertDialogTrigger asChild>
                  <Button className="mt-2 w-full rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg">
                    <LogOut className="w-5 h-5" />
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
