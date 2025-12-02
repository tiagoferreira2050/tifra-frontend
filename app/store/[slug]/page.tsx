// app/_store/[slug]/page.tsx
import prisma from "@/lib/prisma";
import Image from "next/image";

export default async function StorePage({ params }: any) {
  const { slug } = params;

  const store = await prisma.store.findUnique({
  where: { subdomain: slug },
  include: {
      categories: {
        orderBy: { order: "asc" },
        include: {
          products: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-bold">Loja não encontrada</h1>
      </div>
    );
  }

  return (
    <main className="w-full h-full bg-[#fafafa]">
      {/* HEADER ESTILO IFOOD */}
      <div className="relative w-full h-48">
        <Image
          src={store.coverImage || "/default-cover.jpg"}
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute bottom-[-32px] left-4 flex items-center gap-3">
          <Image
            src={store.logoUrl || "/placeholder.png"}
            alt="Logo"
            width={70}
            height={70}
            className="rounded-xl shadow-xl border bg-white"
          />

          <div>
            <h1 className="font-bold text-xl text-white drop-shadow-lg">
              {store.name}
            </h1>
            <p className="text-white text-sm opacity-90">
              {store.address}
            </p>
          </div>
        </div>
      </div>

      <div className="h-10" />

      {/* BARRA DESLIZÁVEL DE CATEGORIAS */}
      <div className="px-4 pb-2 overflow-x-auto whitespace-nowrap flex gap-3 no-scrollbar">
        {store.categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() =>
              document.getElementById(`cat-${cat.id}`)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              })
            }
            className="px-4 py-2 bg-white shadow-sm rounded-full text-sm font-medium"
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* LISTA DE CATEGORIAS E PRODUTOS */}
      <div className="px-4 pb-20">
        {store.categories.map((category: any) => (
          <div key={category.id} id={`cat-${category.id}`}>
            <h2 className="text-lg font-bold mt-8 mb-4">{category.name}</h2>

            <div className="flex flex-col gap-4">
              {category.products.map((product: any) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-start"
                >
                  {/* INFO DO PRODUTO */}
                  <div className="flex-1 pr-4">
                    <h3 className="font-semibold text-base">{product.name}</h3>

                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <p className="text-purple-600 font-bold text-lg mt-3">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>

                  {/* IMAGEM DO PRODUTO NO MODELO IFOOD */}
                  <Image
                    src={product.imageUrl || "/placeholder.png"}
                    alt={product.name}
                    width={110}
                    height={110}
                    className="rounded-lg object-cover border w-[110px] h-[110px]"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FIXO NA TELA – BOTÃO VER CARRINHO */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t shadow-xl">
        <button className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl text-lg">
          Ver carrinho
        </button>
      </div>
    </main>
  );
}
