"use client";
import { useCallback, useEffect, useState } from "react";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useSolanaWallet, useSignMessage } from "@web3auth/modal/react/solana";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";

export default function SolanaDemo() {
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const {
    data: signatureHash,
    error: signError,
    loading: isSigningMessage,
    signMessage,
  } = useSignMessage();

  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Use public devnet RPC to avoid 403 errors
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const fetchBalance = useCallback(async () => {
    if (!accounts?.[0]) {
      setError("No account available");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const publicKey = new PublicKey(accounts[0]);
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
      setLastAction("Balance fetched successfully");
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMsg);
      setLastAction("Failed to fetch balance");
    } finally {
      setIsLoading(false);
    }
  }, [accounts, connection]);

  const handleSignMessage = async () => {
    setError("");
    const message = "Hello from Juzly on Solana Devnet!";
    signMessage(message);
  };

  // Handle sign message results
  useEffect(() => {
    if (signatureHash) {
      setLastAction(`Message signed: ${signatureHash.slice(0, 20)}...`);
    }
  }, [signatureHash]);

  useEffect(() => {
    if (signError) {
      setError(`Sign error: ${signError.message}`);
      setLastAction("Failed to sign message");
    }
  }, [signError]);

  useEffect(() => {
    if (isConnected && accounts?.[0]) {
      fetchBalance();
    } else if (isConnected && !accounts?.[0]) {
      setError("Connected but no account found");
    }
  }, [isConnected, accounts, fetchBalance]);

  if (!isConnected) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Solana Integration Demo</h2>
        <p className="text-sm text-black/70 mt-2">
          Connect your wallet to interact with Solana blockchain
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            Please connect your wallet first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Solana Integration Demo</h2>
      <p className="text-sm text-black/70 mt-2">
        Demonstrating live Solana blockchain interaction
      </p>

      <div className="mt-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
            <span className="text-red-800">⚠ {error}</span>
          </div>
        )}

        {/* Wallet Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Wallet Information</h3>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-600">Address: </span>
              <span className="font-mono">
                {accounts?.[0]
                  ? `${accounts[0].slice(0, 8)}...${accounts[0].slice(-8)}`
                  : "Not available"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Balance: </span>
              <span className="font-mono">
                {balance !== null ? `${balance.toFixed(6)} SOL` : "Loading..."}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Network: </span>
              <span className="text-blue-600">Solana Devnet</span>
            </div>
            <div>
              <span className="text-gray-600">RPC: </span>
              <span className="text-green-600">Public Devnet</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={fetchBalance}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh Balance"}
          </button>

          <button
            onClick={handleSignMessage}
            disabled={isSigningMessage || !isConnected}
            className="px-4 py-2 text-sm border border-blue-300 bg-blue-50 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            {isSigningMessage ? "Signing..." : "Sign Message"}
          </button>
        </div>

        {/* Status */}
        {lastAction && !error && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
            <span className="text-green-800">✓ {lastAction}</span>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 mt-4">
          This demo shows real interaction with Solana devnet using Web3Auth.
          Using public devnet RPC for balance queries.
        </div>
      </div>
    </div>
  );
}
