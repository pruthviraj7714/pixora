import PostPageComponent from "@/components/PostPageComponent";

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const postId = (await params).postId;

  return <PostPageComponent postId={postId} />;
}
