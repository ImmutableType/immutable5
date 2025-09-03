import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmutableType",
  description: "Decentralized journalism platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* TODO: Add providers here - WalletProvider, FarcasterProvider */}
        {children}
      </body>
    </html>
  );
}