import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Thermometer, Activity, MapPin } from "lucide-react";
import { toast } from "sonner";

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

const Dashboard = () => {
  const [detections, setDetections] = useState<IceDetection[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
    setupRealtimeSubscription();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load ice detections
      const { data: detectionsData, error: detectionsError } = await supabase
        .from("ice_detections")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(50);

      if (detectionsError) throw detectionsError;

      // Load sensors
      const { data: sensorsData, error: sensorsError } = await supabase
        .from("sensors")
        .select("*");

      if (sensorsError) throw sensorsError;

      setDetections(detectionsData || []);
      setSensors(sensorsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ice_detections",
        },
        (payload) => {
          const newDetection = payload.new as IceDetection;
          setDetections((prev) => [newDetection, ...prev]);
          
          // Show toast for new detection
          const severityColor = getSeverityColor(newDetection.severity);
          toast(`New ${newDetection.severity} severity ice detected!`, {
            description: `Sensor: ${newDetection.sensor_id}`,
            icon: <AlertTriangle className={`h-5 w-5 ${severityColor}`} />,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sensors",
        },
        (payload) => {
          const updatedSensor = payload.new as Sensor;
          setSensors((prev) =>
            prev.map((s) => (s.id === updatedSensor.id ? updatedSensor : s))
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
      case "low":
        return "text-severity-low";
      case "medium":
        return "text-severity-medium";
      case "high":
        return "text-severity-high";
      case "critical":
        return "text-severity-critical";
      default:
        return "text-muted-foreground";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
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

  const activeDetections = detections.filter((d) => d.status === "active");
  const onlineSensors = sensors.filter((s) => s.status === "online");
  const avgTemp = detections.length > 0
    ? detections.reduce((sum, d) => sum + (d.temperature || 0), 0) / detections.filter(d => d.temperature).length
    : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-pulse text-primary" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Black Ice Detection System
            </h1>
            <p className="mt-2 text-muted-foreground">
              Real-time monitoring and alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {activeDetections.length}
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-warning" />
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Sensors</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {onlineSensors.length}/{sensors.length}
                </p>
              </div>
              <Activity className="h-10 w-10 text-success" />
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Temperature</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {avgTemp.toFixed(1)}°C
                </p>
              </div>
              <Thermometer className="h-10 w-10 text-ice-blue" />
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Detections</p>
                <p className="mt-2 text-3xl font-bold text-foreground">
                  {detections.length}
                </p>
              </div>
              <MapPin className="h-10 w-10 text-primary" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Alerts Panel */}
          <Card className="lg:col-span-2 border-border bg-card p-6">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Recent Detections
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {detections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No detections yet
                </p>
              ) : (
                detections.map((detection) => (
                  <div
                    key={detection.id}
                    className="flex items-start gap-4 rounded-lg border border-border bg-secondary p-4 transition-colors hover:bg-secondary/80"
                  >
                    <AlertTriangle
                      className={`h-6 w-6 flex-shrink-0 ${getSeverityColor(
                        detection.severity
                      )}`}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadgeVariant(detection.severity)}>
                            {detection.severity}
                          </Badge>
                          <Badge variant="outline">{detection.status}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(detection.detected_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <p className="text-foreground">
                          Sensor: <span className="font-medium">{detection.sensor_id}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Location: {detection.latitude.toFixed(4)}°,{" "}
                          {detection.longitude.toFixed(4)}°
                        </p>
                        {detection.temperature && (
                          <p className="text-muted-foreground">
                            Temperature: {detection.temperature}°C
                          </p>
                        )}
                        {detection.road_condition && (
                          <p className="text-muted-foreground">
                            Condition: {detection.road_condition}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Sensors Status Panel */}
          <Card className="border-border bg-card p-6">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Sensor Status
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sensors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No sensors configured
                </p>
              ) : (
                sensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="rounded-lg border border-border bg-secondary p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${getStatusColor(
                            sensor.status
                          )}`}
                        />
                        <span className="font-medium text-foreground">
                          {sensor.name}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {sensor.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>ID: {sensor.sensor_id}</p>
                      <p>
                        {sensor.latitude.toFixed(4)}°, {sensor.longitude.toFixed(4)}°
                      </p>
                      {sensor.last_ping && (
                        <p>
                          Last ping: {new Date(sensor.last_ping).toLocaleTimeString()}
                        </p>
                      )}
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

export default Dashboard;
