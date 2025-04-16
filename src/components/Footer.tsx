import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2024 Age of Focus. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm hover:text-gray-300">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm hover:text-gray-300">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 