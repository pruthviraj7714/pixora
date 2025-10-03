"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import { useSession } from "next-auth/react";

export default function CreatePost() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [currFile, setCurrFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data } = useSession();
  const router = useRouter();

  const uploadImageToCloudinary = async ({ file }: { file: File }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${BACKEND_URL}/cloudinary/upload`, formData, {
        headers: {
          Authorization : `Bearer ${data?.accessToken}`,
        },
      });
      return response.data.result.url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Image upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async () => {
    setIsUploading(true);
    const file = currFile;
    if (!file) {
      toast.info("Please select an image to upload!");
      setIsUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const imgUrl = await uploadImageToCloudinary({ file });

    if (!imgUrl) {
      setIsUploading(false);
      toast.error("Failed to upload image");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/posts/create`, {
        image: imgUrl,
        title,
        description,
        category,
      }, {
        headers : {
          Authorization : `Bearer ${data?.accessToken}`
        }
      });
      toast.success("Post successfully Added");
      router.push("/home");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to Post the media");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-5xl h-full md:h-[700px]">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Create a New Post
        </h1>
        <div className="flex flex-col md:flex-row md:space-x-8 space-y-6 md:space-y-0">
          <div className="md:w-1/2 w-full">
            <Label
              htmlFor="image-upload"
              className="block text-sm font-semibold text-gray-600 mb-2"
            >
              Upload Image
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target?.files ? e.target.files[0] : null;
                if (file) {
                  setCurrFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[450px] object-contain rounded-lg"
                />
              </div>
            )}
          </div>
          <div className="md:w-1/2 w-full flex flex-col space-y-4">
            <div>
              <Label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Title
              </Label>
              <Input
                id="title"
                type="text"
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add your title"
                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-violet-500 transition duration-200"
              />
            </div>
            <div>
              <Label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Description
              </Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell everyone what your Post is about"
                className="rounded-lg border-gray-300 focus:ring-2 focus:ring-violet-500 transition duration-200"
              />
            </div>
            <div>
              <Label
                htmlFor="category"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Category
              </Label>
              <Select onValueChange={(value) => setCategory(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleImageUpload}
              disabled={isUploading}
              className={`bg-red-500 hover:bg-red-600 ${
                isUploading ? "text-white animate-pulse" : "text-white"
              } font-bold py-2 px-4 rounded-full transition duration-200`}
            >
              {isUploading ? "Uploading..." : "Add Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}