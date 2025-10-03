"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, LucideLoader } from "lucide-react";
import { BACKEND_URL } from "@/lib/config";

const formSchema = z.object({
  firstname: z
    .string()
    .min(3, { message: "First Name must be at least 3 characters" }),
  lastname: z
    .string()
    .min(3, { message: "Last Name must be at least 3 characters" }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({ message: "Email should be valid" }),
});

export default function EditProfilePage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
    },
  });

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      form.reset(res.data);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/user/edit-profile", values);
      toast.success(res.data.message);
      router.push(`/${session?.user.username}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserInfo();
    }
  }, [status]);

  if (isLoading || status === "loading") {
    return (
      <div className="flex flex-col justify-center items-center h-[690px] space-y-4 p-6">
        <div>
          <LucideLoader size={35} className="text-pink-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[690px] flex flex-col justify-center items-center">
      <Card className="w-[440px] space-y-2 p-4 mt-7">
        <CardTitle className="font-bold text-xl">Edit profile</CardTitle>
        <CardDescription className="text-md">
          Keep your personal details private. Information you add here is
          visible to anyone who can view your profile.
        </CardDescription>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 items-center">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Firstname</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter firstname here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lastname</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter lastname here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-1">
                    Submitting... <Loader2 className="animate-spin" />
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
