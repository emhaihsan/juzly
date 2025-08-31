"use client";
import {
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { useSolanaWallet } from "@web3auth/modal/react/solana";

export default function Navbar() {
  const {
    connect,
    isConnected,
    loading: connectLoading,
    error: connectError,
  } = useWeb3AuthConnect();
  const {
    disconnect,
    loading: disconnectLoading,
    error: disconnectError,
  } = useWeb3AuthDisconnect();
  const { accounts } = useSolanaWallet();

  const address = accounts?.[0];
  const shortAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-4)}`
    : "";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-black text-white grid place-items-center font-bold">
            J
          </div>
          <span className="text-xl font-semibold tracking-tight">juzly</span>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && address && (
            <span
              className="font-mono text-sm px-2 py-1 bg-gray-100 rounded"
              title={address}
            >
              {shortAddress}
            </span>
          )}

          {isConnected ? (
            <button
              onClick={() => disconnect()}
              disabled={disconnectLoading}
              className="px-4 py-2 text-sm font-medium border border-black rounded hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              {disconnectLoading ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button
              onClick={() => connect()}
              disabled={connectLoading}
              className="px-4 py-2 text-sm font-medium border border-black rounded hover:bg-black hover:text-white transition-colors disabled:opacity-50"
            >
              {connectLoading ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>

      {(connectError || disconnectError) && (
        <div className="mx-auto max-w-7xl px-4 pb-2">
          <div className="text-red-600 text-sm">
            {connectError?.message || disconnectError?.message}
          </div>
        </div>
      )}
    </header>
  );
}
