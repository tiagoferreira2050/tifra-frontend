"use client";

import { useEffect, useRef, useState } from "react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";

export interface SavedAddress {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  number: string;
  reference?: string;
  lat: number;
  lng: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (address: SavedAddress) => void;
}

type Step = "search" | "map" | "form";

const libraries: ("places")[] = ["places"];

export default function AddressModal({ open, onClose, onSave }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef =
    useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const lastCenterRef = useRef<string | null>(null);

  const [step, setStep] = useState<Step>("search");
  const [position, setPosition] =
    useState<{ lat: number; lng: number } | null>(null);
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
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  /* ================= RESET AO ABRIR ================= */
  useEffect(() => {
    if (!open) return;

    setStep("search");
    setPosition(null);
    lastCenterRef.current = null;

    setAddress({
      street: "",
      neighborhood: "",
      city: "",
      state: "",
      number: "",
      complement: "",
      reference: "",
    });

    // limpa autocomplete antigo
    if (listenerRef.current) {
      listenerRef.current.remove();
      listenerRef.current = null;
    }

    autocompleteRef.current = null;
  }, [open]);

  /* ================= AUTOCOMPLETE (ROBUSTO) ================= */
  useEffect(() => {
    if (!open || !isLoaded || !inputRef.current) return;

    if (autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "br" },
        fields: ["geometry", "address_components"],
      }
    );

    const listener = autocomplete.addListener(
      "place_changed",
      () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setPosition({ lat, lng });
        fillFromComponents(place.address_components || []);
        setStep("map");
      }
    );

    autocompleteRef.current = autocomplete;
    listenerRef.current = listener;
  }, [open, isLoaded]);

  /* ================= GEOLOCALIZAÇÃO ================= */
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada");
      return;
    }

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

  /* ================= REVERSE GEOCODE ================= */
  async function reverseGeocode(lat: number, lng: number) {
    const key = `${lat.toFixed(5)}-${lng.toFixed(5)}`;
    if (lastCenterRef.current === key) return;

    lastCenterRef.current = key;
    setLoadingAddress(true);

    const geocoder = new google.maps.Geocoder();
    const res = await geocoder.geocode({
      location: { lat, lng },
    });

    if (res.results[0]) {
      fillFromComponents(res.results[0].address_components);
    }

    setLoadingAddress(false);
  }

  function fillFromComponents(
    components: google.maps.GeocoderAddressComponent[]
  ) {
    const get = (t: string, short = false) => {
      const comp = components.find((c) =>
        c.types.includes(t)
      );
      return comp
        ? short
          ? comp.short_name
          : comp.long_name
        : "";
    };

    setAddress((prev) => ({
      ...prev,
      street: get("route"),
      neighborhood:
        get("sublocality") ||
        get("neighborhood") ||
        get("political"),
      city: get("administrative_area_level_2"),
      state: get("administrative_area_level_1", true),
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        {/* SEARCH */}
        {step === "search" && (
          <>
            <button
              onClick={handleUseMyLocation}
              className="w-full border border-green-600 text-green-600 py-3 rounded-xl font-semibold mb-4"
            >
              📍 Usar minha localização
            </button>

            <input
              ref={inputRef}
              placeholder="Para onde?"
              disabled={!isLoaded}
              className="w-full border rounded-lg py-3 px-4"
            />
          </>
        )}

        {/* MAP */}
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
                  const c = mapRef.current.getCenter();
                  if (!c) return;
                  reverseGeocode(c.lat(), c.lng());
                }}
              />

              {/* PIN FIXO */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="text-red-600 text-3xl drop-shadow">
                  📍
                </div>
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

        {/* FORM */}
        {step === "form" && position && (
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
                onSave({
                  street: address.street,
                  neighborhood: address.neighborhood,
                  city: address.city,
                  state: address.state,
                  number: address.number,
                  reference:
                    address.reference || address.complement,
                  lat: position.lat,
                  lng: position.lng,
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
