export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-white/30 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ج</span>
            </div>
            <span className="text-white font-bold tracking-wider">JUZLY</span>
          </div>

          <div className="flex items-center gap-8 text-xs text-white/60 font-mono">
            <span> {new Date().getFullYear()} JUZLY</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span>SOLANA BLOCKCHAIN</span>
            <div className="w-px h-4 bg-white/20"></div>
            <span>WEB3AUTH INTEGRATION</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
