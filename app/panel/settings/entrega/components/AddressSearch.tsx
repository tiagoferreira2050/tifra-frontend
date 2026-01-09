"use client";

/// <reference types="google.maps" />

import { useEffect, useRef, useState } from "react";

type LatLng = {
  lat: number;
  lng: number;
};

type Props = {
  value: string;
  onChange: (address: string, latLng?: LatLng) => void;
  apiKey?: string;
};

type Suggestion = {
  place_id: string;
  description: string;
};

export default function AddressSearch({ value, onChange, apiKey }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const autocompleteRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);

  /* ===============================
     INIT GOOGLE MAPS
  =============================== */
  useEffect(() => {
    if (!apiKey) return;

    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      document.body.appendChild(script);

      script.onload = initGoogle;
    } else {
      initGoogle();
    }

    function initGoogle() {
      if (!google.maps?.places) return;

      autocompleteRef.current =
        new google.maps.places.AutocompleteService();

      const div = document.createElement("div");
      const map = new google.maps.Map(div);
      placesRef.current = new google.maps.places.PlacesService(map);
    }
  }, [apiKey]);

  /* ===============================
     CLOSE ON CLICK OUTSIDE
  =============================== */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ===============================
     SEARCH
  =============================== */
  function search(text: string) {
    if (!text || text.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!autocompleteRef.current) return;

    setLoading(true);

    autocompleteRef.current.getPlacePredictions(
      {
        input: text,
        componentRestrictions: { country: "br" },
        types: ["address"],
      },
      (predictions, status) => {
        setLoading(false);

        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setSuggestions(
            predictions.map((p) => ({
              place_id: p.place_id,
              description: p.description,
            }))
          );
          setOpen(true);
        } else {
          setSuggestions([]);
        }
      }
    );
  }

  /* ===============================
     SELECT ADDRESS
  =============================== */
  function select(suggestion: Suggestion) {
    setQuery(suggestion.description);
    setOpen(false);

    if (!placesRef.current) {
      onChange(suggestion.description);
      return;
    }

    placesRef.current.getDetails(
      { placeId: suggestion.place_id, fields: ["geometry"] },
      (place, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          onChange(suggestion.description, {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        } else {
          onChange(suggestion.description);
        }
      }
    );
  }

  /* ===============================
     RENDER
  =============================== */
  return (
    <div ref={wrapperRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          search(e.target.value);
        }}
        placeholder="Digite o endereço da loja"
        className="w-full h-12 rounded-md border px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
          buscando...
        </span>
      )}

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              onClick={() => select(s)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100"
            >
              {s.description}
            </button>
          ))}
        </div>
      )}

      {!apiKey && (
        <p className="mt-2 text-xs text-gray-500">
          ⚠️ Adicione a chave do Google Maps para busca automática
        </p>
      )}
    </div>
  );
}
