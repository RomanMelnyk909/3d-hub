export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center gap-4 text-font-size-small text-text-muted">
        <span>© {new Date().getFullYear()} 3D Hub</span>
        <div className="flex gap-4">
          <a
            href="mailto:dmca@3dhub.example.com"
            className="hover:text-text-primary transition-colors"
          >
            DMCA Contact
          </a>
          <a
            href="/privacy"
            className="hover:text-text-primary transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
