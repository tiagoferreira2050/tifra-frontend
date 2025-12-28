// app/store/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cardápio",
  description: "Cardápio online",
};

export default function StoreRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>{children}</main>
    </div>
  );
}
