import { useState } from "react";
import { Outlet, Link } from "react-router-dom";

function MI({
  icon,
  size = 20,
  fill = 0,
  className = "",
  style = {},
}: {
  icon: string;
  size?: number;
  fill?: 0 | 1;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`material-symbols-outlined select-none leading-none ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Source Sans 3', system-ui, sans-serif", fontSize: "var(--font-size)" }}
    >
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <MI
                icon="layers"
                size={14}
                className="text-background"
                style={{ color: "#fff" }}
              />
            </div>
            <span
              className="text-sm font-semibold"
            >
              DS Boilerplate
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Install Plugin
            </a>
          </div>

          <button
            className="md:hidden p-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MI
              icon={mobileOpen ? "close" : "menu"}
              size={22}
            />
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#"
              className="block w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium text-center mt-2"
            >
              Install Plugin
            </a>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <Outlet />

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10 bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
              <MI
                icon="layers"
                size={12}
                style={{ color: "#fff" }}
              />
            </div>
            <span
              className="text-sm font-semibold"
            >
              DS Boilerplate
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap justify-center">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Changelog
            </a>
            <a
              href="#"
              className="hover:text-foreground transition-colors"
            >
              Figma Community
            </a>
            <Link
              to="/contact"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
          <span className="text-xs text-muted-foreground">
            © 2025 DS Boilerplate
          </span>
        </div>
      </footer>
    </div>
  );
}
