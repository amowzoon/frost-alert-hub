import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AlertTriangle, MapPin } from "lucide-react";

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
        return "bg-severity-critical";
      case "high":
        return "bg-severity-high";
      case "medium":
        return "bg-severity-medium";
      case "low":
        return "bg-severity-low";
      default:
        return "bg-muted";
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

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative bg-background p-6">
      <div className="mx-auto max-w-7xl h-full">
        <div className="grid gap-6 h-full" style={{ gridTemplateColumns: "2fr 1fr" }}>
          {/* Map Visualization (Placeholder) */}
          <Card className="border-border bg-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background opacity-50"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-foreground">Detection Map</h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>

              {/* Map Grid */}
              <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto">
                {sensors.map((sensor) => (
                  <Card
                    key={sensor.id}
                    className="border-border bg-secondary/50 p-4 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getSensorStatusColor(sensor.status)}`}></div>
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {sensor.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground mb-1">
                      {sensor.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{sensor.sensor_id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Number(sensor.latitude).toFixed(4)}°, {Number(sensor.longitude).toFixed(4)}°
                    </p>
                    {sensor.last_ping && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(sensor.last_ping).toLocaleTimeString()}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Active Detections Panel */}
          <Card className="border-border bg-card p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Active Detections
            </h2>
            <div className="space-y-3 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {detections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active detections
                </p>
              ) : (
                detections.map((detection) => (
                  <div
                    key={detection.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-secondary p-4 transition-colors hover:bg-secondary/80"
                  >
                    <div className={`mt-1 h-6 w-6 rounded-full ${getSeverityColor(detection.severity)} flex items-center justify-center`}>
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{detection.severity}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(detection.detected_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-foreground font-medium">
                          {detection.sensor_id}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {Number(detection.latitude).toFixed(4)}°, {Number(detection.longitude).toFixed(4)}°
                        </p>
                        {detection.temperature && (
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
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Stats Overlay */}
        <Card className="absolute top-10 left-10 p-4 bg-card/95 backdrop-blur">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-sm font-medium">System Status</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>{detections.length} Active Alerts</p>
              <p>
                {sensors.filter((s) => s.status === "online").length}/
                {sensors.length} Sensors Online
              </p>
            </div>
          </div>
        </Card>

        {/* Legend */}
        <Card className="absolute bottom-10 right-10 p-4 bg-card/95 backdrop-blur">
          <h3 className="font-bold text-sm mb-3">Severity Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-severity-critical border-2 border-white"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-severity-high border-2 border-white"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-severity-medium border-2 border-white"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-severity-low border-2 border-white"></div>
              <span>Low</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapView;
