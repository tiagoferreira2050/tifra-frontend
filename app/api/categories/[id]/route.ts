
      return NextResponse.json({ success: true });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Erro DELETE /categories/[id]:", err);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}
