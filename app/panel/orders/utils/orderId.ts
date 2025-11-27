// Gera ID interno sequencial - P-0001, P-0002, P-0003...
export function generateInternalOrderId(lastInternalId: string | null) {
  if (!lastInternalId) return "P-0001"; // Primeiro pedido da loja

  const num = parseInt(lastInternalId.replace("P-", ""), 10) + 1;
  return `P-${String(num).padStart(4, "0")}`;
}

// Converte ID do iFood para o padrão P-XXXX
export function transformIfoodOrderId(id: string | number) {
  return `P-${id}`;
}

// Decide automaticamente o ID baseado na origem
export function generateOrderId(options: {
  source: "tifra" | "ifood",
  ifoodId?: string | number,
  lastInternalId?: string | null
}) {
  if (options.source === "ifood") {
    return transformIfoodOrderId(options.ifoodId!);
  }

  return generateInternalOrderId(options.lastInternalId ?? null);
}
