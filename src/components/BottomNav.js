"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Baby, Bell, CircleUserRound, MessageSquareText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  if (['/onboarding', '/login', '/signup'].includes(pathname)) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/kids', icon: Baby, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquareText, label: 'Contact' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: CircleUserRound, label: 'Profile' },
  ];

  const activeIndex = navItems.findIndex(item => item.path === pathname);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-primary shadow-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="relative flex h-[72px]">
        {/* Sliding active background */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-0 h-full bg-primary transition-all duration-300 ease-in-out pointer-events-none"
            style={{ width: '20%', left: `${activeIndex * 20}%` }}
          />
        )}

        {navItems.map((item, i) => {
          const isActive = pathname === item.path;
          return (
            <Link
              href={item.path}
              key={item.path}
              style={{ width: '20%' }}
              className={`relative z-10 flex flex-col items-center justify-center gap-1 ${isActive ? 'text-white' : 'text-primary'}`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
