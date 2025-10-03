import { IPost } from "@/types/post";
import Link from "next/link";

export default function PinBox3({ post, noRedirect }: { post: IPost, noRedirect?: boolean }) {
  const content = (
    <>
      <div className="aspect-w-1 aspect-h-1">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-4 bottom-4 translate-y-4 transform space-y-3 transition-all duration-300 ease-in-out group-hover:translate-y-0">
        <h3 className="text-lg font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {post.title}
        </h3>
      </div>
    </>
  );

  if (noRedirect) {
    return (
      <div className="group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
        <div className="block cursor-default">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
      <Link href={`/post/${post.id}`} className="block">
        {content}
      </Link>
    </div>
  );
}