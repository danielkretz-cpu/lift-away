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
        {/* Minecraft-inspired Banner - visible on all pages */}
        <div
          style={{
            background: 'linear-gradient(90deg, #5E9C3F 0%, #79C05A 100%)',
            border: '4px solid #3C511B',
            boxShadow: '0 4px 16px #0008',
            fontFamily: '"Press Start 2P", "VT323", monospace',
            color: '#fff',
            textShadow: '2px 2px 0 #3C511B, 4px 4px 0 #0008',
            fontSize: '2rem',
            letterSpacing: '2px',
            padding: '1.2rem 0',
            marginBottom: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            userSelect: 'none',
            marginTop: '1.5rem',
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <span role="img" aria-label="grass block" style={{marginRight: 12}}>🟩</span>
          Vibez by Kretz
          <span role="img" aria-label="grass block" style={{marginLeft: 12}}>🟩</span>
        </div>
        {/* End Minecraft Banner */}
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
