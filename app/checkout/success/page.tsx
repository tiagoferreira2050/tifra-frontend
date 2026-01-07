import { Suspense } from "react";
import CheckoutSuccessClient from "./success-client";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Carregando pedido…
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
