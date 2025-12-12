export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerName,
      customerPhone,
      customerAddress,
      items,           // [{ productId, quantity, unitPrice, complements }]
      paymentMethod,
      deliveryFee,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item no pedido" },
        { status: 400 }
      );
    }

    // 1️⃣ Criar ou reaproveitar cliente
    let customer = null;

    if (customerName) {
      customer = await prisma.customer.findFirst({
        where: { phone: customerPhone || "" },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone || "",
            address: customerAddress || "",
          },
        });
      }
    }

    // 2️⃣ Calcular total
    const totalItems = items.reduce(
      (acc: number, item: any) => acc + item.unitPrice * item.quantity,
      0
    );

    const total = totalItems + (deliveryFee || 0);

    // 3️⃣ Criar pedido
    const order = await prisma.order.create({
      data: {
        status: "analysis",
        total,
        paymentMethod: paymentMethod || null,
        deliveryFee: deliveryFee || 0,
        customerId: customer?.id || null,
      },
    });

    // 4️⃣ Criar itens do pedido
    await prisma.$transaction(
      items.map((item: any) =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            complements: item.complements || [],
          },
        })
      )
    );

    // 5️⃣ Buscar pedido completo para retornar ao frontend
    const fullOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 6️⃣ Normalizar formato para o gestor
    const normalized = {
      id: fullOrder!.id,
      status: fullOrder!.status,
      total: fullOrder!.total,
      paymentMethod: fullOrder!.paymentMethod,
      createdAt: fullOrder!.createdAt,

      customer: fullOrder!.customer?.name || "",
      phone: fullOrder!.customer?.phone || "",
      address: fullOrder!.customer?.address || "",
      shortAddress: fullOrder!.customer?.address?.split(",")[0] || "",

      items: fullOrder!.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        productName: i.product?.name,
        productPrice: i.product?.price,
        complements: i.complements || [],
      })),
    };

    return NextResponse.json(normalized, { status: 201 });
  } catch (err) {
    console.error("POST /orders error", err);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}
