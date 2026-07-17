import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stats4Newbas · Conardos DownLeague",
  description: "Estadísticas, rankings y análisis de la liga privada Stats4Newbas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
