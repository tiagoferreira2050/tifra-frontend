"use client";

import { useState } from "react";
import AddressSearch from "@/components/AddressSearch";
import { Card, CardContent } from "@/components/ui/card";

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

    // 🔥 FUTURO (não agora):
    // salvar no backend:
    // POST /api/store/address
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h3 className="text-sm font-semibold">Endereço da loja</h3>
          <p className="text-xs text-muted-foreground">
            Esse endereço será usado como ponto central para calcular a entrega
          </p>
        </div>

        <AddressSearch
          value={address}
          onChange={handleChange}
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
        />

        {latLng && (
          <div className="text-xs text-muted-foreground">
            📍 Latitude: {latLng.lat.toFixed(5)} | Longitude:{" "}
            {latLng.lng.toFixed(5)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
