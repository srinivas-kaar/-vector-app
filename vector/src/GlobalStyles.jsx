export function GlobalStyles() {
    const css = `
    .glass-select { appearance: none; -webkit-appearance: none; -moz-appearance: none; backdrop-filter: saturate(140%) blur(12px); -webkit-backdrop-filter: saturate(140%) blur(12px); }
    .glass-select:focus { outline: none; }
    .theme-sunrise .glass-select { background: rgba(255,255,255,0.60); border: 1px solid rgba(209,213,219,1); color: #111; }
    .theme-sunset .glass-select { background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.25); color: #fff; }
    .theme-sunset .glass-select:disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); }
    .scroll-glass::-webkit-scrollbar { width: 10px; height: 10px; }
    .scroll-glass::-webkit-scrollbar-track { background: transparent; }
    .theme-sunrise .scroll-glass::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.45); border-radius: 9999px; }
    .theme-sunset  .scroll-glass::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.25); border-radius: 9999px; }
    .theme-sunrise .scroll-glass { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.25) transparent; }
    .theme-sunset  .scroll-glass { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.18) transparent; }
    .theme-sunrise .cal-selected { background-image: linear-gradient(135deg, #F6E500, #39B4E8); color: #111; }
    .theme-sunset  .cal-selected { background-image: linear-gradient(135deg, #C8102E, #001489); color: #fff; }
    .theme-sunrise .avatar-grad { background-image: linear-gradient(135deg, #F6E500, #39B4E8); color: #111; }
    .theme-sunset  .avatar-grad { background-image: linear-gradient(135deg, #C8102E, #001489); color: #fff; }
    .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .no-spinner[type=number] { -moz-appearance: textfield; }
  `;
    return <style>{css}</style>;
  }