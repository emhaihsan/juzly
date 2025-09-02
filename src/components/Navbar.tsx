"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
} from "@web3auth/modal/react";
import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useEffect, useState } from "react";
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

  // Use public devnet RPC to avoid 403 errors
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Navigation items
  const navItems = [
    { href: "/", label: "Home", exact: true },
    { href: "/quran", label: "Read Quran" },
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
      <div className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-blue-300">◉</span>
          <span className="text-white">
            {solBalance !== null
              ? `${solBalance.toFixed(3)} SOL`
              : "Loading..."}
          </span>
        </div>
        <div className="w-px h-4 bg-white/20"></div>
        <div className="flex items-center gap-1">
          <span className="text-yellow-300">🪙</span>
          <span className="text-white">
            {juzBalance !== null
              ? `${juzBalance.toFixed(2)} JUZ`
              : "Loading..."}
          </span>
        </div>
        <button
          onClick={refreshBalances}
          className="ml-1 text-white/60 hover:text-white transition-colors"
          title="Refresh balances"
        >
          ↻
        </button>
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
            {userInfo?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <span className="text-sm max-w-24 truncate text-white">
            {pubkey ? `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}` : "Unknown"}
          </span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50">
            <div className="p-4 border-b border-gray-100">
              <div className="text-sm text-gray-600">
                Connected via {connectorName}
              </div>
              <div className="font-mono text-xs text-gray-500 mt-1 break-all">
                {pubkey}
              </div>
            </div>

            <div className="p-3 border-b border-gray-100">
              <div className="text-xs text-gray-500 mb-2">
                Token Information
              </div>
              <div className="text-xs space-y-1">
                <div className="text-gray-700">
                  Network:{" "}
                  <span className="text-green-600 font-medium">
                    Solana Devnet
                  </span>
                </div>
                <div className="text-gray-700">
                  Mint:{" "}
                  <span className="font-mono text-gray-600">
                    {JUZ_DEPLOYMENT_CONFIG.mintAddress.slice(0, 8)}...
                  </span>
                </div>
                <a
                  href={JUZ_DEPLOYMENT_CONFIG.explorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline inline-block"
                >
                  View on Explorer ↗
                </a>
              </div>
            </div>

            {userInfo && (
              <div className="p-3 border-b border-gray-100">
                <div className="text-xs text-gray-500 mb-1">User Info</div>
                <div className="text-sm text-gray-800 font-medium">
                  {userInfo.name}
                </div>
                <div className="text-xs text-gray-500">{userInfo.email}</div>
              </div>
            )}

            <div className="p-3">
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Disconnect Wallet
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
      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
    >
      Connect Wallet
    </button>
  );

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ج</span>
            </div>
            <span className="text-xl font-bold text-white">Juzly</span>
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              BETA
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== "/";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
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
      <div className="md:hidden border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-wrap justify-center gap-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== "/";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
