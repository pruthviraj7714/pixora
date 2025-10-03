import ProfilePageComponent from "@/components/ProfilePageComponent";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  const username = (await params).username;

  return <ProfilePageComponent username={username} />;
}
