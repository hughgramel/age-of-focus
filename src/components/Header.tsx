'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: '🏠' },
  { name: 'Timer', href: '/timer', icon: '⏱️' },
  { name: 'Library', href: '/library', icon: '📚' },
  { name: 'Party', href: '/party', icon: '👥' },
  { name: 'Profile', href: '/profile', icon: '👤' },
  { name: 'Slack', href: '/stack', icon: '📋' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Top Header for medium and large screens */}
      <header className="bg-transparent hidden sm:block w-full z-50 relative">
        <nav className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-16 lg:h-20 flex-nowrap">
            {/* Logo (Far Left) - Hidden on small screens */}
            <div className="hidden lg:block flex-shrink-0 mr-4 lg:mr-8">
              <Link href="/dashboard" className="text-2xl sm:text-3xl font-bold text-[#FFD700] hover:text-[#E5C063] transition-colors duration-200 font-vollkorn tracking-wide whitespace-nowrap">
                Age of Focus
              </Link>
            </div>

            {/* Navigation Links (Center) - Medium and Large Screens */}
            <div className="flex items-center justify-center flex-grow overflow-hidden">
              <div className="flex items-center justify-center sm:space-x-4 lg:space-x-10 flex-nowrap">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative px-2 sm:px-2 lg:px-3 py-4 text-sm sm:text-sm lg:text-lg font-medium transition-colors duration-200 flex items-center whitespace-nowrap
                        ${isActive 
                          ? 'text-[#FFD700]'
                          : 'text-gray-300 hover:text-white'
                        }
                        group font-lora tracking-wide
                      `}
                    >
                      <span className="mr-1 sm:mr-1 lg:mr-2 text-lg lg:text-xl">{item.icon}</span>
                      <span className="sm:inline">{item.name}</span>
                      <span 
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD700] transform transition-all duration-300 ease-in-out
                          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`
                        }
                      ></span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side - Sign Out Button (Far Right) */}
            <div className="flex items-center ml-2 lg:ml-8 flex-shrink-0">
              <button
                onClick={handleSignOut}
                className="px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium text-[#FFD700] bg-transparent rounded border border-[#FFD700]/30 hover:bg-[#1C2942] transition-all duration-200 hover:border-[#FFD700]/60 font-lora tracking-wide hover:shadow-md whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Bottom Navigation Bar for mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0B1423]/80 backdrop-blur-sm border-t border-gray-800 z-50">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center px-2 py-2 
                  ${isActive 
                    ? 'text-[#FFD700]'
                    : 'text-gray-400 hover:text-gray-100'
                  }
                  transition-colors duration-200 font-lora
                `}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Bar with Sign Out */}
      <header className="bg-transparent sm:hidden z-50 relative">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="text-xl font-bold text-[#FFD700] font-vollkorn tracking-wide">
            Age of Focus
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-[#FFD700] bg-transparent rounded border border-[#FFD700]/30 font-lora tracking-wide"
          >
            Sign Out
          </button>
        </div>
      </header>
      
      {/* Add padding to the bottom of the page on mobile to account for fixed navigation */}
      <div className="sm:hidden h-16"></div>
    </>
  );
} 