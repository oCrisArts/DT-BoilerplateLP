import PluginMockup from "./components/PluginMockup";
import { useRef, useState, useEffect, useId } from "react";
import { catalog, presetNames, loadPreset } from "@/data/presets";
import type { Module as VariableModule, Submodule as VariableSubmodule, Variable as VariableItem } from '@/data/preset-contract/types';
import { useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { trackHeroCTA, trackInstallPlugin, trackFAQExpand, trackCheckoutStarted, trackPricingClick } from "../utils/analytics";

// ── Material Symbol helper ────────────────────────────────────────────────────
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

// ── Data ─────────────────────────────────────────────────────────────────────
function SectionTag({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-accent/25 bg-accent/5 px-[17px] py-[9px] font-mono text-base font-normal leading-none text-accent whitespace-nowrap ${className}`}
    >
      {children}
    </span>
  );
}

function ScrollReveal({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion
    ? { x: 0, y: 0 }
    : direction === "left"
      ? { x: -24, y: 0 }
      : direction === "right"
        ? { x: 24, y: 0 }
        : { x: 0, y: 24 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function Parallax({
  children,
  className = "",
  distance = 32,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const clampedDistance = Math.min(Math.abs(distance), 40);
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [-clampedDistance, clampedDistance]),
    { stiffness: 90, damping: 24, mass: 0.35 },
  );

  return (
    <motion.div
      ref={ref}
      className={`max-md:!transform-none ${className}`}
      style={{ y: reduceMotion ? 0 : y }}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({
  children,
  className = "",
  depth = 4,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}) {
  const reduceMotion = useReducedMotion();
  const safeDepth = Math.min(Math.abs(depth), 6);

  return (
    <motion.div
      className={`max-md:!transform-none ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              rotateX: -safeDepth,
              rotateY: safeDepth,
              scale: 1.015,
            }
      }
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: "palette",
    title: "Colors",
    desc: "Customize framework colors, edit individual tokens and preview their native scales without changing the original token names.",
  },
  {
    icon: "font_download",
    title: "Typography",
    desc: "Choose your font, base size, type scale and line height, then regenerate typography values while preserving the framework structure.",
  },
  {
    icon: "grid_4x4",
    title: "Layout",
    desc: "Adjust grid, breakpoints, spacing, radius and other layout foundations available in each preset.",
  },
];

const STEPS = [
  { num: "01", title: "Choose a Preset", desc: `Start with ${presetNames} foundations.` },
  { num: "02", title: "Customize Colors", desc: "Change color values and preview their scales while keeping the original framework token names." },
  { num: "03", title: "Configure Typography", desc: "Choose your font, base size, type scale and line height, then regenerate the framework typography scale." },
  { num: "04", title: "Adjust Layout", desc: "Customize the grid, breakpoints, spacing, radius and other foundations provided by the selected preset." },
  { num: "05", title: "Generate Tokens", desc: "Create the complete customized package as native Figma Variables." },
  { num: "06", title: "Visual Documentation", desc: "StartTokens automatically creates an organized Visual Foundations page using the same generated variables." },
];

const VISUAL_DOC_PREVIEWS = [
  {
    src: "/images/how-it-works/visual-doc-1.webp",
    alt: "StartTokens Visual Foundations — customized StartToken color scales and variable paths",
  },
  {
    src: "/images/how-it-works/visual-doc-2.webp",
    alt: "StartTokens Visual Foundations — typography values and framework token names",
  },
  {
    src: "/images/how-it-works/visual-doc-3.webp",
    alt: "StartTokens Visual Foundations — layout values and framework token groups",
  },
];

const MONTHLY_FEATURES = [
  "Unlimited Generations", `${catalog.presets.length} Ready-to-use Presets`, "Colors", "Typography", "Layout",
  "Custom Color Scales", "Typography Scale Generation", "Native Figma Variable Collections",
  "Visual Foundations Documentation", "Future Updates", "Priority Support",
];
const LIFETIME_FEATURES = [...MONTHLY_FEATURES, "One-time Payment"];

const FAQS = [
  { q: "What does StartTokens generate?", a: "StartTokens generates native Figma Variables for Colors, Typography and Layout from customizable framework presets, plus an organized Visual Foundations documentation page." },
  { q: "Which presets are available?", a: `${presetNames}.` },
  { q: "Does StartTokens change framework token names?", a: "No. StartTokens preserves the original token structure and naming. You customize the values while keeping the framework conventions intact." },
  { q: "Does it use native Figma Variables?", a: "Yes. Generated tokens use Figma’s native Variables system." },
  { q: "Can I customize the generated values?", a: "Yes. Colors, typography and supported layout values can be customized before generation." },
  { q: "Does it generate documentation?", a: "Yes. A Visual Foundations page is automatically created from the same variables generated by the plugin." },
];

const EMPTY_MODULES: VariableModule[] = [];

function moduleCount(module: VariableModule) {
  return module.submodules.reduce((total, submodule) => total + submodule.variables.length, 0);
}

function allVariables(modules: VariableModule[]) {
  return modules.flatMap((module) => module.submodules.flatMap((submodule) => submodule.variables));
}

const WHAT_YOU_GET_DESCRIPTIONS: Record<string, string> = {
  colors:
    "Color variables organize palettes, semantic roles and interface tokens, keeping visual decisions consistent and easy to update.",
  typography:
    "Typography variables organize families, sizes, weights and line heights into a clear, reusable hierarchy.",
  layout:
    "Layout variables standardize grids, spacing and radius, creating consistent rhythm, structure and alignment.",
};


// ── Components ────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <div className="border-b border-border last:border-0">
      <button
        aria-expanded={open}
        aria-controls={answerId}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => {
          setOpen(!open);
          if (!open) trackFAQExpand(q);
        }}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
          {q}
        </span>
        <MI
          icon="expand_more"
          size={18}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={answerId}
        aria-hidden={!open}
        className={`overflow-hidden transition-all duration-200 ${open ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {a}
        </p>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function ResultMockup({ modules }: { modules: VariableModule[] }) {
  const summary = modules.map((module) => ({
    label: module.label,
    icon: module.tabIcon,
    count: moduleCount(module),
  }));
  const rows = modules.flatMap((module) =>
    module.submodules.flatMap((submodule) =>
      submodule.variables.slice(0, 4).map((variable) => ({
        ...variable,
        moduleLabel: module.label,
      })),
    ),
  );
  const total = summary.reduce((sum, module) => sum + module.count, 0);

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[16px] border border-border bg-white shadow-[0px_24px_64px_-12px_rgba(0,0,0,0.14)]">
      <div className="flex items-center gap-2 border-b border-border bg-[#f7f7f8] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 text-center text-[11px] font-semibold text-foreground/70">
          Example token foundations
        </div>
        <span className="text-[10px] text-muted-foreground">{total}</span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="mb-5 grid grid-cols-3 gap-3">
          {summary.map((mod) => (
            <div key={mod.label} className="rounded-lg border border-border bg-background p-3">
              <MI icon={mod.icon} size={16} style={{ color: "#5E6AD2" }} />
              <p className="mt-2 text-xs font-semibold text-foreground">{mod.label}</p>
              <p className="text-[11px] text-muted-foreground">{mod.count} variables</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          {rows.slice(0, 9).map((variable) => (
              <div
                key={variable.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-3 py-2.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-sm bg-accent/70"
                    style={variable.preview ? { background: variable.preview } : undefined}
                  />
                  <span className="truncate text-xs text-foreground">
                    {variable.figmaName}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">{variable.displayValue}</span>
              </div>
            ))}
        </div>
        <a
          href="#pricing"
          onClick={() => trackPricingClick()}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-xs font-semibold text-background"
        >
          <MI icon="bolt" size={13} style={{ color: "#fff" }} />
          Generate Variables
        </a>
      </div>
    </div>
  );
}

type VariablePanelFilter =
  | { kind: "all" }
  | { kind: "module"; module: string }
  | { kind: "submodule"; module: string; submodule: string };

function VariablesPanelMockup({ modules }: { modules: VariableModule[] }) {
  const [filter, setFilter] = useState<VariablePanelFilter>({ kind: "all" });
  const total = modules.reduce((sum, module) => sum + moduleCount(module), 0);

  const activeModule =
    filter.kind === "module" || filter.kind === "submodule"
      ? modules.find((module) => module.module === filter.module)
      : undefined;
  const activeSubmodule =
    filter.kind === "submodule"
      ? activeModule?.submodules.find((submodule) => submodule.id === filter.submodule)
      : undefined;

  const filteredVariables =
    filter.kind === "all"
      ? allVariables(modules)
      : filter.kind === "module"
        ? activeModule?.submodules.flatMap((submodule) => submodule.variables) ?? []
        : activeSubmodule?.variables ?? [];

  const activeLabel =
    filter.kind === "all"
      ? "All"
      : filter.kind === "module"
        ? activeModule?.label ?? "All"
        : `${activeModule?.label ?? ""} / ${activeSubmodule?.label ?? ""}`;

  const isActive = (nextFilter: VariablePanelFilter) =>
    filter.kind === nextFilter.kind &&
    (nextFilter.kind === "all" ||
      (filter.kind !== "all" &&
        filter.module === nextFilter.module &&
        (nextFilter.kind === "module" ||
          (filter.kind === "submodule" && filter.submodule === nextFilter.submodule))));

  return (
    <div className="flex h-[min(68vh,620px)] min-h-[460px] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-white shadow-[0px_28px_72px_-18px_rgba(0,0,0,0.22)]">
      <div className="flex h-11 items-center justify-between border-b border-border bg-white px-4">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
          <MI icon="database" size={14} style={{ color: "#111111" }} />
          Variables
        </div>
        <div className="rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground">
          Mode 1
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[180px_minmax(0,1fr)] md:grid-cols-[248px_minmax(0,1fr)] md:grid-rows-1">
        <aside className="min-h-0 overflow-y-auto border-b border-border bg-[#f6f6f7] px-3 py-3 md:border-b-0 md:border-r">
          <div className="mb-3">
            <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-medium text-muted-foreground">
              <span>Collections</span>
              <MI icon="add_circle" size={13} style={{ color: "#6e6e80" }} />
            </div>
            <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] font-semibold text-foreground">
              <span>StartTokens</span>
              <span className="font-normal text-muted-foreground">{total}</span>
            </div>
          </div>

          <div className="mb-2 px-1 text-[11px] font-medium text-muted-foreground">Groups</div>
          <button
            type="button"
            onClick={() => setFilter({ kind: "all" })}
            className={`mb-1 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${
              isActive({ kind: "all" })
                ? "bg-[#e9eafe] font-semibold text-accent"
                : "text-foreground hover:bg-white"
            }`}
          >
            <span>All</span>
            <span className="text-muted-foreground">{total}</span>
          </button>

          <div className="space-y-1">
            {modules.map((module) => {
              const moduleTotal = moduleCount(module);
              return (
                <div key={module.module}>
                  <button
                    type="button"
                    onClick={() => setFilter({ kind: "module", module: module.module })}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${
                      isActive({ kind: "module", module: module.module })
                        ? "bg-[#e9eafe] font-semibold text-accent"
                        : "font-semibold text-foreground hover:bg-white"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <MI icon={module.tabIcon} size={13} style={{ color: "#5E6AD2" }} />
                      <span className="truncate">{module.label}</span>
                    </span>
                    <span className="font-normal text-muted-foreground">{moduleTotal}</span>
                  </button>

                  <div className="mt-0.5 space-y-0.5 pl-4">
                    {module.submodules.map((submodule) => (
                      <button
                        key={submodule.id}
                        type="button"
                        onClick={() =>
                          setFilter({
                            kind: "submodule",
                            module: module.module,
                            submodule: submodule.id,
                          })
                        }
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${
                          isActive({
                            kind: "submodule",
                            module: module.module,
                            submodule: submodule.id,
                          })
                            ? "bg-[#e9eafe] font-semibold text-accent"
                            : "text-foreground hover:bg-white"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <MI icon={submodule.icon} size={12} style={{ color: "#6e6e80" }} />
                          <span className="truncate">{submodule.label}</span>
                        </span>
                        <span className="text-muted-foreground">{submodule.variables.length}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-white">
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold text-foreground">Mode 1</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{activeLabel}</div>
              </div>
              <span className="shrink-0 rounded-md bg-background px-2 py-1 text-[11px] text-muted-foreground">
                {filteredVariables.length} variables
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(128px,0.72fr)] border-b border-border bg-[#fbfbfc] px-4 py-2 text-[11px] font-semibold text-foreground">
            <span>Name</span>
            <span>Value</span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filteredVariables.map((variable) => (
              <div
                key={variable.id}
                className="grid grid-cols-[minmax(0,1fr)_minmax(128px,0.72fr)] items-center gap-4 border-b border-border px-4 py-2.5 last:border-b-0"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {variable.type === "COLOR" ? (
                    <span
                      className="h-5 w-5 shrink-0 rounded border border-border"
                      style={variable.preview ? { background: variable.preview } : undefined}
                    />
                  ) : variable.icon ? (
                    <MI icon={variable.icon} size={15} style={{ color: "#5E6AD2" }} />
                  ) : null}
                  <span className="truncate text-[11px] font-medium text-foreground">
                    {variable.name}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  {variable.type === "COLOR" && (
                    <span
                      className="h-4 w-4 shrink-0 rounded border border-border"
                      style={variable.preview ? { background: variable.preview } : undefined}
                    />
                  )}
                  {variable.type !== "COLOR" && variable.icon && (
                    <MI icon={variable.icon} size={13} style={{ color: "#6e6e80" }} />
                  )}
                  <span className="truncate text-[11px] text-muted-foreground">
                    {variable.displayValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function VisualDocumentationPreview({ isActive }: { isActive: boolean }) {
  const [activePreview, setActivePreview] = useState(0);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(
    typeof document !== "undefined" ? document.hidden : false,
  );
  const reduceMotion = useReducedMotion();
  const preview = VISUAL_DOC_PREVIEWS[activePreview] ?? VISUAL_DOC_PREVIEWS[0];

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsDocumentHidden(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (reduceMotion || !isActive || isHovered || isFocused || isDocumentHidden) return;

    const intervalId = window.setInterval(() => {
      setActivePreview((current) => (current + 1) % VISUAL_DOC_PREVIEWS.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [autoplayKey, isActive, isDocumentHidden, isFocused, isHovered, reduceMotion]);

  const restartAutoplay = () => {
    setAutoplayKey((current) => current + 1);
  };

  const goToPrevious = () => {
    setActivePreview((current) =>
      current === 0 ? VISUAL_DOC_PREVIEWS.length - 1 : current - 1,
    );
    restartAutoplay();
  };
  const goToNext = () => {
    setActivePreview((current) => (current + 1) % VISUAL_DOC_PREVIEWS.length);
    restartAutoplay();
  };

  return (
    <div
      className="relative flex w-full max-w-[846px] flex-col items-center px-12 sm:px-16"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      <button
        type="button"
        aria-label="Previous visual documentation preview"
        onClick={goToPrevious}
        className="absolute left-0 top-[calc(50%-32px)] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg text-accent transition-colors hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MI icon="chevron_left" size={28} style={{ color: "#5E6AD2" }} />
      </button>

      <div className="aspect-[846/500] w-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={preview.src}
            src={preview.src}
            alt={preview.alt}
            className="block h-full w-full object-cover object-top"
            loading="lazy"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label="Next visual documentation preview"
        onClick={goToNext}
        className="absolute right-0 top-[calc(50%-32px)] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg text-accent transition-colors hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MI icon="chevron_right" size={28} style={{ color: "#5E6AD2" }} />
      </button>

      <div className="mt-3 flex h-12 items-center justify-center">
        {VISUAL_DOC_PREVIEWS.map((item, index) => (
          <button
            key={item.src}
            type="button"
            aria-label={`Show visual documentation preview ${index + 1}`}
            aria-current={activePreview === index}
            onClick={() => {
              setActivePreview(index);
              restartAutoplay();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span
              className={`block h-3 w-3 rounded-full border border-accent transition-colors ${
                activePreview === index ? "bg-accent" : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function WhatYouGetPanel({ modules }: { modules: VariableModule[] }) {
  const [activeModuleId, setActiveModuleId] = useState("colors");
  const reduceMotion = useReducedMotion();
  const activeModule =
    modules.find((module) => module.module === activeModuleId) ?? modules[0];
  const total = modules.reduce((sum, module) => sum + moduleCount(module), 0);
  const description = activeModule
    ? WHAT_YOU_GET_DESCRIPTIONS[activeModule.module] ?? ""
    : "";

  return (
    <div className="w-full rounded-xl border border-border bg-white p-3 shadow-[0px_24px_64px_-18px_rgba(0,0,0,0.16)]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modules.map((module, index) => {
          const isActive = activeModule?.module === module.module;
          const count = moduleCount(module);

          return (
            <motion.button
              key={module.module}
              type="button"
              onClick={() => setActiveModuleId(module.module)}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduceMotion ? 0 : 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={`group min-h-[150px] rounded-lg border p-5 text-left transition-all duration-200 ${
                isActive
                  ? "border-accent bg-white shadow-[0px_12px_28px_-18px_rgba(0,0,0,0.35)]"
                  : "border-border bg-white hover:border-accent/30 hover:bg-muted/20"
              }`}
            >
              <span
                className={`mb-6 flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${
                  isActive ? "border-accent/25 bg-accent/10" : "border-border bg-[#eef0ff]"
                }`}
              >
                <MI icon={module.tabIcon} size={24} style={{ color: "#2530B8" }} />
              </span>
              <span className="block text-2xl font-extrabold leading-none text-foreground">
                {count}
              </span>
              <span className="mt-2 block text-sm font-semibold text-muted-foreground">
                {module.label === "Colors" ? "Colors Tokens" : module.label === "Layout" ? "Layout Tokens" : module.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-white p-5 transition-all duration-200 sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeModule?.module ?? "empty"}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <h3 className="text-base font-bold text-foreground">
                  {activeModule?.label === "Colors"
                    ? "Colors Tokens"
                    : activeModule?.label === "Layout"
                      ? "Layout Tokens"
                      : activeModule?.label}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <MI icon={activeModule?.tabIcon ?? "database"} size={13} style={{ color: "#5E6AD2" }} />
                {activeModule ? moduleCount(activeModule) : total} variables
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {activeModule?.submodules.map((submodule, index) => (
                <motion.div
                  key={submodule.id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2.5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <MI icon={submodule.icon} size={15} style={{ color: "#5E6AD2" }} />
                    <span className="truncate text-sm font-medium text-foreground">
                      {submodule.label}
                    </span>
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                    {submodule.variables.length}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <a
        href="#pricing"
        onClick={() => trackPricingClick()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
      >
        <MI icon="bolt" size={14} style={{ color: "#fff" }} />
        Generate Variables
      </a>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Capture URL parameters from plugin (user_id or email)
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [variableModules, setVariableModules] = useState<VariableModule[]>(EMPTY_MODULES);
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroGridY = useSpring(useTransform(heroScroll, [0, 1], [0, 24]), {
    stiffness: 80,
    damping: 24,
    mass: 0.35,
  });
  // Handle hash scrolling for navigation from other pages
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        // Pequeno atraso para garantir a renderização do DOM
        setTimeout(() => {
          element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get('user_id');
    const emailParam = params.get('email');
    const planParam = params.get('plan');

    if (userIdParam) {
      setUserId(userIdParam);
      // Rolar automaticamente para a secção de preços
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }, 100);
    }
    if (emailParam) setEmail(emailParam);

    // Se o parâmetro plan existir e for válido, aciona o redirecionamento automático
    if (planParam === 'monthly' || planParam === 'lifetime') {
      setIsRedirecting(true);
      // Pequeno timeout para garantir que o estado do React foi atualizado antes do fetch
      setTimeout(() => {
        handlePayment(planParam, emailParam, userIdParam);
      }, 500);
    }
  }, []); // Dependências vazias para rodar apenas na montagem

  useEffect(() => {
    let mounted = true;

    loadPreset().then(({ modules }) => {
      if (mounted) setVariableModules(modules);
    }).catch((error) => {
      if (mounted) console.error('Unable to load the preset catalog.', error);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Stripe Checkout API configuration
  const SUPABASE_URL = "https://lyexuguaeuwdtjeqwmst.supabase.co";
  const CREATE_CHECKOUT_FUNCTION = `${SUPABASE_URL}/functions/v1/create-checkout-session`;

  const handlePayment = async (plan: 'monthly' | 'lifetime', passedEmail?: string | null, passedUserId?: string | null) => {
    trackCheckoutStarted(plan);
    try {
      const response = await fetch(CREATE_CHECKOUT_FUNCTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sb_publishable_BJYVAnl9Arx7gEcHOXzHfA_Bj4iJXGO`,
        },
        body: JSON.stringify({
          plan,
          email: passedEmail || email || undefined,
          userId: passedUserId || userId || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create checkout session - Response status:', response.status);
        console.error('Failed to create checkout session - Response body:', errorText);
        alert(`Failed to create checkout session (${response.status}). Please try again.`);
        return;
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        console.error('Response status:', response.status);
        console.error('Full response data:', data);
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      alert('Failed to create checkout session. Please try again.');
    }
  };

  const variableCards = variableModules.length
    ? variableModules.map((module) => ({
        icon: module.tabIcon,
        title: module.label,
        desc: FEATURES.find((feature) => feature.title === module.label)?.desc ?? "",
        count: moduleCount(module),
        previews: allVariables([module]).slice(0, 4),
      }))
    : FEATURES.map((feature) => ({ ...feature, count: 0, previews: [] as VariableItem[] }));

  const totalVariables = variableModules.reduce((total, module) => total + moduleCount(module), 0);

  if (isRedirecting) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
        <h2 className="text-2xl font-semibold">Redirecting to secure checkout...</h2>
        <p className="text-muted-foreground mt-2">Please wait while we prepare your transaction.</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} id="hero" className="relative overflow-hidden py-20 lg:py-32">
        <motion.div
          className="absolute inset-0 pointer-events-none max-md:!transform-none"
          style={{ y: reduceMotion ? 0 : heroGridY }}
          aria-hidden="true"
        >
          <div
            className="absolute inset-[-48px]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
        </motion.div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: 0,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-center gap-14 lg:gap-24">
            <ScrollReveal className="max-w-3xl text-center lg:text-left">
              <div className="mb-7 flex justify-start">
                <SectionTag>· Design Tokens for Figma ·</SectionTag>
              </div>
              <h1 className="text-[46px] sm:text-[56px] lg:text-[72px] font-extrabold text-foreground leading-[0.98] mb-5">
                Start your design tokens from the framework you already use.
              </h1>
              <p className="text-[17px] text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Choose a preset, customize its foundations and generate native Figma Variables with visual documentation in seconds.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                <a
                  href="https://www.figma.com/community/plugin/1651310914400769393"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={trackInstallPlugin}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Install on Figma
                  <MI icon="arrow_forward" size={15} style={{ color: "#fff" }} />
                </a>
                <a
                  href="#how-it-works"
                  onClick={trackHeroCTA}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  See how it works
                </a>
              </div>
              <div className="mt-7 flex items-center gap-5 text-xs text-muted-foreground justify-center lg:justify-start flex-wrap">
                {["Framework Presets", "Native Figma Variables", "Visual Documentation"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <MI icon="check" size={13} style={{ color: "#5E6AD2" }} />
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">{catalog.presets.map(p => p.name).join(" · ")}</p>
            </ScrollReveal>

            <div className="shrink-0 w-full flex justify-center lg:justify-end">
              <Parallax distance={40}>
                <div className="origin-top scale-100 sm:scale-110 lg:scale-125 drop-shadow-2xl">
                  <PluginMockup />
                </div>
              </Parallax>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative overflow-hidden py-20 lg:py-28">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.55fr)_minmax(0,1fr)] gap-12 lg:gap-16 items-center">
            <ScrollReveal className="max-w-xl">
              <SectionTag>· Problem solved ·</SectionTag>
              <h2
                className="mt-2 text-3xl lg:text-5xl font-extrabold text-foreground leading-tight"
                            >
                Customize the values. Keep the framework structure.
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                StartTokens is a Figma plugin for customizing Design System Foundations. Choose framework presets, adjust Colors, Typography and Layout, and generate native Figma Variables with Visual Documentation.
              </p>
            </ScrollReveal>

            <div className="flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {variableCards.map((f, index) => (
                  <ScrollReveal key={f.title} delay={index * 0.08}>
                    <TiltCard depth={6} className="h-full">
                  <div
                    className="h-full p-6 border border-border rounded-xl bg-white hover:bg-muted/20 transition-colors group"
                  >
                    <div className="flex flex-col items-start gap-5">
                      <div
                        className="w-10 h-10 rounded-lg border border-border flex items-center justify-center shrink-0 group-hover:border-accent/40 transition-colors"
                        style={{ background: "rgba(94,106,210,0.05)" }}
                      >
                        <MI icon={f.icon} size={18} className="text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-2 w-full">
                        {f.previews.map((preview, index) => (
                          <span
                            key={preview.id}
                            className="h-8 rounded-md border border-border bg-background flex items-center justify-center"
                            style={preview.preview ? { background: preview.preview } : undefined}
                          >
                            {!preview.preview && (
                              <MI icon={preview.icon ?? f.icon} size={13} style={{ color: index === 0 ? "#5E6AD2" : "#6e6e80" }} />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                    </TiltCard>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="py-20 lg:py-28 bg-background border-t border-border"
      >
        <div className="max-w-[1680px] mx-auto px-6">
          <ScrollReveal className="mb-14 text-center">
            <span className="sr-only">
              How it works
            </span>
            <h2 className="text-[42px] lg:text-[54px] leading-none font-extrabold text-foreground">
              From zero to foundation in seconds
            </h2>
          </ScrollReveal>

          {/* Tabbed interface */}
          <div className="flex flex-col gap-6 items-center">
            {/* Tab buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {STEPS.map((step, index) => (
                <button
                  key={step.num}
                  aria-pressed={activeStep === index}
                  onClick={() => setActiveStep(index)}
                  className={`min-h-[122px] text-left border-b-2 px-0 py-3 transition-colors ${
                    activeStep === index
                      ? 'border-accent'
                      : 'border-transparent'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="font-sans text-2xl font-normal leading-none"
                      style={{ color: activeStep === index ? "#5E6AD2" : "#49494b" }}
                    >
                      {step.num}
                    </span>
                    <h3
                      className="text-2xl font-semibold leading-none text-foreground"
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="max-w-[347px] pt-2 text-base leading-[22.75px] text-muted-foreground">
                    {step.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="relative w-full min-h-[620px] sm:min-h-[590px]">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.num}
                  aria-hidden={activeStep !== index}
                  inert={activeStep !== index ? "" : undefined}
                  className="absolute inset-x-0 top-0 flex justify-center"
                  animate={{
                    opacity: activeStep === index ? 1 : 0,
                    y: reduceMotion ? 0 : activeStep === index ? 0 : 24,
                    scale: reduceMotion ? 1 : activeStep === index ? 1 : index === 2 ? 0.96 : 0.98,
                    pointerEvents: activeStep === index ? "auto" : "none",
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                  {index === 5 ? (
                    <div className="w-full flex flex-col items-center"><h3 className="text-2xl font-bold text-center">Variables you can see, not just generate.</h3><p className="mt-3 mb-5 max-w-2xl text-sm text-center text-muted-foreground">StartTokens automatically creates a Visual Foundations page from the same tokens generated as Figma Variables — organized by preset, module and token group. Colors, Typography and Layout reflect your customized values.</p><VisualDocumentationPreview isActive={activeStep === 5} /></div>
                  ) : index === 4 ? (
                    <div className="w-full max-w-4xl drop-shadow-2xl">
                      <VariablesPanelMockup modules={variableModules} />
                    </div>
                  ) : (
                    <div className="origin-top scale-100 sm:scale-110 lg:scale-125 drop-shadow-2xl">
                      <PluginMockup initialModule={index === 0 ? undefined : index === 1 ? "colors" : index === 2 ? "typography" : "layout"} />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 lg:py-28 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="mb-10 max-w-3xl">
            <SectionTag>· Simple pricing ·</SectionTag>
            <h2 className="mt-2 text-3xl lg:text-5xl font-extrabold text-foreground leading-tight">
              Choose your plan
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Unlock unlimited token generations with flexible pricing options.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Monthly */}
            <ScrollReveal>
            <div className="h-full rounded-xl border border-border bg-white p-7 lg:p-8">
              <div className="mb-7">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Monthly</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$5.99</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Pay monthly, cancel anytime.</p>
              </div>
              <button 
                onClick={() => { trackPricingClick('monthly'); handlePayment('monthly'); }}
                className="block w-full py-2.5 rounded-lg border border-border text-sm font-semibold text-center text-foreground hover:bg-muted transition-colors mb-7"
              >
                Get Started
              </button>
              <ul className="space-y-3">
                {MONTHLY_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <MI icon="check" size={15} className="shrink-0 text-muted-foreground" style={{ marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            </ScrollReveal>

            {/* Lifetime */}
            <ScrollReveal delay={0.08}>
            <TiltCard depth={3} className="h-full">
            <div
              className="h-full rounded-xl p-7 lg:p-8 relative overflow-hidden"
              style={{ border: "1.5px solid rgba(94,106,210,0.35)", background: "linear-gradient(135deg,rgba(94,106,210,0.04) 0%,rgba(94,106,210,0.01) 100%)" }}
            >
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: "#5E6AD2" }}>
                  Best Value
                </span>
              </div>
              <div className="mb-7">
                <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: "#5E6AD2" }}>Lifetime</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$49.90</span>
                </div>
                <p className="mt-1 text-xs font-medium" style={{ color: "#5E6AD2" }}>One-time payment</p>
                <p className="mt-2 text-sm text-muted-foreground">Pay once, own forever.</p>
              </div>
              <button 
                onClick={() => { trackPricingClick('lifetime'); handlePayment('lifetime'); }}
                className="block w-full py-2.5 rounded-lg text-sm font-semibold text-center text-white hover:opacity-90 transition-opacity mb-7" 
                style={{ background: "#5E6AD2" }}
              >
                Get Lifetime Access
              </button>
              <ul className="space-y-3">
                {LIFETIME_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                    <MI icon="check" size={15} className="shrink-0" style={{ color: "#5E6AD2", marginTop: 1 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            </TiltCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section id="what-you-get" className="py-20 lg:py-28 border-t border-border" style={{ background: "#F7F7F8" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,1fr)] gap-14 lg:gap-20 items-center">
            <ScrollReveal direction="left" className="flex-1 max-w-xl">
              <SectionTag>· What you get ·</SectionTag>
              <h2 className="mt-2 text-3xl lg:text-5xl font-extrabold text-foreground leading-tight">
                Native Figma Variables and visual documentation.
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Customize values without rebuilding or renaming the framework token structure. Get custom color scales, typography scale generation, layout foundations and Visual Documentation from your chosen preset.
              </p>
            </ScrollReveal>

            <div className="w-full flex justify-center lg:justify-end">
              <ScrollReveal direction="right" className="w-full max-w-xl">
                <TiltCard depth={3}>
                  <WhatYouGetPanel modules={variableModules} />
                </TiltCard>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        id="faq"
        className="py-24 border-t border-border"
        style={{ background: "#F7F7F8" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <ScrollReveal className="mb-12">
            <SectionTag>· FAQ ·</SectionTag>
            <h2
              className="mt-2 text-3xl font-bold text-foreground tracking-[-0.02em]"
            >
              Common questions
            </h2>
          </ScrollReveal>
          <ScrollReveal className="bg-white rounded-xl border border-border px-6">
            {FAQS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="get-started" className="py-28 border-t border-border relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(94,106,210,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(94,106,210,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <ScrollReveal className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="mb-7 flex justify-center">
            <SectionTag>· 1 free generation · No account required ·</SectionTag>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-[-0.03em] mb-5">
            Your framework. Your values.
            <br />
            <span style={{ color: "#5E6AD2" }}>Your foundations in Figma.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-9">
            Choose a preset, customize its token values and generate native Figma Variables with Visual Foundations documentation.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="#pricing" onClick={() => trackPricingClick('monthly')} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity">
              Get Started — $5.99/mo
              <MI icon="arrow_forward" size={15} style={{ color: "#fff" }} />
            </a>
            <a href="#pricing" onClick={() => trackPricingClick('lifetime')} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Lifetime — $49.90
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Monthly or Lifetime · Cancel anytime · Future updates included
          </p>
        </ScrollReveal>
      </section>
    </>
  );
}
