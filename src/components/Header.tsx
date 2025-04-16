'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: '🏠' },
  { name: 'Library', href: '/library', icon: '📚' },
  { name: 'Party', href: '/party', icon: '👥' },
  { name: 'Profile', href: '/profile', icon: '👤' },
  { name: 'Stack', href: '/stack', icon: '📋' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-[#0B1423]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-[#FFD700]">
                Age of Focus
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-10 sm:flex sm:space-x-10">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      inline-flex items-center px-3 text-base font-medium
                      ${isActive 
                        ? 'border-b-2 border-[#FFD700] text-[#FFD700]'
                        : 'border-b-2 border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-[#162033] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FFD700]"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-base font-medium
                  ${isActive
                    ? 'bg-[#162033] border-l-4 border-[#FFD700] text-[#FFD700]'
                    : 'border-l-4 border-transparent text-gray-300 hover:bg-[#162033] hover:border-gray-300 hover:text-white'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
} 