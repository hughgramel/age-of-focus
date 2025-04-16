import Link from 'next/link';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#0B1423]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#FFD700] mb-8">Age of Focus</h1>
          <div className="space-y-4">
            <Link
              href="/signin"
              className="px-6 py-3 bg-[#FFD700] text-[#0B1423] rounded-md hover:bg-[#E5C100] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD700] block font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#162033] text-white rounded-md hover:bg-[#1C2942] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#162033] block font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
