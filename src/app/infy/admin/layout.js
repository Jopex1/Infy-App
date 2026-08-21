export default function AdminLayout({ children }) {
  // We use a custom layout for admin to remove the standard mobile app constraints, Topbar, and BottomNav
  // But we still wrap it in a max-w-md if we want it to look like the app, 
  // or we can make it full screen since it's a dashboard (user requested "bootstrap for both laptop and mobile").
  // So we'll make it responsive (full width on desktop, padding on mobile).
  
  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 overflow-y-auto w-full h-full text-gray-900" style={{ margin: 0, padding: 0, maxWidth: '100%' }}>
      {children}
    </div>
  );
}
