type CarrinhoPageProps = {
  params: {
    slug: string;
  };
};

export default function CarrinhoPage({ params }: CarrinhoPageProps) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Carrinho da loja: {params.slug}</h1>
      <p>Aqui vai ficar o carrinho</p>
    </div>
  );
}
