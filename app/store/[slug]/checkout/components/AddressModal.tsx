"use client";

import { useEffect, useRef, useState } from "react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "search" | "map" | "form";

const libraries: ("places")[] = ["places"];

export default function AddressModal({ open, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const [step, setStep] = useState<Step>("search");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loadingAddress, setLoadingAddress] = useState(false);

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
  // AUTOCOMPLETE (BUSCA)
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
      fillAddressFromComponents(place.address_components || []);
      setStep("map");
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

  // ===============================
  // REVERSE GEOCODE (MAP MOVE)
  // ===============================
  async function reverseGeocode(lat: number, lng: number) {
    setLoadingAddress(true);

    const geocoder = new google.maps.Geocoder();
    const res = await geocoder.geocode({
      location: { lat, lng },
    });

    if (res.results[0]) {
      fillAddressFromComponents(res.results[0].address_components);
    }

    setLoadingAddress(false);
  }

  function fillAddressFromComponents(
    components: google.maps.GeocoderAddressComponent[]
  ) {
    const get = (t: string) =>
      components.find((c) => c.types.includes(t))?.long_name || "";

    setAddress((prev) => ({
      ...prev,
      street: get("route"),
      neighborhood: get("sublocality") || get("political"),
      city: get("administrative_area_level_2"),
      state: get("administrative_area_level_1"),
    }));
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
            <button
              className="text-sm text-gray-500 mb-2"
              onClick={() => setStep("search")}
            >
              ← Voltar
            </button>

            <h3 className="font-semibold mb-2">
              {loadingAddress
                ? "Carregando endereço..."
                : address.street || "Ajuste o local no mapa"}
            </h3>

            <div className="relative">
              <GoogleMap
                center={position}
                zoom={17}
                mapContainerStyle={{
                  width: "100%",
                  height: "300px",
                  borderRadius: "12px",
                }}
                onLoad={(map) => (mapRef.current = map)}
                onIdle={() => {
                  if (!mapRef.current) return;

                  const center = mapRef.current.getCenter();
                  if (!center) return;

                  const lat = center.lat();
                  const lng = center.lng();

                  setPosition({ lat, lng });
                  reverseGeocode(lat, lng);
                }}
              />

              {/* PINO FIXO NO CENTRO */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-2xl">
                📍
              </div>
            </div>

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
            <button
              className="text-sm text-gray-500 mb-2"
              onClick={() => setStep("map")}
            >
              ← Voltar
            </button>

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
                  setAddress({ ...address, number: e.target.value })
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
