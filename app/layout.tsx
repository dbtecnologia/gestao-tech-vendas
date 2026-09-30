import type { Metadata } from "next";
import "./globals.css";
import "./route-planner.css";
import "./polish.css";
import "./tempo-theme.css";

export const metadata: Metadata = { title: "Tempo | Gestão comercial", description: "Roteirização, custos e eficiência para equipes em campo" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
