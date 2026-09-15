"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Resum" },
  { href: "/moviments", label: "Despeses i ingressos" },
  { href: "/entrades", label: "Entrades" },
  { href: "/mercha", label: "Mercha" },
  { href: "/publicitat", label: "Publicitat" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: "linear-gradient(180deg, #1d140f, #241812)",
        borderRight: "1px solid var(--border)",
        padding: "28px 20px",
      }}
    >
      <div style={{ fontFamily: "Fraunces, serif", fontStyle: "italic", fontWeight: 600, fontSize: 26 }}>
        Cryptshow
      </div>
      <div className="eyebrow" style={{ marginBottom: 28 }}>Pressupost</div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              style={{
                padding: "9px 12px",
                fontSize: 14,
                textDecoration: "none",
                color: active ? "var(--text)" : "var(--text-dim)",
                borderLeft: active ? "2px solid var(--accent-wine)" : "2px solid transparent",
                background: active ? "rgba(140,48,56,0.12)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
