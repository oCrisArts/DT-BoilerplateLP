import { useRef, useState, useEffect } from "react";
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
    desc: "Generate color variables organized into Palette, Semantic and Tokens groups — ready to use immediately.",
  },
  {
    icon: "font_download",
    title: "Typography",
    desc: "Create font families, sizes, weights, line heights and typography tokens instantly.",
  },
  {
    icon: "grid_4x4",
    title: "Layout",
    desc: "Generate spacing, grid, radius and layout tokens structured and ready for production.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Choose a Module",
    desc: "Select Colors, Typography, Layout — or generate everything at once with a Full System.",
  },
  {
    num: "02",
    title: "Configure Your System",
    desc: "Customize colors, typography scales and layout settings to fit your project.",
  },
  {
    num: "03",
    title: "Generate Variables",
    desc: "Hit Generate. A complete Design System foundation is created inside Figma in seconds.",
  },
  {
    num: "04",
    title: "Visual Documentation",
    desc: "DT Boilerplate also creates an organized visual foundations page inside Figma.",
  },
];

const VISUAL_DOC_PREVIEWS = [
  {
    src: "/images/how-it-works/visual-doc-1.webp",
    alt: "Visual documentation carousel preview 1",
  },
  {
    src: "/images/how-it-works/visual-doc-2.webp",
    alt: "Visual documentation carousel preview 2",
  },
  {
    src: "/images/how-it-works/visual-doc-3.webp",
    alt: "Visual documentation carousel preview 3",
  },
];

const MONTHLY_FEATURES = [
  "Unlimited Generations",
  "Colors",
  "Typography",
  "Layout",
  "Variable Collections",
  "Visual Foundations Documentation",
  "Future Updates",
  "Priority Support",
];

const LIFETIME_FEATURES = [
  "Unlimited Generations",
  "Colors",
  "Typography",
  "Layout",
  "Variable Collections",
  "Visual Foundations Documentation",
  "Future Updates",
  "Priority Support",
  "One-time Payment",
];

const FAQS = [
  {
    q: "What does DT Boilerplate generate?",
    a: "Colors, Typography and Layout variables organized into structured collections and groups inside Figma Variables. Everything is ready to use immediately after generation.",
  },
  {
    q: "Does it use native Figma Variables?",
    a: "Yes. Everything is generated using the official Figma Variables system — no workarounds, no third-party dependencies.",
  },
  {
    q: "Can I edit generated variables?",
    a: "Yes. All generated variables remain fully editable native Figma Variables. You can rename, reorganize or extend them at any time.",
  },
  {
    q: "Do I need Design System experience?",
    a: "No. DT Boilerplate is designed to help any designer create a solid, production-ready foundation in seconds — no prior Design System expertise required.",
  },
];

// ── Plugin mockup SVG paths (from Figma import svg-fdvtc7n2dr.ts) ─────────────
const pluginSvgPaths = {
  p3542e280:
    "M4.81125 0.8175C4.71354 0.772931 4.6074 0.749866 4.5 0.749866C4.3926 0.749866 4.28646 0.772931 4.18875 0.8175L0.975 2.28C0.908456 2.30934 0.85188 2.3574 0.812161 2.41832C0.772442 2.47924 0.751295 2.5504 0.751295 2.62312C0.751295 2.69585 0.772442 2.76701 0.812161 2.82793C0.85188 2.88885 0.908456 2.93691 0.975 2.96625L4.1925 4.4325C4.29021 4.47707 4.39635 4.50013 4.50375 4.50013C4.61115 4.50013 4.71729 4.47707 4.815 4.4325L8.0325 2.97C8.09904 2.94066 8.15562 2.8926 8.19534 2.83168C8.23506 2.77076 8.2562 2.6996 8.2562 2.62688C8.2562 2.55415 8.23506 2.48299 8.19534 2.42207C8.15562 2.36115 8.09904 2.31309 8.0325 2.28375L4.81125 0.8175Z",
  p15348c00:
    "M0.75 4.5C0.749822 4.57173 0.770218 4.642 0.808769 4.70248C0.84732 4.76297 0.902407 4.81113 0.9675 4.84125L4.1925 6.3075C4.2897 6.35151 4.39517 6.37428 4.50187 6.37428C4.60858 6.37428 4.71405 6.35151 4.81125 6.3075L8.02875 4.845C8.09513 4.81516 8.15139 4.76666 8.19068 4.7054C8.22996 4.64414 8.25058 4.57277 8.25 4.5",
  p3defb690:
    "M0.75 6.375C0.749822 6.44673 0.770218 6.517 0.808769 6.57748C0.84732 6.63797 0.902407 6.68613 0.9675 6.71625L4.1925 8.1825C4.2897 8.22651 4.39517 8.24928 4.50187 8.24928C4.60858 8.24928 4.71405 8.22651 4.81125 8.1825L8.02875 6.72C8.09513 6.69016 8.15139 6.64166 8.19068 6.5804C8.22996 6.51914 8.25058 6.44777 8.25 6.375",
  p1e4f3d00:
    "M4.0625 7.1875C5.78839 7.1875 7.1875 5.78839 7.1875 4.0625C7.1875 2.33661 5.78839 0.9375 4.0625 0.9375C2.33661 0.9375 0.9375 2.33661 0.9375 4.0625C0.9375 5.78839 2.33661 7.1875 4.0625 7.1875Z",
  p1a7a3080:
    "M1.83333 6.41667C1.7466 6.41696 1.66156 6.39264 1.5881 6.34653C1.51464 6.30042 1.45577 6.23441 1.41834 6.15618C1.3809 6.07794 1.36643 5.99069 1.3766 5.90455C1.38678 5.81842 1.42119 5.73694 1.47583 5.66958L6.01333 0.994583C6.04737 0.955296 6.09375 0.928747 6.14487 0.919294C6.19598 0.909842 6.24879 0.918047 6.29463 0.942564C6.34046 0.967081 6.3766 1.00645 6.39711 1.05422C6.41762 1.10198 6.42129 1.1553 6.4075 1.20542L5.5275 3.96458C5.50155 4.03403 5.49284 4.10874 5.5021 4.18229C5.51137 4.25585 5.53834 4.32606 5.58071 4.3869C5.62307 4.44775 5.67956 4.4974 5.74533 4.53162C5.81111 4.56583 5.8842 4.58357 5.95833 4.58333H9.16667C9.2534 4.58304 9.33844 4.60736 9.4119 4.65347C9.48536 4.69958 9.54423 4.76559 9.58167 4.84382C9.6191 4.92206 9.63357 5.00931 9.6234 5.09545C9.61322 5.18158 9.57881 5.26306 9.52417 5.33042L4.98667 10.0054C4.95263 10.0447 4.90625 10.0713 4.85513 10.0807C4.80402 10.0902 4.75121 10.082 4.70537 10.0574C4.65954 10.0329 4.6234 9.99355 4.60289 9.94578C4.58238 9.89802 4.57871 9.8447 4.5925 9.79458L5.4725 7.03542C5.49845 6.96597 5.50716 6.89126 5.4979 6.81771C5.48863 6.74415 5.46166 6.67394 5.41929 6.6131C5.37693 6.55225 5.32044 6.5026 5.25467 6.46838C5.18889 6.43417 5.1158 6.41643 5.04167 6.41667H1.83333Z",
};

type VariableItem = {
  id: string;
  module: string;
  submodule: string;
  name: string;
  figmaName: string;
  type: "COLOR" | "FLOAT" | "STRING";
  value: string | number | { r: number; g: number; b: number; a: number };
  unit?: string;
  displayValue: string;
  icon?: string;
  preview?: string;
};

type VariableSubmodule = {
  id: string;
  label: string;
  icon: string;
  variables: VariableItem[];
};

type VariableModule = {
  module: string;
  label: string;
  tabIcon: string;
  submodules: VariableSubmodule[];
};

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
function PluginMockup({ modules = EMPTY_MODULES, initialModule = "colors" }: { modules?: VariableModule[]; initialModule?: string }) {
  const fallbackModule = modules[0];
  const initialModuleId = modules.some((module) => module.module === initialModule) ? initialModule : fallbackModule?.module ?? "";
  const [activeModule, setActiveModule] =
    useState<string>(initialModuleId);
  const [openSection, setOpenSection] =
    useState<string>(fallbackModule?.submodules[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [hoveredToken, setHoveredToken] = useState<
    string | null
  >(null);
  const [editingToken, setEditingToken] = useState<
    string | null
  >(null);
  const [tokenValues, setTokenValues] = useState<
    Record<string, string>
  >({});

  const currentModule = modules.find((module) => module.module === activeModule) ?? fallbackModule;

  useEffect(() => {
    const nextModule = modules.find((module) => module.module === initialModule) ?? fallbackModule;
    setActiveModule(nextModule?.module ?? "");
    setOpenSection(nextModule?.submodules[0]?.id ?? "");
    setSearch("");
    setEditingToken(null);
  }, [initialModule, modules, fallbackModule]);

  const handleTabClick = (mod: string) => {
    setActiveModule(mod);
    setOpenSection(modules.find((module) => module.module === mod)?.submodules[0]?.id ?? "");
    setSearch("");
    setEditingToken(null);
  };

  // Filter tokens in every section by the search query
  const filteredSections = (currentModule?.submodules ?? []).map(
    (section) => ({
      ...section,
      variables: search.trim()
        ? section.variables.filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase()),
          )
        : section.variables,
    }),
  );

  // If search has text, auto-expand sections that have matches
  const effectiveOpen = search.trim()
    ? (filteredSections.find((s) => s.variables.length > 0)?.id ??
      openSection)
    : openSection;

  const getDisplayValue = (token: VariableItem): string => {
    if (tokenValues[token.id]) return tokenValues[token.id];
    return token.displayValue;
  };

  const commitEdit = (id: string, value: string) => {
    setTokenValues((prev) => ({ ...prev, [id]: value }));
    setEditingToken(null);
  };

  return (
    <div
      className="bg-white relative rounded-[16px] select-none flex flex-col"
      style={{
        width: "300px",
        boxShadow:
          "0px 24px 64px -12px rgba(0,0,0,0.14), 0px 0px 0px 1px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* ── Window chrome ── */}
      <div
        className="bg-[#f7f7f8] rounded-tl-[16px] rounded-tr-[16px] shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="flex gap-[8px] items-center pb-[13px] pt-[12px] px-[16px]">
          <div className="flex gap-[6px] items-center shrink-0">
            <div className="bg-[#ff5f57] rounded-full w-[12px] h-[12px]" />
            <div className="bg-[#ffbd2e] rounded-full w-[12px] h-[12px]" />
            <div className="bg-[#28c840] rounded-full w-[12px] h-[12px]" />
          </div>
          <div className="flex-1 flex gap-[6px] items-center justify-center">
            <div className="bg-[#0c0c0d] rounded-[4px] w-[14px] h-[14px] flex items-center justify-center shrink-0">
              <svg
                width="9"
                height="9"
                viewBox="0 0 9 9"
                fill="none"
              >
                <path
                  d={pluginSvgPaths.p3542e280}
                  stroke="#FAFAFA"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="0.75"
                />
                <path
                  d={pluginSvgPaths.p15348c00}
                  stroke="#FAFAFA"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="0.75"
                />
                <path
                  d={pluginSvgPaths.p3defb690}
                  stroke="#FAFAFA"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="0.75"
                />
              </svg>
            </div>
            <span
              className="text-[11px] font-semibold whitespace-nowrap"
              style={{
                color: "rgba(12,12,13,0.7)",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              DT Boilerplate
            </span>
          </div>
          <span
            className="text-[9px] shrink-0"
            style={{
              color: "#6e6e80",
              fontFamily: "'Source Sans 3', sans-serif",
            }}
          >
            v0.1
          </span>
        </div>
      </div>

      {/* ── Module tabs (51px, icon + label) ── */}
      <div
        className="relative flex items-start shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        {modules.map((mod) => {
          const isActive = mod.module === activeModule;
          return (
            <button
              key={mod.module}
              onClick={() => handleTabClick(mod.module)}
              className="flex-1 relative flex flex-col items-center justify-center pb-[12px] pt-[8px] cursor-pointer"
              style={{
                height: "51px",
                borderBottom: `2px solid ${isActive ? "#5e6ad2" : "transparent"}`,
              }}
            >
              <MI
                icon={mod.tabIcon}
                size={14}
                style={{
                  color: isActive ? "#5e6ad2" : "#6e6e80",
                  marginBottom: 2,
                }}
              />
              <span
                className="text-[10px] font-medium leading-[15px] whitespace-nowrap"
                style={{
                  color: isActive ? "#5e6ad2" : "#6e6e80",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {mod.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="bg-white flex flex-col">
        {/* Search — always at top, functional */}
        <div className="p-[12px] shrink-0">
          <div
            className="flex gap-[8px] items-center px-[10px] rounded-[6px]"
            style={{ background: "#f2f2f4", height: "40px" }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              className="shrink-0"
            >
              <path
                d={pluginSvgPaths.p1e4f3d00}
                stroke="#6E6E80"
                strokeWidth="0.9375"
              />
              <path
                d="M6.5625 6.5625L8.75 8.75"
                stroke="#6E6E80"
                strokeLinecap="round"
                strokeWidth="0.9375"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tokens…"
              className="flex-1 bg-transparent outline-none text-[10px] leading-[15px] min-w-0"
              style={{
                color: "#6e6e80",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="shrink-0 flex items-center"
                tabIndex={-1}
              >
                <MI
                  icon="close"
                  size={12}
                  style={{ color: "#6e6e80" }}
                />
              </button>
            )}
          </div>
        </div>

        {/* Accordion sections */}
        {filteredSections.map((section) => {
          const isOpen = effectiveOpen === section.id;
          const hasTokens = section.variables.length > 0;

          return (
            <div
              key={section.id}
              style={{ background: "#fafafa" }}
            >
              {/* Section header */}
              <button
                onClick={() => {
                  setOpenSection(isOpen ? "" : section.id);
                  setEditingToken(null);
                }}
                className="h-[48px] w-full flex items-center gap-[8px] px-[12px] pb-[10px] pt-[9px] cursor-pointer"
                style={{ borderTop: "1px solid #eee6e6" }}
              >
                <MI
                  icon={section.icon}
                  size={13}
                  style={{
                    color: isOpen ? "#5e6ad2" : "#6e6e80",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="flex-1 text-[10px] font-medium leading-[15px] text-left whitespace-nowrap"
                  style={{
                    color: isOpen ? "#5e6ad2" : "#6e6e80",
                    fontFamily: "'Source Sans 3', sans-serif",
                  }}
                >
                  {section.label}
                </span>
                <MI
                  icon={isOpen ? "expand_less" : "expand_more"}
                  size={14}
                  style={{
                    color: isOpen ? "#5e6ad2" : "#6e6e80",
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* Token list */}
              {isOpen && hasTokens && (
                <div
                  className="pb-[8px] px-[12px]"
                  style={{
                    maxHeight: "168px",
                    overflowY: "auto",
                  }}
                >
                  {section.variables.map((token) => {
                    const displayValue = getDisplayValue(token);
                    const isEditing =
                      editingToken === token.id;
                    const isHovered =
                      hoveredToken === token.id;

                    return (
                      <div
                        key={token.id}
                        className="relative flex gap-[10px] items-center px-[8px] rounded-[6px] cursor-pointer"
                        style={{
                          minHeight: "40px",
                          background:
                            isHovered && !isEditing
                              ? "rgba(94,106,210,0.04)"
                              : undefined,
                        }}
                        onMouseEnter={() =>
                          setHoveredToken(token.id)
                        }
                        onMouseLeave={() =>
                          setHoveredToken(null)
                        }
                        onClick={() => {
                          if (!isEditing)
                            setEditingToken(token.id);
                        }}
                      >
                        {/* Swatch / icon */}
                        {token.type === "COLOR" ? (
                          <div
                            className="rounded-[4px] shrink-0"
                            style={{
                              width: 24,
                              height: 24,
                              background:
                                tokenValues[token.id] ||
                                token.preview ||
                                token.displayValue,
                              border:
                                "1px solid rgba(0,0,0,0.05)",
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-[4px] shrink-0 flex items-center justify-center"
                            style={{
                              width: 24,
                              height: 24,
                              border:
                                "1px solid rgba(0,0,0,0.05)",
                            }}
                          >
                            <MI
                              icon={token.icon ?? "token"}
                              size={10}
                              style={{ color: "#0c0c0d" }}
                            />
                          </div>
                        )}

                        {/* Name or edit input */}
                        {isEditing ? (
                          <input
                            autoFocus
                            className="flex-1 text-[10px] leading-[15px] outline-none border-b min-w-0"
                            style={{
                              borderColor: "#5e6ad2",
                              fontFamily: "'Source Sans 3', sans-serif",
                              color: "#0c0c0d",
                              background: "transparent",
                            }}
                            defaultValue={displayValue}
                            onClick={(e) => e.stopPropagation()}
                            onBlur={(e) =>
                              commitEdit(
                                token.id,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                commitEdit(
                                  token.id,
                                  e.currentTarget.value,
                                );
                              }
                              if (e.key === "Escape") {
                                setEditingToken(null);
                              }
                            }}
                          />
                        ) : (
                          <span
                            className="text-[10px] leading-[15px] truncate flex-1"
                            style={{
                              color: "#0c0c0d",
                              fontFamily: "'Source Sans 3', sans-serif",
                            }}
                          >
                            {token.name}
                          </span>
                        )}

                        {/* Hover value badge */}
                        {isHovered && !isEditing && (
                          <span
                            className="shrink-0 text-[9px] px-[6px] py-[2px] rounded-[4px] whitespace-nowrap"
                            style={{
                              background: "#0c0c0d",
                              color: "#fafafa",
                              fontFamily: "'Source Sans 3', sans-serif",
                              pointerEvents: "none",
                            }}
                          >
                            {displayValue}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty search state */}
              {isOpen && !hasTokens && search && (
                <div className="px-[12px] pb-[12px]">
                  <p
                    className="text-[10px] text-center py-3"
                    style={{
                      color: "#6e6e80",
                      fontFamily: "'Source Sans 3', sans-serif",
                    }}
                  >
                    No tokens match "{search}"
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div
        className="shrink-0"
        style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="flex flex-col pb-[12px] pt-[5px] px-[12px]">
          <div className="flex items-center justify-between w-full">
            <span
              className="text-[10px] leading-[15px]"
              style={{
                color: "#6e6e80",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              {moduleCount(currentModule ?? modules[0] ?? { module: "", label: "", tabIcon: "", submodules: [] })} variables
            </span>
            <span
              className="text-[10px] font-medium leading-[15px] cursor-pointer"
              style={{
                color: "#5e6ad2",
                fontFamily: "'Source Sans 3', sans-serif",
              }}
            >
              View all
            </span>
          </div>
          <div className="pt-[10px]">
            <a
              href="#pricing"
              onClick={() => trackPricingClick()}
              className="flex gap-[6px] items-center justify-center w-full rounded-[8px] hover:opacity-90 transition-opacity"
              style={{
                background: "#0c0c0d",
                height: "32.5px",
              }}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
              >
                <path
                  d={pluginSvgPaths.p1a7a3080}
                  stroke="#FAFAFA"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="0.916667"
                />
              </svg>
              <span
                className="text-[11px] font-semibold leading-[16.5px]"
                style={{
                  color: "#fafafa",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                Generate Variables
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
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
          Example Design System
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
              <span>DT Boilerplate</span>
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

function VisualDocumentationPreview() {
  const [activePreview, setActivePreview] = useState(0);
  const preview = VISUAL_DOC_PREVIEWS[activePreview] ?? VISUAL_DOC_PREVIEWS[0];
  const goToPrevious = () => {
    setActivePreview((current) =>
      current === 0 ? VISUAL_DOC_PREVIEWS.length - 1 : current - 1,
    );
  };
  const goToNext = () => {
    setActivePreview((current) => (current + 1) % VISUAL_DOC_PREVIEWS.length);
  };

  return (
    <div className="relative flex w-full max-w-[846px] flex-col items-center px-12 sm:px-16">
      <button
        type="button"
        aria-label="Previous visual documentation preview"
        onClick={goToPrevious}
        className="absolute left-0 top-[calc(50%-32px)] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-lg text-accent transition-colors hover:bg-accent/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MI icon="chevron_left" size={28} style={{ color: "#5E6AD2" }} />
      </button>

      <div className="aspect-[846/500] w-full overflow-hidden bg-white shadow-[0px_20px_20px_rgba(5,13,29,0.20)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={preview.src}
            src={preview.src}
            alt={preview.alt}
            className="block h-full w-full object-cover object-top"
            loading="lazy"
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
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
            onClick={() => setActivePreview(index)}
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
    const planParam = params.get('plan');

    if (userIdParam) {
      setUserId(userIdParam);
      // Rolar automaticamente para a secção de preços
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
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

    Promise.all([
      fetch("/data/colors.json").then((response) => response.json()),
      fetch("/data/typography.json").then((response) => response.json()),
      fetch("/data/layout.json").then((response) => response.json()),
    ]).then((modules) => {
      if (mounted) setVariableModules(modules as VariableModule[]);
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
                <SectionTag>· The fastest way to start a Design Tokens in Figma ·</SectionTag>
              </div>
              <h1 className="text-[46px] sm:text-[56px] lg:text-[72px] font-extrabold text-foreground leading-[0.98] mb-5">
                Stop Building Figma Variables From Scratch.
              </h1>
              <p className="text-[17px] text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Generate a Complete Design Tokens Starter in 30 Seconds.
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
                {["No credit card required", "Native Figma Variables", "No external dependencies"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <MI icon="check" size={13} style={{ color: "#5E6AD2" }} />
                    {t}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <div className="shrink-0 w-full flex justify-center lg:justify-end">
              <Parallax distance={40}>
                <div className="origin-top scale-100 sm:scale-110 lg:scale-125 drop-shadow-2xl">
                  <PluginMockup modules={variableModules} />
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
                Everything in one generation
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                DT Boilerplate creates the complete variable structure your Design System needs — Colors, Typography and Layout — organized and ready to build on.
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
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="mb-14 text-center">
            <span className="sr-only">
              How it works
            </span>
            <h2 className="text-[42px] lg:text-[54px] leading-none font-extrabold text-foreground">
              From zero to foundation in seconds
            </h2>
          </ScrollReveal>

          {/* Tabbed interface */}
          <div className="flex flex-col gap-10 items-center">
            {/* Tab buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1116px]">
              {STEPS.map((step, index) => (
                <button
                  key={step.num}
                  onClick={() => setActiveStep(index)}
                  className={`text-left p-0 border-b-2 pb-5 transition-all ${
                    activeStep === index
                      ? 'border-accent'
                      : 'border-border hover:border-accent/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-bold font-mono"
                      style={{ color: activeStep === index ? "#5E6AD2" : "#6e6e80" }}
                    >
                      {step.num}
                    </span>
                    <h3
                      className="text-sm font-semibold text-foreground"
                    >
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="relative w-full min-h-[660px] sm:min-h-[620px] lg:min-h-[590px]">
              {STEPS.map((step, index) => (
                <motion.div
                  key={step.num}
                  className="absolute inset-x-0 top-0 flex justify-center"
                  animate={{
                    opacity: activeStep === index ? 1 : 0,
                    y: reduceMotion ? 0 : activeStep === index ? 0 : 24,
                    scale: reduceMotion ? 1 : activeStep === index ? 1 : index === 2 ? 0.96 : 0.98,
                    pointerEvents: activeStep === index ? "auto" : "none",
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}
                >
                  {index === 3 ? (
                    <VisualDocumentationPreview />
                  ) : index === 2 ? (
                    <div className="w-full max-w-4xl drop-shadow-2xl">
                      <VariablesPanelMockup modules={variableModules} />
                    </div>
                  ) : (
                    <div className="origin-top scale-100 sm:scale-110 lg:scale-125 drop-shadow-2xl">
                      <PluginMockup modules={variableModules} initialModule={index === 0 ? "colors" : "typography"} />
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
              Unlock unlimited Design System generations with flexible pricing options.
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
                {totalVariables} variables and visual documentation.
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                Generate structured variables and an organized visual foundations page, ready inside Figma.
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
            The fastest way to start a
            <br />
            <span style={{ color: "#5E6AD2" }}>Design System in Figma.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto mb-9">
            Stop creating variables manually. Generate a complete, organized foundation in seconds and start building immediately.
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
