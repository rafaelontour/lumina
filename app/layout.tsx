import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Barlow, Lexend } from "next/font/google";
import "./globals.css";
import AppShell from "./components/AppShell";
import { ThemeProvider } from "./data/provider/ThemeProvider";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumina",
  description: "Assistente de revisão científica.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const menuRecolhido = cookieStore.get("lumina-menu-recolhido")?.value === "true";
  const tema = cookieStore.get("lumina-tema")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${lexend.variable} ${tema === "dark" ? "dark" : ""} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <ThemeProvider initialTheme={tema}>
          <AppShell menuRecolhidoInicial={menuRecolhido}>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
