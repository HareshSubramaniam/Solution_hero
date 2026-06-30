import { useState, useEffect } from "react";
import { useListIssues } from "@workspace/api-client-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Fix Leaflet's default icon path issues with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const getMarkerIcon = (severity: string) => {
  let color = "#3b82f6"; // blue
  if (severity === "medium") color = "#f59e0b"; // amber
  if (severity === "high") color = "#f97316"; // orange
  if (severity === "critical") color = "#ef4444"; // red

  return L.divIcon({
    className: "custom-div-icon",
    html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5); ${severity === 'critical' ? 'animation: pulse 2s infinite;' : ''}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const COIMBATORE_CENTER: [number, number] = [11.0168, 76.9558];

function SetViewOnLoad({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function Map() {
  const { data: issues } = useListIssues();

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative z-0">
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
      <MapContainer
        center={COIMBATORE_CENTER}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SetViewOnLoad coords={COIMBATORE_CENTER} />
        
        {issues?.map((issue: any) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={getMarkerIcon(issue.severity)}
          >
            <Popup className="min-w-[200px]">
              <div className="flex flex-col gap-2">
                <div className="font-semibold text-sm leading-tight">{issue.title}</div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px] py-0">{issue.category}</Badge>
                  <Badge variant="outline" className="text-[10px] py-0">{issue.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{issue.address}</p>
                <Link href={`/issue/${issue.id}`}>
                  <Button size="sm" className="w-full mt-2 h-7 text-xs">View Details</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
