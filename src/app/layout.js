import Topbar from "@/components/Topbar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Infy - Baby Tracker",
  description: "Track child birth growth and childcare tips.",
  icons: {
    icon: "/images/infy-app-icon.jpg",
    apple: "/images/infy-app-icon.jpg",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#027027",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Topbar />
        <main 
          className="max-w-md mx-auto min-h-screen bg-background relative shadow-xl sm:border-x border-gray-200"

          style={{ 
            paddingTop: 'calc(4.5rem + env(safe-area-inset-top, 0px))', 
            paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' 
          }}
        >
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
