import type { Metadata } from "next";
import "./globals.css";
import "./polish.css";

export const metadata: Metadata = { title: "Gestão Vendas Tech", description: "Gestão comercial externa para equipes em campo" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
