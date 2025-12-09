export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: "Cloudinary não configurado corretamente" },
        { status: 500 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const uploaded = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: (() => {
          const data = new FormData();
          const blob = new Blob([buffer], { type: file.type });
          data.append("file", blob);
          data.append("upload_preset", uploadPreset);
          return data;
        })(),
      }
    ).then((res) => res.json());

    if (uploaded.error) {
      return NextResponse.json(
        { error: uploaded.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json(
      { error: "Erro ao enviar arquivo" },
      { status: 500 }
    );
  }
}
