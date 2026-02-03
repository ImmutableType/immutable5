import type { Metadata } from "next";
import "./globals.css";
import { FlowWalletDebugger } from "../lib/web3/flowWalletDebug";

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
      <body className="antialiased" suppressHydrationWarning>
        <FlowWalletDebugger />
        {children}
      </body>
    </html>
  );
}