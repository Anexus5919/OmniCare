import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata = {
  title: 'OmniCare - Smart Post-Discharge Recovery Companion',
  description: 'AI-powered post-discharge care platform for patients, caregivers, and doctors',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
