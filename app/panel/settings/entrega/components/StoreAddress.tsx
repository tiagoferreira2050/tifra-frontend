"use client";

import { useState } from "react";
import AddressSearch from "./AddressSearch";

type LatLng = {
  lat: number;
  lng: number;
};

type Props = {
  initialAddress?: string;
  initialLatLng?: LatLng | null;
};

export default function StoreAddress({
  initialAddress = "",
  initialLatLng = null,
}: Props) {
  const [address, setAddress] = useState(initialAddress);
  const [latLng, setLatLng] = useState<LatLng | null>(initialLatLng);

  function handleChange(newAddress: string, coords?: LatLng) {
    setAddress(newAddress);
    if (coords) {
      setLatLng(coords);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Endereço da loja</h3>
        <p className="text-xs text-gray-500">
          Esse endereço será usado como ponto central para calcular a entrega
        </p>
      </div>

      <AddressSearch
        value={address}
        onChange={handleChange}
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
      />

      {latLng && (
        <div className="text-xs text-gray-500">
          📍 Latitude: {latLng.lat.toFixed(5)} | Longitude:{" "}
          {latLng.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
