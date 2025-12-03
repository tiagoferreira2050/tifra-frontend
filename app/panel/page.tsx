export default function PanelHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bem-vindo ao Painel 🎉</h1>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold text-lg">Pedidos de Hoje</h2>
          <p className="text-2xl mt-2">0</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold text-lg">Faturamento Hoje</h2>
          <p className="text-2xl mt-2">R$ 0,00</p>
        </div>

        <div className="p-4 bg-white shadow rounded">
          <h2 className="font-bold text-lg">Clientes</h2>
          <p className="text-2xl mt-2">0</p>
        </div>
      </div>

      {/* Atalhos */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="font-bold text-lg mb-2">Atalhos Rápidos</h2>

        <div className="flex gap-3">
          <a
            href="/panel/cardapio"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cardápio
          </a>

          <a
            href="/panel/orders"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Pedidos
          </a>

          <a
            href="/panel/settings"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Configurações
          </a>
        </div>
      </div>
    </div>
  );
}
