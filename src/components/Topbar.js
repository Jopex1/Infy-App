"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Star, Settings, Moon, Sun, Shield, Lock, Home, LogOut, UserMinus, ChevronRight, Bell, Baby, LineChart, Activity, History, Trophy, Globe, FileText, Database, HelpCircle, MessageCircle, User, UserCog, BellRing, Syringe, ChevronDown, ChevronUp, LayoutDashboard } from "lucide-react";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnread = () => {
      const notifs = JSON.parse(localStorage.getItem("infy_notifications") || "[]");
      setHasUnread(notifs.some(n => n.unread));
    };
    checkUnread();
    window.addEventListener("storage", checkUnread);
    // Also interval to catch changes in same window without storage event if needed, but storage event is good across tabs.
    // We'll use a small interval just to be safe for same-window updates.
    const interval = setInterval(checkUnread, 2000);
    return () => {
      window.removeEventListener("storage", checkUnread);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname === "/onboarding" || pathname === "/login" || pathname === "/signup") return null;

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/home': return 'Home';
      case '/kids': return 'Dashboard';
      case '/chat': return 'Contact';
      case '/notifications': return 'Notifications';
      case '/profile': return 'Profile';
      case '/learn-more': return 'Learn More';
      case '/privacy': return 'Privacy & Security';
      case '/terms': return 'Terms & Conditions';
      case '/manage-account': return 'Manage Account';
      default: 
        if (pathname?.startsWith('/profile/edit')) return 'Edit Baby';
        return '';
    }
  };

  const menuSections = [
    {
      title: "Child Profile",
      icon: <Baby size={20}/>,
      items: [
        { label: "Dashboard", action: () => { setMenuOpen(false); router.push("/kids"); } },
        { label: "Child Information", action: () => { setMenuOpen(false); router.push("/profile"); } },
        { label: "Growth History", action: () => { setMenuOpen(false); router.push("/kids"); } },
      ]
    },
    {
      title: "Settings",
      icon: <Settings size={20}/>,
      items: [
        { label: darkMode ? "Light Mode" : "Dark Mode", action: toggleDark },
        { label: "Language", action: () => { setMenuOpen(false); } },
        { label: "Notification Settings", action: () => { setMenuOpen(false); router.push("/notifications"); } },
        { label: "Reminder Preferences", action: () => { setMenuOpen(false); } },
      ]
    },
    {
      title: "Privacy & Security",
      icon: <Shield size={20}/>,
      items: [
        { label: "Privacy Policy", action: () => { setMenuOpen(false); router.push("/privacy"); } },
        { label: "Terms & Conditions", action: () => { setMenuOpen(false); router.push("/terms"); } },
        { label: "Change Password", action: () => { setMenuOpen(false); } },
      ]
    },
    {
      title: "Help & Support",
      icon: <HelpCircle size={20}/>,
      items: [
        { label: "Contact Support", action: () => { setMenuOpen(false); window.location.href = "mailto:infysupport5@gmail.com?subject=Support%20Request"; } },
        { label: "Send Feedback", action: () => { setMenuOpen(false); window.location.href = "mailto:infysupport5@gmail.com?subject=App%20Feedback"; } },
      ]
    },
    {
      title: "Account",
      icon: <User size={20}/>,
      items: [
        { label: "Profile Information", action: () => { setMenuOpen(false); router.push("/profile"); } },
        { label: "Manage Account", action: () => { setMenuOpen(false); router.push("/manage-account"); } },
        { label: "Delete Account", action: () => { setMenuOpen(false); setDeleteDialog(true); } },
      ]
    },
    {
      title: "Notifications",
      badge: hasUnread ? (JSON.parse(localStorage.getItem('infy_notifications') || '[]').filter(n => n.unread).length) : 0,
      icon: (
        <div className="relative">
          <Bell size={20}/>
          {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#f7e03c] rounded-full"></span>}
        </div>
      ),
      items: [
        { label: "View Notifications", action: () => { setMenuOpen(false); router.push("/notifications"); } },
        { label: "Clear Notifications", action: () => { 
          localStorage.removeItem("infy_notifications"); 
          localStorage.removeItem("infy_watchlist"); 
          setHasUnread(false);
          setMenuOpen(false); 
          router.push("/notifications");
        }},
      ]
    },
    {
      title: "Logout",
      icon: <LogOut size={20}/>,
      action: () => { setMenuOpen(false); setLogoutDialog(true); }
    }
  ];

  const handleLogoClick = () => {
    if (pathname === '/home') return;
    router.back();
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#027027] text-white flex justify-between items-center shadow-md rounded-b-[1.5rem]"
        style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', paddingBottom: '1rem', paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        <button type="button" onClick={handleLogoClick} className="relative w-28 h-9 flex items-center z-10 cursor-pointer">
          <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy Logo" fill sizes="112px" className="object-contain object-left" priority />
        </button>
        
        <div className="absolute left-1/2 -translate-x-1/2 font-medium text-lg mt-[calc(env(safe-area-inset-top)/2)]">
          {getPageTitle()}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 bg-white/10 rounded-xl transition hover:bg-white/20 z-10 relative">
          {menuOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </header>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-4/5 max-w-sm flex pointer-events-auto bg-white dark:bg-gray-900 animate-in slide-in-from-right duration-300 flex-col shadow-2xl overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-5">
               <Image src="/icons/infy_wordmark_mono_1.png" alt="Infy Watermark" width={250} height={250} style={{width: 'auto', height: 'auto'}} className="object-contain" />
            </div>

            <div
              className="flex justify-between items-center shadow-md relative z-10 bg-[#027027] text-white"
              style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))', paddingBottom: '1.25rem', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
            >
              <span className="font-black text-2xl pl-2">MENU</span>
              <button onClick={() => setMenuOpen(false)} className="bg-white/20 p-2 rounded-2xl active:scale-95 transition"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto relative z-10 pt-4 pb-8 safe-pb">
              
              <div className="flex flex-col px-2">
                {menuSections.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <button
                      onClick={() => section.action ? section.action() : setExpandedSection(expandedSection === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-xl"
                    >
                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <div className="text-[#027027]">{section.icon}</div>
                        <span className="font-normal text-[15px]">{section.title}</span>
                      </div>
                      {!section.action && (expandedSection === idx ? <ChevronUp size={18} className="text-gray-400 dark:text-gray-500" /> : <ChevronDown size={18} className="text-gray-400 dark:text-gray-500" />)}
                    </button>
                    {!section.action && expandedSection === idx && section.items && (
                      <div className="pl-11 pr-4 pb-3 space-y-1 animate-in fade-in duration-200">
                        {section.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={item.action}
                            className="w-full text-left py-2.5 text-sm text-gray-500 dark:text-gray-400 font-medium hover:text-[#027027] dark:hover:text-[#027027] transition"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Account Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We're sorry to see you go. Please let us know why you are leaving (optional):</p>
            
            <div className="space-y-2 mb-6">
              {["App is hard to use", "Don't need it anymore", "Found a better alternative", "Privacy concerns", "Other"].map((r, i) => (
                <label key={i} className="flex items-center gap-3 p-3 border dark:border-gray-800 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <input type="radio" name="delete_reason" value={r} checked={deleteReason === r} onChange={() => setDeleteReason(r)} className="w-4 h-4 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{r}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setDeleteDialog(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl active:scale-95 transition text-sm">Cancel</button>
              <button onClick={async () => {
                setDeleteDialog(false);
                localStorage.removeItem("infy_user");
                localStorage.removeItem("infy_kids");
                try {
                  const { auth, signOut } = await import('@/lib/firebase');
                  await signOut(auth);
                } catch (e) {}
                router.push("/onboarding");
              }} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl active:scale-95 transition text-sm shadow-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Dialog */}
      {logoutDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Log Out</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button onClick={() => setLogoutDialog(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl active:scale-95 transition text-sm">Cancel</button>
              <button onClick={async () => {
                setLogoutDialog(false);
                localStorage.removeItem("infy_user");
                try {
                  const { auth, signOut } = await import('@/lib/firebase');
                  await signOut(auth);
                } catch (e) {}
                router.push("/onboarding");
              }} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl active:scale-95 transition text-sm shadow-sm">Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
