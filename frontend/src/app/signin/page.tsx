import LogInForm from "@/components/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="relative flex justify-center items-center min-h-screen">
      <Image
        src="https://images.pexels.com/photos/354939/pexels-photo-354939.jpeg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        fill
      />

      <div className="absolute inset-0 bg-gradient-to-b from-pink-100 to-purple-100 opacity-40 z-10"></div>

      <div className="relative z-20 bg-white p-4 rounded-lg shadow-lg">
        <LogInForm />
      </div>
    </div>
  );
}