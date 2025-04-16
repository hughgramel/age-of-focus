import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Age of Focus</h1>
        <div className="space-y-4">
          <Link
            href="/signin"
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 block"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 block"
          >
            Dashboard
          </Link>
        </div>
        
      </div>
    </div>
  );
}
