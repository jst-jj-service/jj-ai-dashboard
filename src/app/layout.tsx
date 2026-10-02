import './globals.css';
import { AuthProvider } from '../lib/auth-context';

export const metadata = {
  title: 'AI Gateway & Membership Portal',
  description: 'Manage API keys, redeem token CDKs, and monitor AI usage',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-slate-100 min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
