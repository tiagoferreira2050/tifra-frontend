"use client";

import { useEffect, useRef, useState } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
} from "@react-google-maps/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "search" | "map" | "form";

const libraries: ("places")[] = ["places"];

export default function AddressModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("search");
  const [position, setPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [address, setAddress] = useState({
    street: "",
    neighborhood: "",
    city: "",
    state: "",
    number: "",
    complement: "",
    reference: "",
  });

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  // ===============================
  // AUTOCOMPLETE
  // ===============================
  useEffect(() => {
    if (!open || !isLoaded || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "br" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setPosition({ lat, lng });
      setStep("map");

      const comps = place.address_components || [];

      const get = (type: string) =>
        comps.find((c) => c.types.includes(type))
          ?.long_name || "";

      setAddress((prev) => ({
        ...prev,
        street: get("route"),
        neighborhood: get("sublocality") || get("political"),
        city: get("administrative_area_level_2"),
        state: get("administrative_area_level_1"),
      }));
    });
  }, [open, isLoaded]);

  // ===============================
  // GEOLOCALIZAÇÃO
  // ===============================
  function handleUseMyLocation() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setStep("map");
      },
      () => alert("Não foi possível obter localização"),
      { enableHighAccuracy: true }
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-xl p-6 z-10">
        {/* FECHAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        {/* ================= SEARCH ================= */}
        {step === "search" && (
          <>
            <button
              onClick={handleUseMyLocation}
              className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold mb-4"
            >
              📍 Usar minha localização
            </button>

            <p className="text-sm text-gray-600 mb-2">
              Ou digite o novo endereço:
            </p>

            <input
              ref={inputRef}
              placeholder="Para onde?"
              className="w-full border rounded-lg py-3 px-4"
            />

            <p className="text-xs text-gray-400 mt-2 text-right">
              Powered by Google
            </p>
          </>
        )}

        {/* ================= MAP ================= */}
        {step === "map" && position && (
          <>
            <h3 className="font-semibold mb-2">
              Confirme sua localização
            </h3>

            <GoogleMap
              center={position}
              zoom={17}
              mapContainerStyle={{
                width: "100%",
                height: "300px",
                borderRadius: "12px",
              }}
            >
              <Marker position={position} />
            </GoogleMap>

            <button
              onClick={() => setStep("form")}
              className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
            >
              Confirmar localização
            </button>
          </>
        )}

        {/* ================= FORM ================= */}
        {step === "form" && (
          <>
            <input
              value={address.street}
              readOnly
              className="w-full border rounded px-3 py-2 mb-2"
            />

            <input
              value={address.neighborhood}
              readOnly
              className="w-full border rounded px-3 py-2 mb-2"
            />

            <div className="flex gap-2 mb-2">
              <input
                placeholder="Número"
                className="w-1/2 border rounded px-3 py-2"
                value={address.number}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    number: e.target.value,
                  })
                }
              />
              <input
                placeholder="Complemento"
                className="w-1/2 border rounded px-3 py-2"
                value={address.complement}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    complement: e.target.value,
                  })
                }
              />
            </div>

            <input
              placeholder="Ponto de referência"
              className="w-full border rounded px-3 py-2 mb-4"
              value={address.reference}
              onChange={(e) =>
                setAddress({
                  ...address,
                  reference: e.target.value,
                })
              }
            />

            <button
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
              onClick={() => {
                console.log("ENDEREÇO FINAL:", {
                  ...address,
                  position,
                });
                onClose();
              }}
            >
              Salvar endereço
            </button>
          </>
        )}
      </div>
    </div>
  );
}
