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
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){try{var k='__dev_chunk_reload';function reloadOnce(){if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1');location.reload();}function isChunk(r){if(!r)return false;var m=typeof r==='string'?r:(r.message||'');var n=typeof r==='object'&&r.name?r.name:'';return n==='ChunkLoadError'||m.indexOf('Loading chunk')>-1;}window.addEventListener('error',function(e){if(isChunk(e.message))reloadOnce();},true);window.addEventListener('unhandledrejection',function(e){if(isChunk(e.reason))reloadOnce();});}catch(x){}})();`,
            }}
          />
        )}
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
