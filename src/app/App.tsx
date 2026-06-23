import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: "palette",
    title: "Colors Foundation",
    desc: "Generate color variables organized into Palette, Semantic and Tokens groups — ready to use immediately.",
  },
  {
    icon: "font_download",
    title: "Typography Foundation",
    desc: "Create font families, sizes, weights, line heights and typography tokens instantly.",
  },
  {
    icon: "grid_4x4",
    title: "Layout Foundation",
    desc: "Generate spacing, grid, radius and layout tokens structured and ready for production.",
  },
  {
    icon: "folder_open",
    title: "Organized Variable Collections",
    desc: "Automatically create clean collections and groups inside Figma Variables. No manual setup.",
  },
  {
    icon: "variable_insert",
    title: "Native Figma Variables",
    desc: "Built entirely using the official Figma Variables system. No workarounds, no external dependencies.",
  },
  {
    icon: "bolt",
    title: "Ready in Seconds",
    desc: "Start new projects faster without manually creating hundreds of variables from scratch.",
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
];

const MONTHLY_FEATURES = [
  "Unlimited Generations",
  "Colors",
  "Typography",
  "Layout",
  "Variable Collections",
  "Future Updates",
  "Priority Support",
];

const LIFETIME_FEATURES = [
  "Unlimited Generations",
  "Colors",
  "Typography",
  "Layout",
  "Variable Collections",
  "Future Updates",
  "Priority Support",
  "One-time Payment",
];

const FAQS = [
  {
    q: "What does DS Boilerplate generate?",
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
    a: "No. DS Boilerplate is designed to help any designer create a solid, production-ready foundation in seconds — no prior Design System expertise required.",
  },
];

const RESULT_MODULES = [
  { label: "Colors",     count: 65,  icon: "palette" },
  { label: "Typography", count: 24,  icon: "font_download" },
  { label: "Layout",     count: 41,  icon: "grid_4x4" },
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

// ── Plugin mockup data ────────────────────────────────────────────────────────
type ColorToken = {
  type: "color";
  name: string;
  color: string;
};
type IconToken = { type: "icon"; name: string; icon: string };
type Token = ColorToken | IconToken;

type Section = {
  id: string;
  icon: string;
  label: string;
  tokens: Token[];
};
type ModuleEntry = { varCount: string; sections: Section[] };

const MODULE_DATA: Record<string, ModuleEntry> = {
  Colors: {
    varCount: "18 variables",
    sections: [
      {
        id: "palette",
        icon: "palette",
        label: "Palette",
        tokens: [
          {
            type: "color",
            name: "MidnightDepth",
            color: "#05061a",
          },
          {
            type: "color",
            name: "MidnightDepth-900",
            color: "#090c2e",
          },
          {
            type: "color",
            name: "MidnightDepth-800",
            color: "#141852",
          },
          {
            type: "color",
            name: "MidnightDepth-700",
            color: "#1e2270",
          },
          {
            type: "color",
            name: "MidnightDepth-600",
            color: "#2d328e",
          },
          {
            type: "color",
            name: "MidnightDepth-500",
            color: "#5e6ad2",
          },
          {
            type: "color",
            name: "MidnightDepth-400",
            color: "#8b94e0",
          },
          {
            type: "color",
            name: "MidnightDepth-300",
            color: "#b3bcea",
          },
          {
            type: "color",
            name: "MidnightDepth-200",
            color: "#d5d9f3",
          },
          {
            type: "color",
            name: "MidnightDepth-100",
            color: "#eceef9",
          },
        ],
      },
      {
        id: "semantic",
        icon: "gradient",
        label: "Semantic",
        tokens: [
          { type: "color", name: "Danger", color: "#ef4444" },
          { type: "color", name: "Warning", color: "#f59e0b" },
          { type: "color", name: "Info", color: "#3b82f6" },
          { type: "color", name: "Sucess", color: "#22c55e" },
        ],
      },
      {
        id: "tokens",
        icon: "diamond",
        label: "Tokens",
        tokens: [
          {
            type: "color",
            name: "surface-primary",
            color: "#ffffff",
          },
          {
            type: "color",
            name: "bg-primary-dark",
            color: "#09092e",
          },
          {
            type: "color",
            name: "text-primary",
            color: "#0c0c0d",
          },
          {
            type: "color",
            name: "border-primary",
            color: "#e4e4e7",
          },
        ],
      },
    ],
  },

  Typography: {
    varCount: "22 variables",
    sections: [
      {
        id: "family",
        icon: "font_download",
        label: "Family",
        tokens: [
          {
            type: "icon",
            name: "font-family-sans",
            icon: "format_shapes",
          },
          {
            type: "icon",
            name: "font-family-icon",
            icon: "shapes",
          },
        ],
      },
      {
        id: "sizes",
        icon: "format_size",
        label: "Sizes",
        tokens: [
          {
            type: "icon",
            name: "caption",
            icon: "text_decrease",
          },
          {
            type: "icon",
            name: "small",
            icon: "text_decrease",
          },
          { type: "icon", name: "p", icon: "text_fields" },
          { type: "icon", name: "h6", icon: "text_fields" },
          { type: "icon", name: "h5", icon: "text_fields" },
          { type: "icon", name: "h4", icon: "text_increase" },
          { type: "icon", name: "h3", icon: "text_increase" },
          { type: "icon", name: "h2", icon: "text_increase" },
          { type: "icon", name: "h1", icon: "text_increase" },
          {
            type: "icon",
            name: "display-4",
            icon: "format_size",
          },
          {
            type: "icon",
            name: "display-3",
            icon: "format_size",
          },
          {
            type: "icon",
            name: "display-2",
            icon: "format_size",
          },
          {
            type: "icon",
            name: "display-1",
            icon: "format_size",
          },
        ],
      },
      {
        id: "weight",
        icon: "format_bold",
        label: "Weight",
        tokens: [
          {
            type: "icon",
            name: "font-weight-light",
            icon: "text_format",
          },
          {
            type: "icon",
            name: "font-weight-regular",
            icon: "text_format",
          },
          {
            type: "icon",
            name: "font-weight-medium",
            icon: "format_bold",
          },
          {
            type: "icon",
            name: "font-weight-bold",
            icon: "format_bold",
          },
        ],
      },
      {
        id: "lineheight",
        icon: "format_line_spacing",
        label: "Line Height",
        tokens: [
          {
            type: "icon",
            name: "LineHeight-tight",
            icon: "format_line_spacing",
          },
        ],
      },
      {
        id: "tokens",
        icon: "diamond",
        label: "Tokens",
        tokens: [
          {
            type: "icon",
            name: "text-primary",
            icon: "text_format",
          },
          {
            type: "icon",
            name: "text-secundary",
            icon: "text_format",
          },
        ],
      },
    ],
  },

  Layout: {
    varCount: "12 variables",
    sections: [
      {
        id: "grid",
        icon: "grid_4x4",
        label: "Grid",
        tokens: [
          {
            type: "icon",
            name: "columns-mobile",
            icon: "smartphone",
          },
          {
            type: "icon",
            name: "columns-tablet",
            icon: "tablet",
          },
          {
            type: "icon",
            name: "columns-desktop",
            icon: "desktop_windows",
          },
          { type: "icon", name: "gutters", icon: "space_bar" },
          { type: "icon", name: "padding", icon: "padding" },
          { type: "icon", name: "margin", icon: "margin" },
        ],
      },
      {
        id: "radius",
        icon: "rounded_corner",
        label: "Radius",
        tokens: [
          {
            type: "icon",
            name: "radius-sm",
            icon: "rounded_corner",
          },
          {
            type: "icon",
            name: "radius-lg",
            icon: "rounded_corner",
          },
        ],
      },
      {
        id: "space",
        icon: "space_bar",
        label: "Space",
        tokens: [
          {
            type: "icon",
            name: "spacing-4",
            icon: "swap_vert",
          },
          {
            type: "icon",
            name: "spacing-8",
            icon: "swap_vert",
          },
          {
            type: "icon",
            name: "spacing-12",
            icon: "swap_vert",
          },
          {
            type: "icon",
            name: "spacing-16",
            icon: "swap_vert",
          },
        ],
      },
    ],
  },
};

type ModuleKey = keyof typeof MODULE_DATA;

const MODULE_ICONS: Record<string, string> = {
  Colors: "palette",
  Typography: "font_download",
  Layout: "grid_4x4",
};

// ── Components ────────────────────────────────────────────────────────────────
function PluginMockup() {
  const [activeModule, setActiveModule] =
    useState<string>("Colors");
  const [openSection, setOpenSection] =
    useState<string>("palette");
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

  const modules = Object.keys(MODULE_DATA);
  const currentModule = MODULE_DATA[activeModule];

  const handleTabClick = (mod: string) => {
    setActiveModule(mod);
    setOpenSection(MODULE_DATA[mod].sections[0].id);
    setSearch("");
    setEditingToken(null);
  };

  // Filter tokens in every section by the search query
  const filteredSections = currentModule.sections.map(
    (section) => ({
      ...section,
      tokens: search.trim()
        ? (section.tokens as Token[]).filter((t) =>
            t.name.toLowerCase().includes(search.toLowerCase()),
          )
        : (section.tokens as Token[]),
    }),
  );

  // If search has text, auto-expand sections that have matches
  const effectiveOpen = search.trim()
    ? (filteredSections.find((s) => s.tokens.length > 0)?.id ??
      openSection)
    : openSection;

  const getDisplayValue = (token: Token): string => {
    if (tokenValues[token.name]) return tokenValues[token.name];
    return token.type === "color" ? token.color : token.icon;
  };

  const commitEdit = (name: string, value: string) => {
    setTokenValues((prev) => ({ ...prev, [name]: value }));
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
              DS Boilerplate
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
          const isActive = mod === activeModule;
          return (
            <button
              key={mod}
              onClick={() => handleTabClick(mod)}
              className="flex-1 relative flex flex-col items-center justify-center pb-[12px] pt-[8px] cursor-pointer"
              style={{
                height: "51px",
                borderBottom: `2px solid ${isActive ? "#5e6ad2" : "transparent"}`,
              }}
            >
              <MI
                icon={MODULE_ICONS[mod]}
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
                {mod}
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
          const hasTokens = section.tokens.length > 0;

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
                  {section.tokens.map((token) => {
                    const displayValue = getDisplayValue(token);
                    const isEditing =
                      editingToken === token.name;
                    const isHovered =
                      hoveredToken === token.name;

                    return (
                      <div
                        key={token.name}
                        className="relative flex gap-[10px] items-center px-[8px] rounded-[6px] cursor-pointer"
                        style={{
                          minHeight: "40px",
                          background:
                            isHovered && !isEditing
                              ? "rgba(94,106,210,0.04)"
                              : undefined,
                        }}
                        onMouseEnter={() =>
                          setHoveredToken(token.name)
                        }
                        onMouseLeave={() =>
                          setHoveredToken(null)
                        }
                        onClick={() => {
                          if (!isEditing)
                            setEditingToken(token.name);
                        }}
                      >
                        {/* Swatch / icon */}
                        {token.type === "color" ? (
                          <div
                            className="rounded-[4px] shrink-0"
                            style={{
                              width: 24,
                              height: 24,
                              background:
                                tokenValues[token.name] ||
                                token.color,
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
                              icon={token.icon}
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
                                token.name,
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                commitEdit(
                                  token.name,
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
              {currentModule.varCount}
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
            <button
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
            </button>
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
        onClick={() => setOpen(!open)}
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
export default function App() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Capture URL parameters from plugin (user_id or email)
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

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

  // Stripe Checkout API configuration
  const SUPABASE_URL = "https://lyexuguaeuwdtjeqwmst.supabase.co";
  const CREATE_CHECKOUT_FUNCTION = `${SUPABASE_URL}/functions/v1/create-checkout-session`;

  const handlePayment = async (plan: 'monthly' | 'lifetime', passedEmail?: string | null, passedUserId?: string | null) => {
    try {
      const response = await fetch(CREATE_CHECKOUT_FUNCTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          email: passedEmail || email || undefined,
          userId: passedUserId || userId || undefined
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    }
  };

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
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.028) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
            <div className="flex-1  text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background text-xs text-muted-foreground mb-7 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />
                The fastest way to start a Design System in Figma
              </div>
              <h1 className="text-[46px] lg:text-[58px] font-bold text-foreground tracking-[-0.03em] leading-[1.05] mb-6">
                Start your Design System{" "}
                <span style={{ color: "#5E6AD2" }}>in seconds.</span>
              </h1>
              <p className="text-[17px] text-muted-foreground leading-relaxed mb-9 max-w-md mx-auto lg:mx-0">
                Generate Colors, Typography and Layout variables automatically and create a structured Design System foundation directly inside Figma.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Generate Your First System Free
                  <MI icon="arrow_forward" size={15} style={{ color: "#fff" }} />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  See How It Works
                </a>
              </div>
              <div className="mt-7 flex items-center gap-5 text-xs text-muted-foreground justify-center lg:justify-start flex-wrap">
                {["1 free generation", "No account needed", "Native Figma Variables"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <MI icon="check" size={13} style={{ color: "#5E6AD2" }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 w-full flex justify-center lg:w-auto lg:justify-start">
              <div style={{ transform: "scale(min(1, calc((100vw - 2rem) / 300px)))", transformOrigin: "top center" }} className="lg:transform-none">
                <PluginMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <div className="border-y border-border py-4 bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Used by teams at
          </span>
          <div className="flex items-center gap-8 flex-wrap">
            {[
              "Notion",
              "Stripe",
              "Loom",
              "Vercel",
              "Linear",
            ].map((co) => (
              <span
                key={co}
                className="text-sm font-bold tracking-wide"
                style={{
                  color: "rgba(110,110,128,0.4)",
                  fontFamily: "'Source Sans 3', sans-serif",
                }}
              >
                {co}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <MI
                key={i}
                icon="star"
                size={13}
                fill={1}
                style={{ color: "#F59E0B" }}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">
              4.9 · 1,200+ installs
            </span>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 max-w-xl">
            <span className="text-[11px] font-mono text-accent uppercase tracking-[0.15em]">
              Features
            </span>
            <h2
              className="mt-2 text-3xl font-bold text-foreground tracking-[-0.02em]"
                          >
              Everything in one generation
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              DS Boilerplate creates the complete variable structure your Design System needs — Colors, Typography and Layout — organized and ready to build on.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 md:p-8 border-b border-r border-border hover:bg-muted/20 transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded-lg border border-border flex items-center justify-center mb-5 group-hover:border-accent/40 transition-colors"
                  style={{ background: "rgba(94,106,210,0.05)" }}
                >
                  <MI icon={f.icon} size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="py-24 border-t border-border" style={{ background: "#F7F7F8" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14 max-w-xl">
            <span className="text-[11px] font-mono text-accent uppercase tracking-[0.15em]">What you get</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground tracking-[-0.02em]">
              130 variables. Structured and ready.
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Everything organized automatically and ready to use inside Figma.
            </p>
          </div>

          {/* Preset result card */}
          <div className="rounded-2xl border border-border bg-white overflow-hidden max-w-2xl">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(94,106,210,0.08)" }}>
                  <MI icon="style" size={16} style={{ color: "#5E6AD2" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Example Design System</p>
                  <p className="text-xs text-muted-foreground">Generated in 2 seconds</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground tracking-tight">130</p>
                <p className="text-xs text-muted-foreground">variables total</p>
              </div>
            </div>

            {/* Module breakdown */}
            <div className="grid grid-cols-3 divide-x divide-border">
              {RESULT_MODULES.map((mod) => (
                <div key={mod.label} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MI icon={mod.icon} size={14} style={{ color: "#5E6AD2" }} />
                    <span className="text-xs font-medium text-muted-foreground">{mod.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{mod.count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">variables</p>
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="px-6 pb-6 pt-2 space-y-2.5">
              {RESULT_MODULES.map((mod) => (
                <div key={mod.label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{mod.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(mod.count / 130) * 100}%`, background: "#5E6AD2" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground w-6 text-right shrink-0">{mod.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="py-24 border-t border-border"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-mono text-accent uppercase tracking-[0.15em]">
              How it works
            </span>
            <h2 className="mt-2 text-3xl font-bold text-foreground tracking-[-0.02em]">
              From zero to foundation in seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            {/* Connector line desktop */}
            <div
              className="hidden md:block absolute h-px bg-border"
              style={{
                top: "20px",
                left: "calc(33.333% / 2 + 20px)",
                right: "calc(33.333% / 2 + 20px)",
              }}
            />
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center mb-6 relative z-10">
                  <span
                    className="text-xs font-bold font-mono"
                    style={{ color: "#5E6AD2" }}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className="text-sm font-semibold text-foreground mb-2"
                                  >
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <span className="text-[11px] font-mono text-accent uppercase tracking-[0.15em]">Pricing</span>
            <h2 className="mt-2 text-3xl font-bold text-foreground tracking-[-0.02em]">
              Choose your plan
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Unlock unlimited Design System generations with flexible pricing options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:max-w-2xl">
            {/* Monthly */}
            <div className="rounded-xl border border-border bg-white p-7">
              <div className="mb-7">
                <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">Monthly</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$5.99</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Pay monthly, cancel anytime.</p>
              </div>
              <button 
                onClick={() => handlePayment('monthly')}
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

            {/* Lifetime */}
            <div
              className="rounded-xl p-7 relative overflow-hidden"
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
                onClick={() => handlePayment('lifetime')}
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
          <div className="mb-12">
            <span className="text-[11px] font-mono text-accent uppercase tracking-[0.15em]">
              FAQ
            </span>
            <h2
              className="mt-2 text-3xl font-bold text-foreground tracking-[-0.02em]"
                          >
              Common questions
            </h2>
          </div>
          <div className="bg-white rounded-xl border border-border px-6">
            {FAQS.map((item) => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 border-t border-border relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(94,106,210,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(94,106,210,0.04) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono mb-7"
            style={{
              borderColor: "rgba(94,106,210,0.25)",
              color: "#5E6AD2",
              background: "rgba(94,106,210,0.06)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            1 free generation · No account required
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
            <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity">
              Get Started — $5.99/mo
              <MI icon="arrow_forward" size={15} style={{ color: "#fff" }} />
            </a>
            <a href="#pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Lifetime — $49.90
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Monthly or Lifetime · Cancel anytime · Future updates included
          </p>
        </div>
      </section>
    </>
  );
}