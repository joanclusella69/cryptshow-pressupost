import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "Cryptshow · Pressupost",
  description: "Eina de gestió del pressupost del Cryptshow Festival",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Nav />
          <main style={{ flex: 1, padding: "32px 40px" }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
