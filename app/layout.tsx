import type { Metadata } from 'next';
import { Instrument_Serif, JetBrains_Mono, Inter_Tight } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hermes · studio',
  description:
    'Literary control plane for the Hermes agent runtime. Fleet of profiles, shared surfaces, mission control.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${instrumentSerif.variable} ${jetbrainsMono.variable} ${interTight.variable} h-full antialiased`}
        style={{ background: '#0A0A0E', color: '#e8e8e3' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}