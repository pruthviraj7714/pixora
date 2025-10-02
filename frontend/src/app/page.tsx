import { FocusCardsComponent } from "@/components/FocusCards";
import { Button } from "@/components/ui/button";
import { Grid, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      <header className="mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="">
          <div className="text-2xl font-extrabold">
            <span className="text-orange-400">
              Interest
              <span className="text-pink-400">Gallery</span>
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href={"/signup"}>
            <Button className="bg-pink-500 hover:bg-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Sign Up
            </Button>
          </Link>
          <Link href={"/signin"}>
            <Button className="bg-pink-500 hover:bg-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="relative w-full h-[440px] flex items-center justify-center">
          <Image
            src="https://images.pexels.com/photos/1485894/pexels-photo-1485894.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Background"
            fill
            className="absolute inset-0 w-full h-full object-cover z-0"
          />

          <div className="absolute inset-0 bg-black opacity-60 z-10"></div>

          <div className="relative z-20 text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Discover and Collect Your Interests
            </h1>
            <p className="text-xl mb-8 animate-fade-in text-gray-300">
              Explore, save, and share ideas that inspire you.
            </p>
            <Link href={"/signin"}>
              <Button
                size="lg"
                className="bg-pink-500 rounded-xl hover:bg-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">
            Why Choose InterestGallery?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Grid className="w-12 h-12 text-purple-600" />,
                title: "Organize Your Ideas",
                description:
                  "Create boards and collections to keep your interests neatly arranged.",
              },
              {
                icon: <Heart className="w-12 h-12 text-purple-600" />,
                title: "Discover New Passions",
                description:
                  "Explore a vast array of topics and find new things you love.",
              },
              {
                icon: <Share2 className="w-12 h-12 text-purple-600" />,
                title: "Share with Friends",
                description:
                  "Collaborate on boards and share your discoveries with others.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-purple-50"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <FocusCardsComponent />

        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Ready to Start Your Collection?
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            Join InterestGallery today and start curating your digital
            inspiration board.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Join Now
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}