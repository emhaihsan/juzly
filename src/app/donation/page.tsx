"use client";

import { Keypair, PublicKey } from "@solana/web3.js";
import { createQR, encodeURL } from "@solana/pay";
import BigNumber from "bignumber.js";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSolanaWallet } from "@web3auth/modal/react/solana";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import Link from "next/link";

// Predefined donation amounts in SOL
const DONATION_PRESETS = [
  { amount: 0.01, label: "0.01 SOL", description: "Small Sadaqah" },
  { amount: 0.05, label: "0.05 SOL", description: "Regular Donation" },
  { amount: 0.1, label: "0.1 SOL", description: "Generous Gift" },
  { amount: 0.25, label: "0.25 SOL", description: "Major Contribution" },
];

// Islamic charity organizations (example addresses - replace with real ones)
const CHARITY_ORGANIZATIONS = [
  {
    name: "Global Education Fund",
    address: "9q3335MQfBQuCkkUBdeXgrsXkbVTjvLxBAeyq11JPNdK",
    description:
      "Supporting education initiatives for underprivileged communities worldwide",
  },
  {
    name: "Health for All Foundation",
    address: "3JDJbu8KH58ViKV8BfFtH3xwXgtdvoAwgUwfGbfz8j68",
    description:
      "Providing access to healthcare and medical resources globally",
  },
  {
    name: "Disaster Relief Network",
    address: "Dd1RRKveoFxZeGXfmjteDvA4MxD5oibpqF3qTfg8DZTC",
    description:
      "Offering rapid humanitarian aid and disaster relief response services",
  },
];

export default function DonationPage() {
  const { isConnected } = useWeb3AuthConnect();
  const { accounts } = useSolanaWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCharity, setSelectedCharity] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [qrUrl, setQrUrl] = useState<string>("");
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQrCode = (amount: number) => {
    try {
      if (!isConnected || !accounts?.[0]) {
        setError("Please connect your wallet first");
        return;
      }

      if (amount <= 0) {
        setError("Please enter a valid donation amount");
        return;
      }

      setIsLoading(true);
      setError(null);

      // Set donation parameters
      const recipient = new PublicKey(
        CHARITY_ORGANIZATIONS[selectedCharity].address
      );
      const donationAmount = new BigNumber(amount);
      const reference = new Keypair().publicKey;

      // Islamic donation labels
      const label = `Sadaqah via Juzly - ${CHARITY_ORGANIZATIONS[selectedCharity].name}`;
      const message = `Barakallahu feeki for your generous donation! May Allah accept this Sadaqah.`;
      const memo = `Donation-${CHARITY_ORGANIZATIONS[
        selectedCharity
      ].name.replace(/\s+/g, "-")}-${Date.now()}`;

      // Create Solana Pay URL
      const url = encodeURL({
        recipient,
        amount: donationAmount,
        reference,
        label,
        message,
        memo,
      });

      setQrUrl(url.toString());
      setShowModal(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to generate QR code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR code when modal opens and URL is available
  useEffect(() => {
    if (showModal && qrUrl && qrRef.current) {
      qrRef.current.innerHTML = "";
      try {
        const qr = createQR(qrUrl, 300, "white");
        qr.append(qrRef.current);
      } catch (error) {
        setError("Failed to create QR code");
      }
    }
  }, [showModal, qrUrl]);

  const closeModal = () => {
    setShowModal(false);
    setQrUrl("");
    setError(null);
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount)) {
      setError("Please enter a valid number");
      return;
    }
    generateQrCode(amount);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-3">💝 Make a Donation</h1>
          <p className="text-lg text-white/80 mb-2">
            Support Islamic causes through blockchain technology
          </p>
          <p className="text-sm text-white/60">
            &ldquo;The believer&apos;s shade on the Day of Resurrection will be
            their charity&rdquo; - Prophet Muhammad ﷺ
          </p>
        </div>

        {/* Testnet Limitation Notice */}
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-orange-400 text-xl">⚠️</span>
            <div>
              <div className="font-semibold text-orange-400 mb-2">
                Testnet Environment Limitation
              </div>
              <div className="text-sm text-orange-300 space-y-2">
                <p>
                  <strong>Important:</strong> Solana Pay functionality is
                  currently limited on Devnet/Testnet. You may encounter the
                  following issues:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-orange-300/90">
                  <li>QR codes may not scan properly in wallet apps</li>
                  <li>Payment requests might fail or timeout</li>
                  <li>Transaction processing may be inconsistent</li>
                </ul>
                <p className="pt-2">
                  <strong>For Production:</strong> These features work
                  seamlessly on Solana Mainnet. This is a demonstration
                  environment showcasing the integration capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Charity Selection */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                📋 Select Organization
              </h2>
              <div className="space-y-3">
                {CHARITY_ORGANIZATIONS.map((org, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCharity === index
                        ? "border-white bg-white/10"
                        : "border-white/20 hover:border-white/40"
                    }`}
                    onClick={() => setSelectedCharity(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{org.name}</h3>
                        <p className="text-sm text-white/60 mt-1">
                          {org.description}
                        </p>
                        <p className="text-xs text-white/40 mt-1 font-mono">
                          {org.address.slice(0, 8)}...{org.address.slice(-8)}
                        </p>
                      </div>
                      {selectedCharity === index && (
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Islamic Quote */}
            <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
              <p className="text-sm text-white/80 italic">
                &ldquo;Whoever relieves a Muslim of a burden from the burdens of
                the world, Allah will relieve him of a burden from the burdens
                on the Day of Judgment.&rdquo;
              </p>
              <p className="text-xs text-white/60 mt-1">
                - Hadith Sahih Muslim
              </p>
            </div>
          </div>

          {/* Right Column: Donation Amount */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">💰 Choose Amount</h2>

              {/* Preset Amounts */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {DONATION_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => generateQrCode(preset.amount)}
                    disabled={isLoading || !isConnected}
                    className="p-4 border border-white/20 rounded-lg hover:border-white hover:bg-white/5 transition-colors disabled:opacity-50 text-left"
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-sm text-white/60">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-3">
                <label className="block text-sm font-medium">
                  Custom Amount (SOL)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="flex-1 px-4 py-2 border border-white/30 rounded-lg bg-black text-white placeholder-white/40 focus:ring-2 focus:ring-white focus:border-transparent"
                    step="0.01"
                    min="0"
                  />
                  <button
                    onClick={handleCustomDonation}
                    disabled={isLoading || !isConnected || !customAmount}
                    className="px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Generating..." : "Donate"}
                  </button>
                </div>
              </div>
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="p-4 bg-white/5 border border-white/20 rounded-lg">
                <p className="text-sm text-white/80">
                  Please connect your wallet to make donations
                </p>
                <Link
                  href="/"
                  className="text-sm text-white hover:text-white/80 mt-2 inline-block"
                >
                  Go to home page to connect wallet →
                </Link>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">❌ {error}</p>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Modal */}
        {showModal &&
          createPortal(
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-black border border-white/20 rounded-xl max-w-md w-full p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    📱 Scan to Donate
                  </h3>
                  <p className="text-sm text-white/60 mb-4">
                    Scan this QR code with any Solana wallet
                  </p>

                  <div className="flex justify-center mb-4">
                    <div
                      ref={qrRef}
                      className="border border-white/20 rounded-lg p-4 bg-white"
                    ></div>
                  </div>

                  <div className="text-sm text-white/60 mb-4">
                    <p>
                      Donating to:{" "}
                      <strong>
                        {CHARITY_ORGANIZATIONS[selectedCharity].name}
                      </strong>
                    </p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 mb-4">
                      Error: {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-white/30 rounded-lg hover:bg-white/5 text-white transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(qrUrl)}
                      className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
