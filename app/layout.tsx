import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/AppContext';
import DevChunkRecovery from '@/components/DevChunkRecovery';
import SiteChrome from '@/components/SiteChrome';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HappySmart Studio | Architecture & Interior Design',
  description: 'Mobile-First architecture firm website',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname==='/edit')return;document.documentElement.classList.add('cinematic-lock');window.__cinematicLockFailsafe=window.setTimeout(function(){document.documentElement.classList.remove('cinematic-lock');window.__cinematicLockFailsafe=undefined;},8000);}catch(e){document.documentElement.classList.remove('cinematic-lock');}})();`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-100 text-black min-h-screen font-sans antialiased`} suppressHydrationWarning>
        <DevChunkRecovery />
        <AppProvider>
          <SiteChrome>{children}</SiteChrome>
        </AppProvider>
      </body>
    </html>
  );
}
