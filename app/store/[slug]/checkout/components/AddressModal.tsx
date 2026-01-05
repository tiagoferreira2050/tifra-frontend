"use client";

import { useEffect, useRef } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

const libraries: ("places")[] = ["places"];

export default function AddressModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  // ===============================
  // AUTOCOMPLETE GOOGLE
  // ===============================
  useEffect(() => {
    if (!open) return;
    if (!isLoaded) return;
    if (!inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "br" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      console.log("ENDEREÇO SELECIONADO:", place);
      // aqui depois você salva endereço, lat/lng, etc
    });
  }, [isLoaded, open]);

  // ===============================
  // GEOLOCALIZAÇÃO
  // ===============================
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo navegador");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        console.log("LOCALIZAÇÃO:", latitude, longitude);

        // 🔥 depois você pode fazer reverse geocode aqui
      },
      () => {
        alert("Não foi possível obter sua localização");
      },
      { enableHighAccuracy: true }
    );
  }

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
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mb-4"
        >
          📍 Usar minha localização
        </button>

        {/* BUSCA GOOGLE */}
        <p className="text-sm text-gray-600 mb-2">
          Ou digite o novo endereço:
        </p>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder={
              loadError
                ? "Erro ao carregar Google Maps"
                : "Para onde?"
            }
            className="w-full border rounded-lg py-3 px-10"
            disabled={!isLoaded || !!loadError}
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
