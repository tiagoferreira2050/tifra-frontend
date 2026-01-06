// app/(store)/store/[[...path]]/layout.tsx

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
    <>
      {/*
        ⚠️ MUITO IMPORTANTE
        Este layout NÃO deve conter:
        - CartProvider
        - CartModal
        - MiniCartBar
        - Header fixo
        - Footer fixo
        - Nenhum estado ou UI persistente

        Ele precisa ser NEUTRO para permitir
        navegação para /checkout, /login, etc
      */}
      {children}
    </>
  );
}
