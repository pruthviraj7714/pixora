import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
            <div className="text-2xl font-extrabold cursor-pointer">
              <span className="text-orange-400">
                Pixo<span className="text-pink-400">ra</span>
              </span>
            </div>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Discover, collect, and share the things that inspire you. Build your digital inspiration board.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-pink-600 hover:text-pink-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7.63.75 7.63.75" />
                </svg>
              </a>
              <a href="#" className="text-pink-600 hover:text-pink-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    ry="5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37Z" fill="currentColor" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="text-pink-600 hover:text-pink-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#features" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Security
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Stay Updated</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get the latest features and inspiration delivered to your inbox.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-2 rounded-lg border border-purple-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-purple-200 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© {currentYear} Pixora. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-600 hover:text-pink-500 transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
