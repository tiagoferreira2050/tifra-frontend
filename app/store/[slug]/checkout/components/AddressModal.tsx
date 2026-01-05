"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddressModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md bg-white rounded-xl p-6 z-10">
        {/* FECHAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        {/* USAR LOCALIZAÇÃO */}
        <button className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-4">
          📍 Usar minha localização
        </button>

        {/* BUSCA GOOGLE */}
        <p className="text-sm text-gray-600 mb-2">
          Ou digite o novo endereço:
        </p>

        <div className="relative">
          <input
            type="text"
            placeholder="Para onde?"
            className="w-full border rounded-lg py-3 px-10"
          />
          <span className="absolute left-3 top-3 text-gray-400">
            🔍
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-right">
          Powered by Google
        </p>
      </div>
    </div>
  );
}
