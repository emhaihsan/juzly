"use client";
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "@/web3authContext";

export default function Web3AuthRootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      {children}
    </Web3AuthProvider>
  );
}
