import type { Metadata } from "next";
import "./globals.css";
import { FlowWalletDebugger } from "../lib/web3/flowWalletDebug";
import { EIP6963Initializer } from "../lib/web3/eip6963Initializer";

export const metadata: Metadata = {
  title: "ImmutableType",
  description: "Decentralized journalism platform",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <EIP6963Initializer />
        <FlowWalletDebugger />
        {children}
      </body>
    </html>
  );
}