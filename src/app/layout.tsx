import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Lift Away - StrongLifts Tracker",
  description: "Track your StrongLifts 5x5 workouts plus pull-ups",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        {/* Subtle floating Vibez by Kretz badge */}
        <div
          style={{
            position: 'fixed',
            right: '2vw',
            bottom: '2vh',
            zIndex: 50,
            background: 'rgba(60,81,27,0.92)',
            border: '2px solid #5E9C3F',
            borderRadius: '8px',
            boxShadow: '0 2px 8px #0006',
            fontFamily: 'monospace, "Press Start 2P", "VT323"',
            color: '#fff',
            fontSize: '0.95rem',
            padding: '0.35rem 0.8rem 0.35rem 0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4em',
            opacity: 0.85,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
            animation: 'vibez-float 3.5s ease-in-out infinite',
          }}
        >
          <span style={{fontSize: '1.1em', filter: 'drop-shadow(0 1px 0 #3C511B)'}}>🟩</span>
          <span style={{fontWeight: 700, letterSpacing: '1px'}}>Vibez by Kretz</span>
        </div>
        <style>{`
          @keyframes vibez-float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }
        `}</style>
        {/* End Vibez badge */}
      </body>
    </html>
  );
}
