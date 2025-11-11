import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Thermometer, Droplets } from "lucide-react";

// Fix for default marker icons in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

type IceDetection = {
  id: string;
  sensor_id: string;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high" | "critical";
  temperature: number | null;
  humidity: number | null;
  road_condition: string | null;
  status: "active" | "investigating" | "resolved";
  detected_at: string;
};

type Sensor = {
  id: string;
  sensor_id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: "online" | "offline" | "maintenance";
  last_ping: string | null;
};

const MapView = () => {
  const [detections, setDetections] = useState<IceDetection[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([42.3601, -71.0589]); // Default: Boston
  const [mapZoom, setMapZoom] = useState(12);

  useEffect(() => {
    loadMapData();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, []);

  const loadMapData = async () => {
    try {
      const { data: detectionsData, error: detectionsError } = await supabase
        .from("ice_detections")
        .select("*")
        .eq("status", "active")
        .order("detected_at", { ascending: false });

      if (detectionsError) throw detectionsError;

      const { data: sensorsData, error: sensorsError } = await supabase
        .from("sensors")
        .select("*");

      if (sensorsError) throw sensorsError;

      setDetections(detectionsData || []);
      setSensors(sensorsData || []);

      // Auto-center map on first sensor or detection
      if (sensorsData && sensorsData.length > 0) {
        setMapCenter([sensorsData[0].latitude, sensorsData[0].longitude]);
      } else if (detectionsData && detectionsData.length > 0) {
        setMapCenter([detectionsData[0].latitude, detectionsData[0].longitude]);
      }
    } catch (error) {
      console.error("Error loading map data:", error);
      toast.error("Failed to load map data");
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("map-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ice_detections",
        },
        (payload) => {
          const newDetection = payload.new as IceDetection;
          if (newDetection.status === "active") {
            setDetections((prev) => [newDetection, ...prev]);
            toast.warning("New ice detection!", {
              description: `${newDetection.severity} severity at ${newDetection.sensor_id}`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ice_detections",
        },
        (payload) => {
          const updatedDetection = payload.new as IceDetection;
          setDetections((prev) =>
            prev.map((d) => (d.id === updatedDetection.id ? updatedDetection : d))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#dc2626"; // red-600
      case "high":
        return "#ea580c"; // orange-600
      case "medium":
        return "#ca8a04"; // yellow-600
      case "low":
        return "#16a34a"; // green-600
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getSeverityRadius = (severity: string) => {
    switch (severity) {
      case "critical":
        return 200;
      case "high":
        return 150;
      case "medium":
        return 100;
      case "low":
        return 50;
      default:
        return 50;
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success";
      case "offline":
        return "bg-destructive";
      case "maintenance":
        return "bg-warning";
      default:
        return "bg-muted";
    }
  };

  // Create custom icons for different sensor states
  const createSensorIcon = (status: string) => {
    const color = status === "online" ? "green" : status === "offline" ? "red" : "orange";
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
          <circle cx="12" cy="12" r="10" fill="${color}" opacity="0.8"/>
          <circle cx="12" cy="12" r="6" fill="white"/>
          <circle cx="12" cy="12" r="3" fill="${color}"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const createDetectionIcon = (severity: string) => {
    const color = getSeverityColor(severity);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="40" height="40">
          <path d="M12 2L2 22h20L12 2z" stroke="white" stroke-width="2"/>
        </svg>
      `)}`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative bg-background p-6">
      <div className="mx-auto max-w-7xl h-full">
        <div className="grid gap-6 h-full lg:grid-cols-3">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Live Detection Map</h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>

              <div className="flex-1 rounded-lg overflow-hidden relative">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  className="rounded-lg"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Render Sensors */}
                  {sensors.map((sensor) => (
                    <Marker
                      key={sensor.id}
                      position={[sensor.latitude, sensor.longitude]}
                      icon={createSensorIcon(sensor.status)}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg">{sensor.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {sensor.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>ID:</strong> {sensor.sensor_id}</p>
                            <p>
                              <strong>Location:</strong><br />
                              {sensor.latitude.toFixed(6)}°, {sensor.longitude.toFixed(6)}°
                            </p>
                            {sensor.last_ping && (
                              <p>
                                <strong>Last Ping:</strong><br />
                                {new Date(sensor.last_ping).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Render Ice Detections with circles */}
                  {detections.map((detection) => (
                    <div key={detection.id}>
                      <Circle
                        center={[detection.latitude, detection.longitude]}
                        radius={getSeverityRadius(detection.severity)}
                        pathOptions={{
                          color: getSeverityColor(detection.severity),
                          fillColor: getSeverityColor(detection.severity),
                          fillOpacity: 0.3,
                          weight: 2,
                        }}
                      />
                      <Marker
                        position={[detection.latitude, detection.longitude]}
                        icon={createDetectionIcon(detection.severity)}
                      >
                        <Popup>
                          <div className="p-2 min-w-[250px]">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle className="h-5 w-5" style={{ color: getSeverityColor(detection.severity) }} />
                              <h3 className="font-bold text-lg">Ice Detection</h3>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge
                                  style={{
                                    backgroundColor: getSeverityColor(detection.severity),
                                    color: "white",
                                  }}
                                >
                                  {detection.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{detection.status}</Badge>
                              </div>
                              <div className="text-sm space-y-1">
                                <p><strong>Sensor:</strong> {detection.sensor_id}</p>
                                <p>
                                  <strong>Location:</strong><br />
                                  {detection.latitude.toFixed(6)}°, {detection.longitude.toFixed(6)}°
                                </p>
                                {detection.temperature !== null && (
                                  <p className="flex items-center gap-1">
                                    <Thermometer className="h-4 w-4" />
                                    <strong>Temp:</strong> {detection.temperature}°C
                                  </p>
                                )}
                                {detection.humidity !== null && (
                                  <p className="flex items-center gap-1">
                                    <Droplets className="h-4 w-4" />
                                    <strong>Humidity:</strong> {detection.humidity}%
                                  </p>
                                )}
                                {detection.road_condition && (
                                  <p><strong>Condition:</strong> {detection.road_condition}</p>
                                )}
                                <p className="text-xs text-gray-500 pt-2">
                                  {new Date(detection.detected_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </div>
                  ))}
                </MapContainer>

                {/* Stats Overlay */}
                <Card className="absolute top-4 left-4 p-3 bg-card/95 backdrop-blur z-[1000]">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">System Status</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>{detections.length} Active Alerts</p>
                      <p>
                        {sensors.filter((s) => s.status === "online").length}/
                        {sensors.length} Sensors Online
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Legend */}
                <Card className="absolute bottom-4 right-4 p-3 bg-card/95 backdrop-blur z-[1000]">
                  <h3 className="font-bold text-sm mb-2">Severity Legend</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getSeverityColor("critical") }}></div>
                      <span>Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getSeverityColor("high") }}></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getSeverityColor("medium") }}></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getSeverityColor("low") }}></div>
                      <span>Low</span>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          {/* Active Detections Panel */}
          <Card className="border-border bg-card p-6 overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Active Detections
            </h2>
            <div className="space-y-3 overflow-y-auto flex-1">
              {detections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active detections
                </p>
              ) : (
                detections.map((detection) => (
                  <div
                    key={detection.id}
                    className="rounded-lg border border-border bg-secondary p-4 transition-colors hover:bg-secondary/80 cursor-pointer"
                    onClick={() => setMapCenter([detection.latitude, detection.longitude])}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-8 w-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getSeverityColor(detection.severity) }}
                      >
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            style={{
                              backgroundColor: getSeverityColor(detection.severity),
                              color: "white",
                            }}
                          >
                            {detection.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(detection.detected_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm">
                          <p className="text-foreground font-medium">
                            {detection.sensor_id}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {detection.latitude.toFixed(4)}°, {detection.longitude.toFixed(4)}°
                          </p>
                          {detection.temperature !== null && (
                            <p className="text-muted-foreground text-xs">
                              {detection.temperature}°C
                            </p>
                          )}
                          {detection.road_condition && (
                            <p className="text-muted-foreground text-xs">
                              {detection.road_condition}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapView;
