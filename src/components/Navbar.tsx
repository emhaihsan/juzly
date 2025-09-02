"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useWeb3AuthUser } from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { connect, disconnect, isConnected } = useWeb3AuthConnect();
  const { userInfo } = useWeb3AuthUser();
  const { connection, accounts } = useSolanaWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const pubkey = accounts?.[0];

  // Navigation items
  const navItems = [
    { href: "/", label: "Home", exact: true },
    { href: "/quran", label: "Baca Quran" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/rewards", label: "Rewards" },
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      if (connection && pubkey) {
        try {
          const bal = await connection.getBalance(pubkey);
          setBalance(bal / 1e9); // Convert lamports to SOL
        } catch (error) {
          console.error("Error fetching balance:", error);
          setBalance(null);
        }
      }
    };

    if (isConnected) {
      fetchBalance();
    }
  }, [connection, pubkey, isConnected]);

  const handleConnect = async () => {
    try {
      await connect({
        connectorName: "solana",
      });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setBalance(null);
      setShowUserMenu(false);
    } catch (error) {
      console.error("Disconnection failed:", error);
    }
  };

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-black/10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">📖</div>
            <span className="text-xl font-semibold">Juzly</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href, item.exact)
                    ? "bg-black text-white"
                    : "text-black/70 hover:text-black hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Section */}
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md border border-black/20 hover:border-black/40 transition-colors"
                >
                  <div className="text-xs">
                    <div className="font-medium">
                      {pubkey?.slice(0, 4)}...{pubkey?.slice(-4)}
                    </div>
                    {balance !== null && (
                      <div className="text-black/60">
                        {balance.toFixed(3)} SOL
                      </div>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </button>

                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-black/10 py-2">
                    <div className="px-4 py-2 border-b border-black/10">
                      <div className="text-sm font-medium">
                        Connected Wallet
                      </div>
                      <div className="text-xs text-black/60 font-mono">
                        {pubkey}
                      </div>
                    </div>

                    {userInfo && (
                      <div className="px-4 py-2 border-b border-black/10">
                        <div className="text-sm font-medium">User Info</div>
                        <div className="text-xs text-black/60">
                          {userInfo.email || userInfo.name || "Anonymous"}
                        </div>
                      </div>
                    )}

                    <div className="py-1">
                      <Link
                        href="/rewards"
                        className="block px-4 py-2 text-sm hover:bg-black/5"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Rewards
                      </Link>
                      <Link
                        href="/marketplace"
                        className="block px-4 py-2 text-sm hover:bg-black/5"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Marketplace
                      </Link>
                      <button
                        onClick={handleDisconnect}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-black/80 transition-colors"
              >
                Connect Wallet
              </button>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 rounded-md hover:bg-black/5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-black/10 py-2">
          <div className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href, item.exact)
                    ? "bg-black text-white"
                    : "text-black/70 hover:text-black hover:bg-black/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
