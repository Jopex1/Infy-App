"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Baby, Bell, CircleUserRound, MessageSquareText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const check = () => {
      const notifs = JSON.parse(localStorage.getItem('infy_notifications') || '[]');
      const unread = notifs.filter(n => n.unread).length;
      setNotifCount(unread);
    };
    check();
    window.addEventListener('storage', check);
    const interval = setInterval(check, 1500);
    return () => {
      window.removeEventListener('storage', check);
      clearInterval(interval);
    };
  }, []);

  if (['/onboarding', '/login', '/signup'].includes(pathname)) return null;

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/kids', icon: Baby, label: 'Dashboard' },
    { path: '/chat', icon: MessageSquareText, label: 'Contact' },
    { path: '/notifications', icon: Bell, label: 'Notifications' },
    { path: '/profile', icon: CircleUserRound, label: 'Profile' },
  ];

  const activeIndex = navItems.findIndex(item => item.path === pathname);

  return (
    <nav
      className="bottom-nav-fixed fixed bottom-0 left-0 right-0 max-w-md mx-auto z-[100] bg-white border-t border-primary shadow-lg"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        transform: 'translateZ(0)',
      }}
      aria-label="Main navigation"
    >
      <div className="relative flex h-[72px]">
        {activeIndex >= 0 && (
          <div
            key={activeIndex}
            className="absolute top-0 h-full bg-primary nav-active-fade pointer-events-none"
            style={{ width: '20%', left: `${activeIndex * 20}%` }}
          />
        )}

        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              href={item.path}
              key={item.path}
              style={{ width: '20%' }}
              className={`relative z-10 flex flex-col items-center justify-center gap-1 ${isActive ? 'text-white' : 'text-primary'}`}
            >
              <div className="relative">
                <item.icon size={26} strokeWidth={isActive ? 2 : 1.5} />
                {item.label === 'Notifications' && notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-[#f7e03c] text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center px-1 border border-white">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-normal leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
