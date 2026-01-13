export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Bem-vindo ao TIFRA</h1>

      <div className="mt-6 flex gap-4">
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </a>

        <a
          href="/panel/users"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Ir para painel (API)
        </a>
      </div>
    </main>
  );
}
