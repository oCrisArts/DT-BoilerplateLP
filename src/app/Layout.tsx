import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { trackFigmaInstallClick, trackSectionView, SECTIONS, type SectionId } from "../utils/analytics";
import { motion, useScroll, useTransform } from "motion/react";

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
  { label: "Fastest Way", href: "/#hero", section: "hero" },
  { label: "Problem Solved", href: "/#problem-solved", section: "problem-solved" },
  { label: "Presets", href: "/#presets", section: "presets" },
  { label: "How it works", href: "/#how-it-works", section: "how-it-works" },
  { label: "Features", href: "/#features", section: "features" },
  { label: "Visual Docs", href: "/#visual-docs", section: "visual-docs" },
  { label: "Pricing", href: "/#pricing", section: "pricing" },
  { label: "FAQ", href: "/#faq", section: "faq" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Reuse ScrollSpy for navigation, section analytics, and non-navigating hash updates.
  useEffect(() => {
    if (location.pathname !== '/') { setActiveSection(''); return; }
    let lastY = window.scrollY;
    let direction: 'up' | 'down' | 'none' = 'none';
    const onScroll = () => {
      if (window.scrollY !== lastY) direction = window.scrollY > lastY ? 'down' : 'up';
      lastY = window.scrollY;
    };
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(entries => {
      onScroll();
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      }
      const target = [...visible].sort((a,b) => Math.abs(a.getBoundingClientRect().top - innerHeight * .2) - Math.abs(b.getBoundingClientRect().top - innerHeight * .2))[0];
      if (target) {
        setActiveSection(target.id);
        trackSectionView(target.id as SectionId, direction);
      }
    }, { root: null, rootMargin: '-20% 0px -60% 0px', threshold: 0 });
    SECTIONS.forEach(id => { const element=document.getElementById(id); if(element)observer.observe(element); });
    window.addEventListener('scroll',onScroll,{passive:true});
    return () => { observer.disconnect(); window.removeEventListener('scroll',onScroll); };
  }, [location.pathname]);

  // Update active section based on hash
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1);
      setActiveSection(sectionId);
    }
  }, [location.hash]);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: "var(--font-size)" }}
    >
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[2px] bg-accent origin-left"
          style={{ scaleX }}
        />
        
        <div className="max-w-[1800px] mx-auto px-5 sm:px-10 lg:px-[60px] h-[72px] flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
          >
            <img src="/images/presets/starttokens.svg" alt="" width="28" height="45" className="h-11 w-7 object-contain" />
            <span
              className="text-xl font-semibold"
            >
              StartTokens
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-4 2xl:gap-8 relative">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                aria-current={activeSection === link.section ? 'location' : undefined}
                to={link.href}
                className={`text-sm transition-colors relative ${
                  activeSection === link.section 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                {activeSection === link.section && (
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent"
                    layoutId="activeNavIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden xl:flex items-center gap-3">
            <a
              href="https://www.figma.com/community/plugin/1651310914400769393"
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackFigmaInstallClick}
              className="inline-flex min-h-14 items-center justify-center gap-2 px-8 py-3 rounded-lg bg-accent text-white text-base font-medium hover:opacity-90 transition-opacity"
            >
              Install on Figma
            </a>
          </div>

          <button
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="xl:hidden min-h-11 min-w-11 p-1 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <MI
              icon={mobileOpen ? "close" : "menu"}
              size={22}
            />
          </button>
        </div>

        {mobileOpen && (
          <div id="mobile-navigation" className="xl:hidden border-t border-border bg-background px-6 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                aria-current={activeSection === link.section ? 'location' : undefined}
                className={`block text-sm transition-colors ${
                  activeSection === link.section 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://www.figma.com/community/plugin/1651310914400769393"
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackFigmaInstallClick}
              className="block w-full py-2.5 rounded-lg bg-foreground text-background text-sm font-medium text-center mt-2"
            >
              Install on Figma
            </a>
          </div>
        )}
      </header>

      {/* ── Page Content ── */}
      <main><Outlet /></main>

      {/* ── Footer ── */}
      <footer className="border-t border-background/20 py-10 bg-foreground text-background">
        <div className="max-w-[1800px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5">
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
              StartTokens
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
              href="https://www.figma.com/community/plugin/1651310914400769393"
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackFigmaInstallClick}
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
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">            
              © 2025 StartTokens by 
            </span>
            <a href="https://ocris.art.br/" target="_blank" rel="noopener noreferrer" aria-label="Visit oCris Arts">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M27.9279 32.8879L28.2959 30.8719L24.0159 18.2079C24.1999 17.7919 24.3359 17.3279 24.3359 16.8399C24.3359 15.1519 23.0959 13.7199 21.4239 13.4879V9.46387H20.4639V13.4879C18.8239 13.7119 17.5199 15.1199 17.5199 16.8399C17.5199 17.5039 17.7119 18.1519 18.0799 18.7039L13.7759 30.9199L14.2399 33.0559L13.4399 37.3599L15.4879 33.5759L17.1039 32.0559L21.1199 20.2559L25.3519 32.1599L26.6719 33.3999L29.0399 37.3439L27.9279 32.8879ZM22.8319 16.8479C22.8319 17.9519 22.0959 18.9199 21.0319 19.2079C19.7279 18.8559 18.9599 17.5119 19.3119 16.2079C19.5359 15.3679 20.1919 14.7119 21.0319 14.4879C22.0879 14.7759 22.8319 15.7439 22.8319 16.8479Z" fill="#BB294A"/>
              <path d="M20.5518 16.8478C20.5518 17.2158 20.7038 17.5758 20.9678 17.8318C21.5118 17.2958 21.5198 16.4238 20.9838 15.8798C20.9758 15.8718 20.9678 15.8638 20.9678 15.8638C20.6958 16.1198 20.5518 16.4798 20.5518 16.8478Z" fill="#BB294A"/>
              <path d="M28.44 22.8962C26.784 23.8402 24.912 24.3362 23.008 24.3362C16.952 24.3362 12.048 19.4322 12.048 13.3762C12.048 9.72024 13.872 6.30424 16.904 4.27224C16.904 4.27224 17.712 3.82424 17.272 3.07224C16.824 2.32024 16.008 2.81624 16.008 2.81624C12.496 5.05624 10.168 8.98424 10.168 13.4562C10.168 20.4162 15.816 26.0642 22.776 26.0642C25.064 26.0642 27.32 25.4402 29.28 24.2562C29.28 24.2562 30.176 23.8802 29.688 23.0962C29.2 22.3122 28.44 22.8962 28.44 22.8962Z" fill="#BB294A"/>
              </svg>
            </a>
          </div>          
        </div>
      </footer>
    </div>
  );
}
