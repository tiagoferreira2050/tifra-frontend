// app/store/[slug]/layout.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cardápio",
  description: "Cardápio online",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 
        Layout público da loja
        Header visual fica no page.tsx
        Aqui é só estrutura global
      */}

      <main>{children}</main>

      {/* 
        Footer futuro (opcional)
        Ex: direitos, powered by, etc
      */}
    </div>
  );
}
