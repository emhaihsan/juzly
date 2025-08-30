"use client";

export default function Navbar() {
  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-black text-white grid place-items-center font-bold">
            J
          </div>
          <span className="text-xl font-semibold tracking-tight">juzly</span>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-black px-3 py-1.5 text-sm font-medium hover:bg-black hover:text-white transition-colors"
          onClick={() => alert("Dummy connect wallet - coming soon")}
        >
          Connect Wallet
        </button>
      </div>
    </header>
  );
}
