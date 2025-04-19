'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: '🏠' },
  { name: 'Statistics', href: '/statistics', icon: '📚' },
  { name: 'Profile', href: '/profile', icon: '👤' },
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
          <div className="flex items-center justify-center h-16 sm:h-16 lg:h-20 flex-nowrap">
            {/* Logo (Left) */}
            <div className="flex-shrink-0 mr-4 lg:mr-8 absolute left-4 sm:left-6 lg:left-12">
              <Link href="/dashboard" className="font-bold text-[#FFD700] hover:text-[#E5C063] transition-colors duration-200 whitespace-nowrap historical-game-title flex items-baseline">
                <span className="text-4xl sm:text-5xl">Age</span>
                <span className="text-3xl sm:text-4xl mx-1.5">of</span>
                <span className="text-4xl sm:text-5xl">Focus</span>
              </Link>
            </div>

            {/* Navigation Links (Center) - Medium and Large Screens */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center sm:space-x-4 lg:space-x-10 flex-nowrap">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        relative px-2 sm:px-3 lg:px-4 py-5 text-base sm:text-lg lg:text-xl font-medium transition-colors duration-200 flex items-center whitespace-nowrap historical-game-title
                        ${isActive 
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white'
                        }
                        group tracking-wide
                      `}
                    >
                      <span className="mr-1 sm:mr-2 lg:mr-3 text-xl lg:text-2xl">{item.icon}</span>
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
                  flex flex-col items-center justify-center px-3 py-3 
                  ${isActive 
                    ? 'text-white'
                    : 'text-gray-400 hover:text-gray-100'
                  }
                  transition-colors duration-200 font-lora
                `}
              >
                <span className="text-2xl mb-1">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Bar with title only */}
      <header className="bg-transparent sm:hidden z-50 relative">
        <div className="flex items-center justify-center h-16 px-4">
          <Link href="/dashboard" className="font-bold text-[#FFD700] historical-game-title flex items-baseline">
            <span className="text-3xl">Age</span>
            <span className="text-2xl mx-2">of</span>
            <span className="text-3xl">Focus</span>
          </Link>
        </div>
      </header>
      
      {/* Add padding to the bottom of the page on mobile to account for fixed navigation */}
      <div className="sm:hidden h-16"></div>
    </>
  );
} 