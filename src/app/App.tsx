import { ACTIVE_PRICING_VERSION, type PaidPlan } from "../utils/pricing";
import PluginMockup from "./components/PluginMockup";
import { useRef, useState, useEffect, useId } from "react";
import { catalog, presetNames, loadPreset } from "@/data/presets";
import type { Module as VariableModule, Submodule as VariableSubmodule, Variable as VariableItem } from "@/data/preset-contract/types";
import { useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useScroll,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { trackHeroCTA, trackInstallPlugin, trackFAQExpand, trackCheckoutStarted, trackPricingClick, trackPricingView } from "../utils/analytics";

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
      className={`inline-flex items-center rounded-full border border-accent/25 bg-[#eceef9] px-[17px] py-[9px] text-base font-normal leading-none text-[#090c2e] max-w-full text-center ${className}`}
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
  stagger = false,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "left" | "right";
  delay?: number;
  stagger?: boolean;
}) {
  const offset = direction === "left"
    ? { x: -40, y: 0 }
    : direction === "right"
      ? { x: 40, y: 0 }
      : { x: 0, y: 40 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1], 
        delay,
        staggerChildren: stagger ? 0.15 : 0
      }}
    >
      {children}
    </motion.div>
  );
}

function StaggeredReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1], 
        delay,
        staggerChildren: 0.15
      }}
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
      style={{ y }}
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
  const safeDepth = Math.min(Math.abs(depth), 6);

  return (
    <motion.div
      className={`max-md:!transform-none ${className}`}
      style={{ transformStyle: "preserve-3d" }}
      whileHover={{
        rotateX: -safeDepth,
        rotateY: safeDepth,
        scale: 1.015,
      }}
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
  { num: "01", title: "Choose your preset", desc: `Start with ${presetNames}.` },
  { num: "02", title: "Make it yours", desc: "Customize colors, typography and layout while keeping the framework's token structure." },
  { num: "03", title: "Generate Variables", desc: "Create native Figma Variables and an organized Visual Foundations page from the same values." },
];

const INSTALL_URL = "https://www.figma.com/community/plugin/1651310914400769393";
function InstallButton() {
  return <a href={INSTALL_URL} target="_blank" rel="noopener noreferrer" onClick={trackInstallPlugin} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-white transition-opacity hover:opacity-90">Install on Figma <MI icon="arrow_forward" size={18} /></a>;
}
const PRESET_DESCRIPTIONS: Record<string, string> = {
  bootstrap: "Bootstrap foundations ready for Figma.",
  tailwindcss: "Native Tailwind color families and token conventions.",
  materialdesign: "Material Design foundations organized as Figma Variables.",
  bulma: "Bulma defaults ready to customize.",
  starttoken: "A framework-neutral starting point for new products.",
};
const NEW_PLANS = [
  { plan: 'free', title: 'Free', price: '$0', period: '', desc: 'Try StartTokens', cta: 'Generate for free' },
  { plan: 'monthly', title: 'Monthly', price: '$7.99', period: '/ month', desc: 'Best for occasional projects.', cta: 'Start Monthly' },
  { plan: 'annual', title: 'Annual', price: '$59.99', period: '/ year', desc: 'Best for designers', cta: 'Get Annual' },
  { plan: 'lifetime', title: 'Lifetime', price: '$99.90', period: 'one-time', desc: 'Pay once. Keep using', cta: 'Get Lifetime' },
] as const;

const VISUAL_DOC_PREVIEWS = [
  {
    src: "/images/how-it-works/visual-doc-1.jpg",
    alt: "StartTokens Visual Foundations — customized StartToken color scales and variable paths",
  },
  {
    src: "/images/how-it-works/visual-doc-2.jpg",
    alt: "StartTokens Visual Foundations — typography values and framework token names",
  },
  {
    src: "/images/how-it-works/visual-doc-3.jpg",
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
  { q: "What exactly does StartTokens generate?", a: "StartTokens generates native Figma Variables for Colors, Typography and Layout, plus an organized Visual Foundations documentation page from the same values." },
  { q: "Which presets can I use?", a: `${presetNames}.` },
  { q: "Will StartTokens rename my framework tokens?", a: "No. StartTokens preserves the original token structure and naming. You customize the values while keeping the framework conventions intact." },
  { q: "Can I try it before paying?", a: "Yes. Generate once for free, with no account required. Upgrade when StartTokens earns a place in your workflow." },
  { q: "Is this a complete component library or design system?", a: "No. StartTokens creates a foundation of design tokens and visual documentation. You build your components and design system on top of it." },
];

const EMPTY_MODULES: VariableModule[] = [];

function moduleCount(module: VariableModule) {
  return module.submodules.reduce((total: number, submodule: VariableSubmodule) => total + submodule.variables.length, 0);
}

function allVariables(modules: VariableModule[]) {
  return modules.flatMap((module: VariableModule) => module.submodules.flatMap((submodule: VariableSubmodule) => submodule.variables));
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
function HowItWorksTabs({ variableModules }: { variableModules: VariableModule[] }) {
  const tabsId = useId();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="mt-10">
      {/* Step headers as clickable tabs */}
      <div role="tablist" aria-label="How it works" className="grid gap-6 md:grid-cols-3 mb-10">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.num} delay={index * 0.08}>
            <div className="relative">
              <button
                role="tab"
                id={`${tabsId}-tab-${index}`}
                aria-selected={activeStep === index}
                aria-controls={`${tabsId}-panel`}
                tabIndex={activeStep === index ? 0 : -1}
                onKeyDown={event => {
                  if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                  event.preventDefault();
                  const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
                  setActiveStep(next);
                  document.getElementById(`${tabsId}-tab-${next}`)?.focus();
                }}
                onClick={() => setActiveStep(index)}
                className={`block h-full border-b-2 pb-4 text-left transition-all w-full ${
                  activeStep === index ? 'border-accent' : 'border-transparent hover:border-accent/50'
                }`}
              >
                <h3 className="text-xl font-semibold">{step.num} {step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">{step.desc}</p>
              </button>
              {activeStep === index && (
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-[2px] bg-accent"
                  layoutId="activeTabIndicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeStep}
          role="tabpanel"
          id={`${tabsId}-panel`}
          aria-labelledby={`${tabsId}-tab-${activeStep}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-w-0 justify-center"
        >
          <Parallax distance={12} className={activeStep === 2 ? 'w-full max-w-4xl' : ''}>
            {activeStep === 2 ? (
              <VariablesPanelMockup modules={variableModules} />
            ) : (
              <PluginMockup 
                className="sm:!w-[420px] sm:!h-[611px]" 
                initialModule={activeStep === 1 ? 'colors' : undefined} 
              />
            )}
          </Parallax>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? contentRef.current.scrollHeight : 0);
    }
  }, [open]);

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
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <MI
            icon="expand_more"
            size={18}
            className="shrink-0 text-muted-foreground"
          />
        </motion.div>
      </button>
      <motion.div
        id={answerId}
        aria-hidden={!open}
        initial={false}
        animate={{ height, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden"
      >
        <div ref={contentRef} className="pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {a}
          </p>
        </div>
      </motion.div>
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
  const reducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || reducedMotion || !isActive) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % VISUAL_DOC_PREVIEWS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, reducedMotion, isActive]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? VISUAL_DOC_PREVIEWS.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % VISUAL_DOC_PREVIEWS.length);
  };

  return (
    <div 
      className="relative flex w-full max-w-[1680px] flex-col items-center px-8 sm:px-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        type="button"
        aria-label="Previous slide"
        onClick={goToPrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-lg text-accent transition-all duration-500 ease-out hover:bg-accent/5"
      >
        <MI icon="chevron_left" size={28} style={{ color: "#5E6AD2" }} />
      </button>

      <div className="aspect-[1920/1080] w-full overflow-hidden lg:aspect-[1920/1080] rounded-lg">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={currentIndex}
            src={VISUAL_DOC_PREVIEWS[currentIndex].src}
            alt={VISUAL_DOC_PREVIEWS[currentIndex].alt}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        </AnimatePresence>
      </div>

      <button
        type="button"
        aria-label="Next slide"
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-lg text-accent transition-all duration-500 ease-out hover:bg-accent/5"
      >
        <MI icon="chevron_right" size={28} style={{ color: "#5E6AD2" }} />
      </button>

      <div className="mt-3 flex h-12 items-center justify-center gap-2">
        {VISUAL_DOC_PREVIEWS.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentIndex === index}
            onClick={() => setCurrentIndex(index)}
            className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-500 ease-out ${
              currentIndex === index ? "bg-accent/10" : "hover:bg-accent/5"
            }`}
          >
            <span
              className={`block h-3 w-3 rounded-full border border-accent transition-all duration-500 ease-out ${
                currentIndex === index ? "bg-accent scale-125" : "bg-transparent"
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
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.42, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={`group min-h-[150px] rounded-lg border p-5 text-left transition-all duration-500 ${
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
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
  const pricingVersion = ACTIVE_PRICING_VERSION;
  const pricingTracked = useRef(false);
  useEffect(() => {
    if (!pricingTracked.current) {
      trackPricingView(pricingVersion);
      pricingTracked.current = true;
    }
  }, [pricingVersion]);
  
  // Capture URL parameters from plugin (user_id or email)
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [variableModules, setVariableModules] = useState<VariableModule[]>(EMPTY_MODULES);
  const heroRef = useRef<HTMLElement>(null);
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
          element.scrollIntoView({ behavior: "smooth" });
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

    if (userIdParam) {
      setUserId(userIdParam);
      // Rolar automaticamente para a secção de preços
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    if (emailParam) setEmail(emailParam);

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

  const handlePayment = async (plan: PaidPlan, passedEmail?: string | null, passedUserId?: string | null) => {
    trackCheckoutStarted(plan, pricingVersion);
    try {
      const response = await fetch(CREATE_CHECKOUT_FUNCTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sb_publishable_BJYVAnl9Arx7gEcHOXzHfA_Bj4iJXGO`,
        },
        body: JSON.stringify({
          plan,
          pricingVersion,
          email: passedEmail || email || null,
          userId: passedUserId || userId || null
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
    } finally {
      setIsRedirecting(false);
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
      <section ref={heroRef} id="hero" className="relative overflow-hidden bg-linear-to-br from-[#414573] via-accent/90 to-[#8b94e0] py-20 lg:flex lg:min-h-[min(56.25vw,1080px)] lg:items-center">
        <div className="mx-auto grid w-full max-w-[1800px] items-center gap-12 px-5 sm:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-[60px]">
          <div className="space-y-6">
            <ScrollReveal delay={0}>
              <SectionTag>· The fastest way to start a Design Tokens in Figma ·</SectionTag>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="max-w-5xl text-4xl font-bold leading-[1.09] tracking-tight sm:text-5xl xl:text-[66px]">Stop rebuilding<br className="hidden lg:block" /> design tokens from scratch.</h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-xl font-light leading-relaxed sm:text-2xl xl:text-[36px]">Generate a Complete Design Tokens Starter in 30 Seconds.</p>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <InstallButton />
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.4} className="flex min-w-0 justify-center">
            <Parallax distance={16}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <PluginMockup className="sm:!w-[420px] sm:!h-[611px]" />
              </motion.div>
            </Parallax>
          </ScrollReveal>
        </div>
      </section>

      <section id="problem-solved" className="bg-accent/10 py-20 lg:py-36 xl:flex xl:min-h-[min(56.25vw,1080px)] xl:items-center">
        <div className="mx-auto grid w-full max-w-[1800px] gap-10 px-5 sm:px-10 lg:px-[60px] xl:grid-cols-[minmax(0,0.64fr)_minmax(0,1fr)]">
          <ScrollReveal><SectionTag>· Problem solved ·</SectionTag><h2 className="mt-6 text-3xl font-light xl:text-[44px] leading-tight">Your framework already has a foundation.<strong className="mt-2 block text-4xl font-bold xl:text-[66px]">Why rebuild it in Figma?</strong></h2><p className="mt-6 text-lg leading-relaxed text-muted-foreground xl:text-2xl">Recreating color scales, typography, spacing, radius and breakpoints by hand takes time — and makes it easier for design and code to drift apart.</p></ScrollReveal>
          <div className="min-w-0"><StaggeredReveal className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Rebuilding', icon: 'palette', desc: 'Stop starting every project from an empty Variables collection.', icons: ['palette', 'gradient', 'diamond', 'format_line_spacing'] },
              { title: 'Renaming', icon: 'font_download', desc: 'Keep the framework conventions your development team already knows.', icons: ['font_download', 'format_size', 'format_bold', 'format_line_spacing'] },
              { title: 'Documenting', icon: 'grid_4x4', desc: 'Generate Visual Foundations from the same variables you create.', icons: ['grid_4x4', 'rounded_corner', 'space_bar', 'format_line_spacing'] },
            ].map((card, i) => <motion.div key={card.title} whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}><TiltCard className="h-full rounded-lg bg-card px-5 py-9 shadow-sm hover:shadow-lg hover:border-accent/50 transition-all duration-500 ease-out"><div className="mb-6 inline-flex rounded-lg border border-border bg-accent/10 p-4 text-accent"><MI icon={card.icon} size={30} /></div><h3 className="text-2xl font-bold">{card.title}</h3><p className="mt-3 min-h-24 text-base leading-relaxed">{card.desc}</p><div className="mt-6 grid grid-cols-4 gap-2">{card.icons.map(icon => <span key={icon} className="flex aspect-square items-center justify-center rounded-lg border border-accent/30 text-accent"><MI icon={icon} size={21} /></span>)}</div></TiltCard></motion.div>)}
          </StaggeredReveal><ScrollReveal><p className="mt-6 text-right text-xl font-light">Start from an existing system. Make it yours.</p></ScrollReveal></div>
        </div>
      </section>

      <section id="presets" className="py-20 lg:py-36 xl:flex xl:min-h-[min(56.25vw,1080px)] xl:items-center">
        <div className="mx-auto w-full max-w-[1800px] px-5 sm:px-10 lg:px-[60px]">
          <ScrollReveal><SectionTag>· Presets ·</SectionTag><h2 className="mt-6 text-3xl font-light xl:text-[44px]">Start from the stack your team already uses.</h2><p className="mt-6 text-lg text-muted-foreground xl:text-2xl">Choose a curated preset and customize its foundations without changing its original token structure.</p></ScrollReveal>
          <StaggeredReveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{catalog.presets.map((preset) => <motion.div key={preset.id} whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex h-full flex-col items-center rounded-lg border border-accent/25 bg-accent/10 p-6 text-center hover:shadow-lg hover:border-accent/50 transition-all duration-500 ease-out"><img src={`/images/presets/${preset.id === 'starttoken' ? 'starttokens' : preset.id}.svg`} alt="" width="40" height="40" className="size-10 object-contain" /><h3 className="mt-4 text-xl font-medium">{preset.name}</h3><p className="mt-3 text-base">{PRESET_DESCRIPTIONS[preset.id]}</p></motion.div>)}</StaggeredReveal>
          <ScrollReveal><p className="mt-6 text-center text-xl font-light">Choose a preset → Customize values → Generate</p></ScrollReveal>
        </div>
      </section>

      {pricingVersion === 'legacy' ? (
      <section id="pricing" data-pricing-version="legacy" className="py-20 lg:py-28 border-t border-border">
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
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-xl border border-border bg-white p-7 lg:p-8 hover:shadow-lg hover:border-accent/50 transition-all duration-500 ease-out"
            >
              <div className="mb-7">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Monthly</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$5.99</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Pay monthly, cancel anytime.</p>
              </div>
              <button 
                onClick={() => { trackPricingClick('monthly', pricingVersion); handlePayment('monthly'); }}
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
            </motion.div>
            </ScrollReveal>

            {/* Lifetime */}
            <ScrollReveal delay={0.08}>
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
            <TiltCard depth={3} className="h-full">
            <div
              className="h-full rounded-xl p-7 lg:p-8 relative overflow-hidden hover:shadow-lg transition-all duration-300"
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
                onClick={() => { trackPricingClick('lifetime', pricingVersion); handlePayment('lifetime'); }}
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
            </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      ) : (
      <section id="pricing" data-pricing-version="new" className="bg-[#05061a] py-20 text-[#eceef9] lg:py-36 xl:flex xl:min-h-[min(56.25vw,1080px)] xl:items-center">
        <div className="mx-auto grid w-full max-w-[1800px] gap-8 px-5 sm:px-10 lg:px-[60px] 2xl:grid-cols-[minmax(0,0.32fr)_minmax(0,1fr)]">
          <ScrollReveal><SectionTag>· Pricing ·</SectionTag><h2 className="mt-6 text-5xl font-bold xl:text-[66px]">Start free</h2><p className="mt-6 text-2xl font-light leading-relaxed xl:text-3xl">Generate once for free. Upgrade when StartTokens earns a place in your workflow.</p></ScrollReveal>
          <div className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-4">{NEW_PLANS.map((item, i) => <ScrollReveal key={item.plan} delay={i * 0.08}><motion.article 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-foreground hover:shadow-lg hover:border-accent/50 transition-all duration-300"
          >
            <span className="self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{item.title}</span><h3 className="mt-3 text-2xl font-bold">{item.title}</h3><p className="mt-1 min-h-12 text-base">{item.desc}</p>
            <p className="my-4 flex flex-wrap items-baseline gap-1"><strong className="text-[40px] leading-none">{item.price}</strong><span className="text-sm">{item.period}</span></p>
            <ul className="mb-6 space-y-3 text-base">{[item.plan === 'free' ? '1 complete generation' : 'Unlimited generation', 'All available presets', 'Colors, Typography and Layout', 'Native Figma Variables', 'Visual Documentation', 'No account required'].map(feature => <li key={feature} className="flex items-start gap-2"><span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-white"><MI icon="check" size={14} /></span>{feature}</li>)}</ul>
            {item.plan === 'free' ? <a href={INSTALL_URL} target="_blank" rel="noopener noreferrer" onClick={() => { trackPricingClick('free', pricingVersion); trackInstallPlugin(); }} className="mt-auto flex min-h-14 items-center justify-center rounded-lg bg-accent px-3 py-3 text-center text-base font-bold text-white hover:opacity-90">{item.cta}</a> : <button onClick={() => { trackPricingClick(item.plan, pricingVersion); void handlePayment(item.plan); }} className="mt-auto min-h-14 rounded-lg bg-accent px-3 py-3 text-base font-bold text-white hover:opacity-90">{item.cta}</button>}
          </motion.article></ScrollReveal>)}</div>
        </div>
      </section>)}

      <section id="how-it-works" className="bg-accent/10 py-16 lg:py-20">
        <div className="mx-auto max-w-[1800px] px-5 sm:px-10 lg:px-[60px]">
          <ScrollReveal className="text-center"><SectionTag>· How it works ·</SectionTag><h2 className="mt-6 text-3xl font-light xl:text-[44px]">From framework to<strong className="block text-4xl font-bold xl:text-[66px]">Figma foundation in 3 steps.</strong></h2></ScrollReveal>
          
          <HowItWorksTabs variableModules={variableModules} />
        </div>
      </section>

      <section id="features" className="py-20 lg:py-36">
        <div className="mx-auto grid max-w-[1800px] items-center gap-10 px-5 sm:px-10 lg:px-[60px] 2xl:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)]">
          <ScrollReveal><SectionTag>· Features ·</SectionTag><h2 className="mt-6 text-3xl font-light xl:text-[44px]">Customize the foundation<strong className="mt-4 block text-4xl font-bold xl:text-[66px] leading-tight">without breaking the framework.</strong></h2></ScrollReveal>
          <StaggeredReveal className="grid min-w-0 gap-6 lg:grid-cols-3">{FEATURES.map((feature) => <motion.div key={feature.title} whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex min-w-0 flex-col items-center"><h3 className="mb-4 text-xl font-semibold">{feature.title}</h3><PluginMockup initialModule={feature.title.toLowerCase() as 'colors' | 'typography' | 'layout'} /></motion.div>)}</StaggeredReveal>
        </div>
      </section>

      <section id="visual-docs" className="bg-[#05061a] py-20 text-[#eceef9] lg:py-24">
        <div className="mx-auto max-w-[1800px] px-5 sm:px-10 lg:px-[60px]">
          <ScrollReveal><SectionTag>· Visual Documentation ·</SectionTag><p className="mt-6 text-3xl font-light xl:text-[44px]">More than variables</p><h2 className="mt-6 text-4xl font-bold xl:text-[66px]">Your tokens document themselves.</h2></ScrollReveal>
          <ScrollReveal className="my-8 flex justify-center"><VisualDocumentationPreview isActive={true} /></ScrollReveal>
          <StaggeredReveal className="grid gap-8 md:grid-cols-3">{[
            ['Always aligned', 'Documentation reflects the values you generated.'],
            ['Easy to inspect', 'Colors, typography and layout are organized visually.'],
            ['Ready to share', 'Give designers and developers a readable reference inside Figma.'],
          ].map(([title, desc], i) => <div key={i}><h3 className="text-2xl font-semibold">{title}</h3><p className="mt-3 text-base">{desc}</p></div>)}</StaggeredReveal>
        </div>
      </section>

      <section id="faq" className="bg-accent/10 py-20 lg:py-36 xl:flex xl:min-h-[min(56.25vw,1080px)] xl:items-center">
        <div className="mx-auto grid w-full max-w-[1800px] items-center gap-10 px-5 sm:px-10 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,1fr)] lg:px-[60px]">
          <ScrollReveal><SectionTag>· FAQ ·</SectionTag><h2 className="mt-6 text-3xl font-light xl:text-[44px]">Common questions</h2></ScrollReveal>
          <ScrollReveal className="min-w-0 rounded-xl border border-border bg-card px-6">{FAQS.map(item => <FAQItem key={item.q} {...item} />)}</ScrollReveal>
        </div>
      </section>
      <section id="get-started" className="bg-foreground py-28 text-background lg:py-44">
        <ScrollReveal className="mx-auto max-w-6xl px-5 text-center"><h2 className="text-3xl font-light xl:text-[44px]">Your framework already gives you the foundation.<strong className="mt-6 block text-4xl font-bold xl:text-[66px]">Start designing from it.</strong></h2><div className="mt-8"><InstallButton /></div></ScrollReveal>
      </section>
    </>
  );
}
