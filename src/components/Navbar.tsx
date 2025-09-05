"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useEffect, useMemo, useState } from "react";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { getUserJuzBalance } from "@/lib/juz-token";
import { JUZ_DEPLOYMENT_CONFIG } from "@/lib/deployment-config";

export default function Navbar() {
  const pathname = usePathname();
  const { connect, isConnected, connectorName } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { accounts } = useSolanaWallet();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [juzBalance, setJuzBalance] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pubkey = accounts?.[0];

  // Use public devnet RPC to avoid 403 errors - wrapped in useMemo to prevent recreation
  const connection = useMemo(
    () => new Connection(clusterApiUrl("devnet"), "confirmed"),
    []
  );

  // Navigation items
  const navItems = [
    { href: "/quran", label: "Quran" },
    { href: "/donation", label: "Donate" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/rewards", label: "Rewards" },
  ];

  useEffect(() => {
    const fetchBalances = async () => {
      if (connection && pubkey) {
        try {
          const publicKey = new PublicKey(pubkey);

          // Fetch SOL balance
          const sol = await connection.getBalance(publicKey);
          setSolBalance(sol / 1e9); // Convert lamports to SOL

          // Fetch JUZ token balance
          const juz = await getUserJuzBalance(publicKey);
          setJuzBalance(juz);
        } catch (error) {
          console.error("Error fetching balances:", error);
          setSolBalance(null);
          setJuzBalance(null);
        }
      }
    };

    fetchBalances();
  }, [connection, pubkey]);

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
    setSolBalance(null);
    setJuzBalance(null);
  };

  const refreshBalances = async () => {
    if (connection && pubkey) {
      try {
        const publicKey = new PublicKey(pubkey);
        const sol = await connection.getBalance(publicKey);
        setSolBalance(sol / 1e9);

        const juz = await getUserJuzBalance(publicKey);
        setJuzBalance(juz);
      } catch (error) {
        console.error("Error refreshing balances:", error);
      }
    }
  };

  const loggedInView = () => (
    <div className="flex items-center gap-4">
      {/* Balance Display */}
      <div className="flex items-center gap-3 border border-white/20 px-4 py-2 text-sm bg-black">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-white font-mono text-xs">
            {solBalance !== null ? `${solBalance.toFixed(3)} SOL` : "..."}
          </span>
        </div>
        <div className="w-px h-4 bg-white/30"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white/80 rounded-full"></div>
          <span className="text-white font-mono text-xs">
            {juzBalance !== null ? `${juzBalance.toFixed(2)} JUZ` : "..."}
          </span>
        </div>
        <button
          onClick={refreshBalances}
          className="ml-2 text-white/60 hover:text-white transition-colors text-xs"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-3 border border-white/20 px-4 py-2 hover:border-white/40 transition-colors bg-black"
        >
          <div className="w-6 h-6 border border-white/30 flex items-center justify-center text-xs font-bold text-white">
            {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="text-xs font-mono text-white">
            {pubkey ? `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}` : "---"}
          </span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-72 bg-black border border-white/20 z-50">
            <div className="p-4 border-b border-white/10">
              <div className="text-xs text-white/60 mb-1">CONNECTION</div>
              <div className="text-sm text-white font-medium">
                {connectorName}
              </div>
              <div className="font-mono text-xs text-white/40 mt-2 break-all">
                {pubkey}
              </div>
            </div>

            <div className="p-4 border-b border-white/10">
              <div className="text-xs text-white/60 mb-2">TOKEN INFO</div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/80">Network</span>
                  <span className="text-white font-medium">Solana Devnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Mint</span>
                  <span className="font-mono text-white/60">
                    {JUZ_DEPLOYMENT_CONFIG.mintAddress.slice(0, 8)}...
                  </span>
                </div>
                <a
                  href={JUZ_DEPLOYMENT_CONFIG.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-white/80 hover:underline inline-block text-xs"
                >
                  View Explorer →
                </a>
              </div>
            </div>

            {userInfo && (
              <div className="p-4 border-b border-white/10">
                <div className="text-xs text-white/60 mb-1">USER</div>
                <div className="text-sm text-white font-medium">
                  {userInfo.name}
                </div>
                <div className="text-xs text-white/60">{userInfo.email}</div>
              </div>
            )}

            <div className="p-4">
              <button
                onClick={handleDisconnect}
                className="w-full border border-white/30 text-white py-2 px-4 hover:bg-white hover:text-black transition-colors text-xs font-medium"
              >
                DISCONNECT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const unloggedInView = () => (
    <button
      onClick={handleConnect}
      className="border border-white/30 text-white px-6 py-2 hover:bg-white hover:text-black transition-all duration-300 font-medium text-sm"
    >
      CONNECT WALLET
    </button>
  );

  return (
    <nav className="bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 border border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-lg">ج</span>
            </div>
            <div className="flex items-center">
              <span className="text-xl font-bold text-white tracking-wider">
                JUZLY
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-xs font-medium tracking-wider transition-all duration-200 ${
                    isActive
                      ? "border-b-2 border-white text-white"
                      : "text-white/60 hover:text-white hover:border-b-2 hover:border-white/30"
                  }`}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center">
            {isConnected ? loggedInView() : unloggedInView()}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-wrap justify-center gap-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 text-xs font-medium tracking-wider transition-all duration-200 ${
                    isActive
                      ? "border border-white text-white"
                      : "text-white/60 hover:text-white border border-white/20 hover:border-white/40"
                  }`}
                >
                  {item.label.toUpperCase()}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
