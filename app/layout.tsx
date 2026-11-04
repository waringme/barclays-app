import type { Metadata } from 'next';
import './globals.css';
import './banking.css';

export const metadata: Metadata = {
  title: 'Barclays | Your everyday, made easier — demo',
  description:
    'An independent Barclays-branded mobile banking demo. All balances and activity are fictional. No real banking services.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
