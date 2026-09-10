import './globals.css';
import { AppProvider } from '../lib/store';
import Shell from '../components/Shell';

export const metadata = {
  title: 'Talent360',
  description: 'Talent360 — Develop, Engage, Retain. Stronger talent, greater tomorrows.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Talent360',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#7C1F3D',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  );
}
