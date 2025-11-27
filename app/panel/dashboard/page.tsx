export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">Em Análise</h2>
          <p className="text-3xl font-bold text-red-500">0</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">Em Preparo</h2>
          <p className="text-3xl font-bold text-orange-500">0</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold text-lg mb-2">Em Entrega</h2>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
      </div>
    </div>
  );
}