import type { Metadata } from "next";
import "./globals.css";
import { DirectWalletProvider } from "../lib/providers/DirectWalletProvider";

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
        <DirectWalletProvider>
          {children}
        </DirectWalletProvider>
      </body>
    </html>
  );
}