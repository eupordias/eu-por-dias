import os

# Create directory if not exists
os.makedirs(r'C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos', exist_ok=True)

css = """/* Bootstrap Custom Overrides & Tailwind Utilities Migration */
:root {
  --bs-primary: #d946ef;
  --bs-body-font-family: 'Outfit', sans-serif;
  --bs-primary-rgb: 217, 70, 239;
}

[data-bs-theme="dark"] {
  --bs-body-bg: #150d1e;
  --bs-body-color: #faf8fc;
}

/* Base Font */
body {
  font-family: var(--bs-body-font-family);
}
"""

colors = {
    'slate': ['#faf8fc', '#f3f0f7', '#e4ddeb', '#d0c3dd', '#b6a1c8', '#997eb0', '#816398', '#6a507d', '#584368', '#2c1e3a', '#150d1e'],
    'indigo': ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75', '#4a044e'],
    'emerald': ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22'],
    'amber': ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'],
    'red': ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#450a0a'],
    'blue': ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
    'pink': ['#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#500724'],
    'purple': ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87', '#3b0764'],
    'cyan': ['#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63', '#083344'],
    'teal': ['#f0fdfa', '#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a', '#042f2e'],
    'green': ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'],
    'orange': ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12', '#431407'],
    'yellow': ['#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12', '#3f2c06'],
    'rose': ['#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337', '#4c0519'],
    'fuchsia': ['#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9', '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75', '#4a044e'],
    'gray': ['#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827', '#030712'],
}

weights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
utilities = []

# Base Whites and Blacks
utilities.append(".text-white { color: #ffffff !important; }")
utilities.append(".bg-white { background-color: #ffffff !important; }")
utilities.append(".border-white { border-color: #ffffff !important; }")
utilities.append(".text-black { color: #000000 !important; }")
utilities.append(".bg-black { background-color: #000000 !important; }")
utilities.append(".border-black { border-color: #000000 !important; }")
utilities.append(".text-transparent { color: transparent !important; }")
utilities.append(".bg-transparent { background-color: transparent !important; }")
utilities.append(".border-transparent { border-color: transparent !important; }")

# Colors
for name, palette in colors.items():
    for i, weight in enumerate(weights):
        color_val = palette[i]
        utilities.append(f".text-{name}-{weight} {{ color: {color_val} !important; }}")
        utilities.append(f".bg-{name}-{weight} {{ background-color: {color_val} !important; }}")
        utilities.append(f".border-{name}-{weight} {{ border-color: {color_val} !important; }}")
        utilities.append(f".ring-{name}-{weight} {{ --tw-ring-color: {color_val}; }}")
        utilities.append(f".from-{name}-{weight} {{ --tw-gradient-from: {color_val} var(--tw-gradient-from-position); --tw-gradient-to: {color_val}00 var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }}")
        utilities.append(f".to-{name}-{weight} {{ --tw-gradient-to: {color_val} var(--tw-gradient-to-position); }}")
        utilities.append(f".via-{name}-{weight} {{ --tw-gradient-to: {color_val}00 var(--tw-gradient-to-position); --tw-gradient-stops: var(--tw-gradient-from), {color_val} var(--tw-gradient-via-position), var(--tw-gradient-to); }}")

        # Dark mode variants
        utilities.append(f"[data-bs-theme=\"dark\"] .dark\\:text-{name}-{weight} {{ color: {color_val} !important; }}")
        utilities.append(f"[data-bs-theme=\"dark\"] .dark\\:bg-{name}-{weight} {{ background-color: {color_val} !important; }}")
        utilities.append(f"[data-bs-theme=\"dark\"] .dark\\:border-{name}-{weight} {{ border-color: {color_val} !important; }}")

# Typography
typography = {
    'xs': ('0.75rem', '1rem'),
    'sm': ('0.875rem', '1.25rem'),
    'base': ('1rem', '1.5rem'),
    'lg': ('1.125rem', '1.75rem'),
    'xl': ('1.25rem', '1.75rem'),
    '2xl': ('1.5rem', '2rem'),
    '3xl': ('1.875rem', '2.25rem'),
    '4xl': ('2.25rem', '2.5rem'),
    '5xl': ('3rem', '1'),
    '6xl': ('3.75rem', '1'),
    '7xl': ('4.5rem', '1'),
    '[11px]': ('11px', '16px'),
    '[10px]': ('10px', '14px'),
    '[9px]': ('9px', '12px'),
}
for k, (sz, lh) in typography.items():
    utilities.append(f".text-{k} {{ font-size: {sz} !important; line-height: {lh} !important; }}")

utilities.append(".font-black { font-weight: 900 !important; }")
utilities.append(".font-bold { font-weight: 700 !important; }")
utilities.append(".font-semibold { font-weight: 600 !important; }")
utilities.append(".font-medium { font-weight: 500 !important; }")
utilities.append(".font-normal { font-weight: 400 !important; }")
utilities.append(".font-light { font-weight: 300 !important; }")

# Spacing Half-Steps
for step in ['1.5', '2.5', '3.5', '0.5']:
    rem = float(step) * 0.25
    utilities.append(f".gap-{step} {{ gap: {rem}rem !important; }}")
    utilities.append(f".p-{step} {{ padding: {rem}rem !important; }}")
    utilities.append(f".px-{step} {{ padding-left: {rem}rem !important; padding-right: {rem}rem !important; }}")
    utilities.append(f".py-{step} {{ padding-top: {rem}rem !important; padding-bottom: {rem}rem !important; }}")
    utilities.append(f".pt-{step} {{ padding-top: {rem}rem !important; }}")
    utilities.append(f".pb-{step} {{ padding-bottom: {rem}rem !important; }}")
    utilities.append(f".pl-{step} {{ padding-left: {rem}rem !important; }}")
    utilities.append(f".pr-{step} {{ padding-right: {rem}rem !important; }}")
    utilities.append(f".m-{step} {{ margin: {rem}rem !important; }}")
    utilities.append(f".mx-{step} {{ margin-left: {rem}rem !important; margin-right: {rem}rem !important; }}")
    utilities.append(f".my-{step} {{ margin-top: {rem}rem !important; margin-bottom: {rem}rem !important; }}")
    utilities.append(f".mt-{step} {{ margin-top: {rem}rem !important; }}")
    utilities.append(f".mb-{step} {{ margin-bottom: {rem}rem !important; }}")
    utilities.append(f".ml-{step} {{ margin-left: {rem}rem !important; }}")
    utilities.append(f".mr-{step} {{ margin-right: {rem}rem !important; }}")

# Sizing
sizes = {
    '0': '0px', 'px': '1px', '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem',
    '2': '0.5rem', '2.5': '0.625rem', '3': '0.75rem', '3.5': '0.875rem', '4': '1rem',
    '5': '1.25rem', '6': '1.5rem', '7': '1.75rem', '8': '2rem', '9': '2.25rem',
    '10': '2.5rem', '11': '2.75rem', '12': '3rem', '14': '3.5rem', '16': '4rem',
    '20': '5rem', '24': '6rem', '28': '7rem', '32': '8rem', '36': '9rem', '40': '10rem',
    '44': '11rem', '48': '12rem', '52': '13rem', '56': '14rem', '60': '15rem', '64': '16rem',
    '72': '18rem', '80': '20rem', '96': '24rem', 'full': '100%', 'screen': '100vw', 'auto': 'auto'
}
for k, v in sizes.items():
    utilities.append(f".w-{k} {{ width: {v} !important; }}")
    utilities.append(f".h-{k} {{ height: {v} !important; }}")
    utilities.append(f".size-{k} {{ width: {v} !important; height: {v} !important; }}")
utilities.append(".min-w-0 { min-width: 0px !important; }")
utilities.append(".min-h-0 { min-height: 0px !important; }")

# Max-width
max_widths = {
    'xs': '20rem', 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem',
    '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem'
}
for k, v in max_widths.items():
    utilities.append(f".max-w-{k} {{ max-width: {v} !important; }}")
utilities.append(".max-w-full { max-width: 100% !important; }")

# Rounding
roundings = {
    'none': '0px', 'sm': '0.125rem', 'md': '0.375rem', 'lg': '0.5rem',
    'xl': '0.75rem', '2xl': '1rem', '3xl': '1.5rem', 'full': '9999px'
}
for k, v in roundings.items():
    utilities.append(f".rounded-{k} {{ border-radius: {v} !important; }}")
utilities.append(".rounded { border-radius: 0.25rem !important; }")

# Z-index
for z in [0, 10, 20, 30, 40, 50, 'auto']:
    utilities.append(f".z-{z} {{ z-index: {z} !important; }}")

# Position helpers
utilities.append(".inset-0 { top: 0px; right: 0px; bottom: 0px; left: 0px; }")
utilities.append(".top-1\\/2 { top: 50%; }")
utilities.append(".left-1\\/2 { left: 50%; }")
utilities.append(".-translate-y-1\\/2 { transform: translateY(-50%) var(--tw-transform,); }")
utilities.append(".-translate-x-1\\/2 { transform: translateX(-50%) var(--tw-transform,); }")
utilities.append(".-translate-y-full { transform: translateY(-100%) var(--tw-transform,); }")

# Transitions
utilities.append(".transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }")
utilities.append(".transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }")
utilities.append(".transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }")
utilities.append(".transition-opacity { transition-property: opacity; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }")
utilities.append(".transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }")

for d in [75, 100, 150, 200, 300, 500, 700, 1000]:
    utilities.append(f".duration-{d} {{ transition-duration: {d}ms !important; }}")

# Cursor and interaction
utilities.append(".cursor-pointer { cursor: pointer !important; }")
utilities.append(".cursor-not-allowed { cursor: not-allowed !important; }")
utilities.append(".pointer-events-none { pointer-events: none !important; }")
utilities.append(".select-none { user-select: none !important; }")
utilities.append(".select-text { user-select: text !important; }")

# Animations
utilities.append("@keyframes pulse { 50% { opacity: .5; } }")
utilities.append(".animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }")
utilities.append("@keyframes spin { to { transform: rotate(360deg); } }")
utilities.append(".animate-spin { animation: spin 1s linear infinite; }")
utilities.append("@keyframes bounce { 0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); } 50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); } }")
utilities.append(".animate-bounce { animation: bounce 1s infinite; }")

# Backdrop blur
for k, v in {'sm': '4px', 'md': '12px', 'lg': '16px', 'xl': '24px'}.items():
    utilities.append(f".backdrop-blur-{k} {{ backdrop-filter: blur({v}) !important; }}")
utilities.append(".backdrop-blur { backdrop-filter: blur(8px) !important; }")

# Opacity & Rings
utilities.append(".ring-1 { box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), 0 0 transparent; --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color); }")
utilities.append(".ring-2 { box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), 0 0 transparent; --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); }")
utilities.append(".ring-white { --tw-ring-color: #fff; }")
utilities.append(".ring-black { --tw-ring-color: #000; }")

# Gradients
utilities.append(".bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }")
utilities.append(".bg-gradient-to-br { background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); }")
utilities.append(".bg-gradient-to-b { background-image: linear-gradient(to bottom, var(--tw-gradient-stops)); }")

# Space-between
for i in range(1, 13):
    rem = i * 0.25
    utilities.append(f".space-y-{i} > :not([hidden]) ~ :not([hidden]) {{ --tw-space-y-reverse: 0; margin-top: calc({rem}rem * calc(1 - var(--tw-space-y-reverse))); margin-bottom: calc({rem}rem * var(--tw-space-y-reverse)); }}")
    utilities.append(f".space-x-{i} > :not([hidden]) ~ :not([hidden]) {{ --tw-space-x-reverse: 0; margin-right: calc({rem}rem * var(--tw-space-x-reverse)); margin-left: calc({rem}rem * calc(1 - var(--tw-space-x-reverse))); }}")

# Line height
utilities.append(".leading-none { line-height: 1; }")
utilities.append(".leading-tight { line-height: 1.25; }")
utilities.append(".leading-snug { line-height: 1.375; }")
utilities.append(".leading-normal { line-height: 1.5; }")
utilities.append(".leading-relaxed { line-height: 1.625; }")
utilities.append(".leading-loose { line-height: 2; }")

# Letter spacing
utilities.append(".tracking-tighter { letter-spacing: -0.05em; }")
utilities.append(".tracking-tight { letter-spacing: -0.025em; }")
utilities.append(".tracking-normal { letter-spacing: 0em; }")
utilities.append(".tracking-wide { letter-spacing: 0.025em; }")
utilities.append(".tracking-wider { letter-spacing: 0.05em; }")
utilities.append(".tracking-widest { letter-spacing: 0.1em; }")

# Mix blend mode
utilities.append(".mix-blend-screen { mix-blend-mode: screen; }")

# Filters
utilities.append(".filter { filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow); }")
for k, v in {'sm': '4px', 'md': '12px', 'lg': '16px', 'xl': '24px'}.items():
    utilities.append(f".blur-{k} {{ --tw-blur: blur({v}); filter: var(--tw-blur); }}")

# Scrollbar
utilities.append(".scrollbar-none::-webkit-scrollbar { display: none; }")
utilities.append(".scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }")

# Aspect ratio
utilities.append(".aspect-video { aspect-ratio: 16 / 9; }")
utilities.append(".aspect-square { aspect-ratio: 1 / 1; }")

# Snap & scroll
utilities.append(".scroll-smooth { scroll-behavior: smooth; }")
utilities.append(".snap-x { scroll-snap-type: x var(--tw-scroll-snap-strictness); }")
utilities.append(".snap-y { scroll-snap-type: y var(--tw-scroll-snap-strictness); }")
utilities.append(".snap-mandatory { --tw-scroll-snap-strictness: mandatory; }")
utilities.append(".snap-proximity { --tw-scroll-snap-strictness: proximity; }")
utilities.append(".snap-start { scroll-snap-align: start; }")
utilities.append(".snap-end { scroll-snap-align: end; }")
utilities.append(".snap-center { scroll-snap-align: center; }")

# Selection
for name, palette in colors.items():
    for i, weight in enumerate(weights):
        color_val = palette[i]
        utilities.append(f".selection\\:bg-{name}-{weight} *::selection {{ background-color: {color_val}; }}")
        utilities.append(f".selection\\:text-{name}-{weight} *::selection {{ color: {color_val}; }}")
utilities.append(".selection\\:bg-white *::selection { background-color: #ffffff; }")
utilities.append(".selection\\:bg-black *::selection { background-color: #000000; }")

# Grid Layout
utilities.append(".grid { display: grid; }")
for i in range(1, 13):
    utilities.append(f".grid-cols-{i} {{ grid-template-columns: repeat({i}, minmax(0, 1fr)); }}")
    utilities.append(f".col-span-{i} {{ grid-column: span {i} / span {i}; }}")

# Overflow
utilities.append(".overflow-x-auto { overflow-x: auto; }")
utilities.append(".overflow-y-auto { overflow-y: auto; }")
utilities.append(".overflow-x-hidden { overflow-x: hidden; }")
utilities.append(".overflow-y-hidden { overflow-y: hidden; }")
utilities.append(".overflow-hidden { overflow: hidden; }")

# Group hover handling setup (simple demo for colors)
# Normally group-hover uses `.group:hover .group-hover\:text-X`
for name, palette in colors.items():
    for i, weight in enumerate(weights):
        color_val = palette[i]
        utilities.append(f".group:hover .group-hover\\:text-{name}-{weight} {{ color: {color_val} !important; }}")
        utilities.append(f"[data-bs-theme=\"dark\"] .group:hover .dark\\:group-hover\\:text-{name}-{weight} {{ color: {color_val} !important; }}")

full_css = css + "\\n" + "\\n".join(utilities)

with open(r'C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\bootstrap-custom.css', 'w', encoding='utf-8') as f:
    f.write(full_css)
print("CSS generated successfully")
