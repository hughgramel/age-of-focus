'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Image from 'next/image';
import { useEffect } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent scrolling on authenticated pages
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen relative overflow-hidden bg-white">
        {/* Full-screen background with gradient overlay */}
        <div className="fixed inset-0 w-full h-full z-0">

          {/* I can decide this later.  */}

          {/* curr theme */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0B1423] via-[#1C2942] to-[#0B1423] opacity-90"></div> */}
          
          {/* richer blue theme */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0B1423] via-[#1C2942] to-[#0B1423] opacity-90"></div> */}

          {/* dark purple royal theme */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#13111C] via-[#20193A] to-[#13111C] opacity-90"></div> */}
          {/* warm golden brown theme */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#1C1408] via-[#2C2210] to-[#1C1408] opacity-40"></div> */}


          {/* I like this one it's dark */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#1C1408] via-[#2C2210] to-[#1C1408] opacity-0"></div> */}


          {/* dark charcoal theme */}


          {/* slate theme */}
          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#121517] via-[#23272B] to-[#121517] opacity-95"></div> */}

          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#131313] via-[#222222] to-[#131313] opacity-90"></div> */}


          {/* <div className="absolute inset-0 bg-gradient-to-br from-[#0E0E0E] via-[#1E1E1E] to-[#151515] opacity-95"></div> */}



          {/* <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#AAAAAA 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div> */}




          {/* emerald theme */}

          {/* black theme */}


          {/* main yellow color we use theme */}


          {/* dynamic theme */}
          {/* <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#FFD700 1.5px, transparent 1.5px), radial-gradient(#FFD700 0.5px, transparent 0.5px)', backgroundSize: '40px 40px, 20px 20px', backgroundPosition: '0 0, 20px 20px' }}></div> */}


          
          {/* Subtle pattern overlay */}
          {/* <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#FFD700 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div> */}
          
          {/* Optional: Keep the image but with much lower opacity */}



          {/* <Image 
            src="/backgrounds/civil_war_background.png" 
            alt="Background"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.15 }}
            priority
            quality={100}
          /> */}
          
          {/* Extra atmospheric elements */}
          {/* <div className="absolute inset-0 bg-gradient-to-t from-[#0B1423] via-transparent to-transparent opacity-90"></div> */}
        </div>

        {/* Header and content */}
        <div className="relative z-10 min-h-screen">
          <Header />
          <main className="h-[calc(100vh-5rem)] overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 