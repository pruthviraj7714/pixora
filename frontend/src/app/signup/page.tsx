import SignupForm from "@/components/signup-form";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className="relative flex justify-center items-center min-h-screen">
      <Image
        src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        fill
      />

      <div className="absolute inset-0 bg-gradient-to-b from-pink-100 to-purple-100 opacity-40 z-10"></div>

      <div className="relative z-20 bg-white p-4 rounded-lg shadow-lg">
        <SignupForm />
      </div>
    </div>
  );
}