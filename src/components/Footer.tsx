'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B1423] border-t border-[#162033]">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-300">© 2024 Age of Focus. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-300 hover:text-white">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm text-gray-300 hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 