import Topbar from "@/components/Topbar";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Infy - Baby Tracker",
  description: "Track child birth growth and childcare tips.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Topbar />
        <main className="max-w-md mx-auto min-h-screen bg-background relative shadow-xl overflow-hidden sm:border-x border-gray-200">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
