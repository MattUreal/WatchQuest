import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LibraryProvider } from '@/lib/library';
import Navbar from '@/components/Navbar';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import ConnectivityBanner from '@/components/ConnectivityBanner';

export const metadata = { title: 'WatchQuest', description: 'Discover and track movies & TV shows' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LibraryProvider>
            <AnnouncementBanner />
            <Navbar />
            <ConnectivityBanner />
            <main className="container">{children}</main>
          </LibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
