import { useId } from "react";

export type IconKind = "projects" | "journal" | "travel" | "about" | "resume" | "welcome";

// Original small vector illustrations: no platform emoji or remote icon assets.
export function DesktopIcon({ kind, size = 48 }: { kind: IconKind; size?: number }) {
  const id = useId().replaceAll(":", "");
  const paint = (name: string) => `url(#${id}-${name})`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-gold`} x2="0" y2="1"><stop stopColor="#fff0a3"/><stop offset=".45" stopColor="#ffd35a"/><stop offset="1" stopColor="#e8a929"/></linearGradient>
        <linearGradient id={`${id}-blue`} x2=".3" y2="1"><stop stopColor="#c8f3ff"/><stop offset=".45" stopColor="#49b5ec"/><stop offset="1" stopColor="#0863ad"/></linearGradient>
        <linearGradient id={`${id}-paper`} x2=".3" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#cddde8"/></linearGradient>
        <radialGradient id={`${id}-globe`} cx=".32" cy=".25" r=".8"><stop stopColor="#a3edff"/><stop offset=".55" stopColor="#259bd6"/><stop offset="1" stopColor="#1059a3"/></radialGradient>
      </defs>
      <ellipse cx="32" cy="58" rx="24" ry="3" fill="#072b50" opacity=".25"/>
      {kind === "projects" && <>
        <path d="M6 16h21l5 6h25v31H6Z" fill={paint("gold")} stroke="#a97618"/>
        <path d="M12 18h38v30H12Z" fill={paint("paper")} stroke="#9fb5c5"/>
        <path d="M6 29h53l-6 26H9Z" fill={paint("gold")} stroke="#b48529"/>
        <path d="M10 32h45" stroke="#fff5c0" strokeWidth="2"/>
      </>}
      {(kind === "journal" || kind === "resume") && <>
        <path d="M15 7h29l8 9v39H15Z" fill={paint("paper")} stroke="#7f9caf"/>
        <path d="M44 7v10h8" fill="#eef7ff" stroke="#7f9caf"/>
        {kind === "journal" ? <><path d="M13 10h5v43h-5Z" fill="#4b9bc0"/>{[17,25,33,41].map(y=><path key={y} d={`M10 ${y}h9`} stroke="#516777" strokeWidth="2"/>)}</> : <><circle cx="27" cy="23" r="5" fill="#79a7c4"/><path d="M20 35q0-11 14 0" fill="#79a7c4"/></>}
        {[27,34,41,48].map(y=><path key={y} d={`M${kind === "journal" ? 24 : 37} ${y}h${kind === "journal" ? 20 : 8}`} stroke="#94aec0"/>)}
        {kind === "journal" && <path d="m48 25 6 3-13 26-6 4 0-7Z" fill="#edbb43" stroke="#93702a"/>}
      </>}
      {kind === "travel" && <>
        <circle cx="32" cy="30" r="24" fill={paint("globe")} stroke="#104f8a"/>
        <path d="m16 13 9-4 7 7-5 9-8 1-3 8-7-6 1-8Zm19 16 12-7 7 8-7 6-2 12-7 5-4-15Z" fill="#8dce6b" stroke="#5a9f56"/>
        <ellipse cx="32" cy="30" rx="12" ry="23" fill="none" stroke="#efffff" opacity=".35"/>
        <path d="M9 28h46M12 40h40" stroke="#efffff" opacity=".3"/>
        <path d="m41 47 16-5-9 13-2-5-5-3" fill="#fff" stroke="#8399b2"/>
      </>}
      {kind === "about" && <>
        <rect x="10" y="7" width="45" height="49" rx="3" fill={paint("paper")} stroke="#718eae"/>
        <rect x="14" y="11" width="37" height="40" fill={paint("blue")}/>
        <circle cx="33" cy="25" r="9" fill="#fff4d8" stroke="#c69b64"/>
        <path d="M19 49v-5q1-14 14-14t14 14v5" fill="#f5fafb"/>
        <path d="M24 22q0-13 13-8l5 9-6-6-12 5" fill="#77533e"/>
      </>}
      {kind === "welcome" && <>
        <rect x="5" y="9" width="54" height="37" rx="3" fill="#d9e5ec" stroke="#577b97" strokeWidth="2"/>
        <path d="M9 13h46v29H9Z" fill={paint("blue")}/>
        <path d="M29 47h7v7h10v4H18v-4h11Z" fill={paint("paper")} stroke="#718eae"/>
        <path d="m24 27 6 6 12-13" fill="none" stroke="white" strokeWidth="4"/>
      </>}
    </svg>
  );
}
