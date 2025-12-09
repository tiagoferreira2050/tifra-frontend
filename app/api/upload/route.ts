import { NextResponse } from "next/server";

// IMPORTANTÍSSIMO: usar Node.js runtime
export const dynamic = "force-dynamic";
export const runtime = "nodejs";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const preset = process.env.CLOUDINARY_UPLOAD_PRESET;


     console.log("🧪 CLOUDINARY_CLOUD_NAME (server) =", process.env.CLOUDINARY_CLOUD_NAME);
     console.log("🧪 CLOUDINARY_UPLOAD_PRESET (server) =", process.env.CLOUDINARY_UPLOAD_PRESET);



    if (!cloudName || !preset) {
      console.error("Variáveis faltando:", { cloudName, preset });
      return NextResponse.json(
        { error: "Cloudinary não configurado" },
        { status: 500 }
      );
    }

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", preset);

    const upload = await fetch(uploadUrl, {
      method: "POST",
      body: data,
    });

    const json = await upload.json();

    if (!upload.ok) {
      console.error("Erro Cloudinary:", json);
      return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
    }

    return NextResponse.json({ url: json.secure_url });

  } catch (err: any) {
    console.error("Erro no /api/upload:", err);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
