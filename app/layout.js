// app/layout.js (o _app.js en versiones anteriores de Next.js)

import './globals.css';
import { ThemeProvider } from './components/ThemeProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
