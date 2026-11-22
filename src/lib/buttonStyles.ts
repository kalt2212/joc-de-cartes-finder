// Shared Tailwind class sets for buttons. Keeps hover, active, and focus-visible states consistent across the app.
export const BTN_BASE =
  'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200 ease-out active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100';

export const BTN_PRIMARY = `${BTN_BASE} rounded-full bg-stone-900 px-4 py-2 text-sm text-white shadow-sm hover:-translate-y-px hover:bg-stone-700 hover:shadow-md`;

export const BTN_SECONDARY = `${BTN_BASE} rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm text-stone-700 shadow-sm hover:border-stone-400 hover:bg-stone-100`;

export const BTN_GHOST = `${BTN_BASE} rounded-full px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900`;

export const BTN_ACTIVE = `${BTN_BASE} rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-200`;

export const BTN_MAP = `${BTN_BASE} rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100`;

export const BTN_ICON = `${BTN_BASE} h-7 w-7 rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900`;
