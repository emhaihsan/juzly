export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-black/60 flex items-center justify-between">
        <span>© {new Date().getFullYear()} juzly</span>
        <span>Made for speed and simplicity</span>
      </div>
    </footer>
  );
}
