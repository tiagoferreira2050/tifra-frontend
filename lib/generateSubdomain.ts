export function generateSubdomain(name: string): string {
  if (!name) return "";

  return name
    .toLowerCase()
    .normalize("NFD")                         // remove acentos
    .replace(/[\u0300-\u036f]/g, "")         // remove acentos
    .replace(/[^a-z0-9]+/g, "-")             // troca por "-"
    .replace(/^-+|-+$/g, "")                 // tira - do começo/fim
    .substring(0, 30);                       // limita tamanho
}
