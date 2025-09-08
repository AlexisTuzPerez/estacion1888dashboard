import "../../globals.css";

export const metadata = {
  title: "Estación 1888 Dashboard",
  description: "Dashboard para Estación 1888",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
