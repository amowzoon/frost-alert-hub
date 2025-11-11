import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  MapPin, 
  AlertTriangle,
  Loader2,
  RefreshCw,
  Database,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// City coordinates for generating realistic test data
const CITIES = {
  "New York": { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
  "Boston": { lat: 42.3601, lng: -71.0589, name: "Boston, MA" },
  "Chicago": { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
  "Denver": { lat: 39.7392, lng: -104.9903, name: "Denver, CO" },
  "Seattle": { lat: 47.6062, lng: -122.3321, name: "Seattle, WA" },
  "Minneapolis": { lat: 44.9778, lng: -93.2650, name: "Minneapolis, MN" },
  "Detroit": { lat: 42.3314, lng: -83.0458, name: "Detroit, MI" },
  "Portland": { lat: 45.5152, lng: -122.6784, name: "Portland, OR" },
  "Buffalo": { lat: 42.8864, lng: -78.8784, name: "Buffalo, NY" },
  "Milwaukee": { lat: 43.0389, lng: -87.9065, name: "Milwaukee, WI" },
};

type IceDetection = {
  id: string;
  sensor_id: string;
  latitude: number;
  longitude: number;
  severity: "low" | "medium" | "high" | "critical";
  temperature: number | null;
  status: string;
  detected_at: string;
};

type Sensor = {
  id: string;
  sensor_id: string;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
};

const TestingPanel = () => {
  const [loading, setLoading] = useState(false);
  const [detections, setDetections] = useState<IceDetection[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES>("Boston");
  const [bulkCount, setBulkCount] = useState(5);
  
  const [formData, setFormData] = useState({
    sensor_id: "",
    latitude: "",
    longitude: "",
    severity: "low" as "low" | "medium" | "high" | "critical",
    temperature: "",
    humidity: "",
    road_condition: "",
    notes: "",
  });

  const [sensorFormData, setSensorFormData] = useState({
    sensor_id: "",
    name: "",
    latitude: "",
    longitude: "",
    status: "online" as "online" | "offline" | "maintenance",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: detectionsData } = await supabase
        .from("ice_detections")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(50);

      const { data: sensorsData } = await supabase
        .from("sensors")
        .select("*")
        .order("sensor_id");

      setDetections(detectionsData || []);
      setSensors(sensorsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleDetectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("ice_detections").insert({
        sensor_id: formData.sensor_id,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        severity: formData.severity,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        humidity: formData.humidity ? parseFloat(formData.humidity) : null,
        road_condition: formData.road_condition || null,
        notes: formData.notes || null,
        status: "active",
      });

      if (error) throw error;

      toast.success("Test detection created successfully!");
      loadData();
      
      setFormData({
        sensor_id: "",
        latitude: "",
        longitude: "",
        severity: "low",
        temperature: "",
        humidity: "",
        road_condition: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating detection:", error);
      toast.error("Failed to create test detection");
    } finally {
      setLoading(false);
    }
  };

  const handleSensorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("sensors").insert({
        sensor_id: sensorFormData.sensor_id,
        name: sensorFormData.name,
        latitude: parseFloat(sensorFormData.latitude),
        longitude: parseFloat(sensorFormData.longitude),
        status: sensorFormData.status,
      });

      if (error) throw error;

      toast.success("Test sensor created successfully!");
      loadData();
      
      setSensorFormData({
        sensor_id: "",
        name: "",
        latitude: "",
        longitude: "",
        status: "online",
      });
    } catch (error) {
      console.error("Error creating sensor:", error);
      toast.error("Failed to create test sensor");
    } finally {
      setLoading(false);
    }
  };

  const generateRandomDetectionInCity = async (cityKey: keyof typeof CITIES) => {
    const city = CITIES[cityKey];
    const randomOffset = 0.05; // ~5km radius
    
    const randomSensorId = `SENSOR-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
    const randomLat = city.lat + (Math.random() - 0.5) * randomOffset;
    const randomLng = city.lng + (Math.random() - 0.5) * randomOffset;
    const severities: ("low" | "medium" | "high" | "critical")[] = [
      "low",
      "medium",
      "high",
      "critical",
    ];
    const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
    const randomTemp = (Math.random() * 10 - 5).toFixed(2);
    const randomHumidity = (Math.random() * 100).toFixed(2);

    const { error } = await supabase.from("ice_detections").insert({
      sensor_id: randomSensorId,
      latitude: parseFloat(randomLat.toFixed(6)),
      longitude: parseFloat(randomLng.toFixed(6)),
      severity: randomSeverity,
      temperature: parseFloat(randomTemp),
      humidity: parseFloat(randomHumidity),
      road_condition: "Icy patches detected",
      status: "active",
    });

    if (error) throw error;
  };

  const generateBulkDetections = async () => {
    setLoading(true);
    try {
      for (let i = 0; i < bulkCount; i++) {
        await generateRandomDetectionInCity(selectedCity);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between inserts
      }
      toast.success(`Generated ${bulkCount} detections in ${CITIES[selectedCity].name}!`);
      loadData();
    } catch (error) {
      console.error("Error generating bulk detections:", error);
      toast.error("Failed to generate bulk detections");
    } finally {
      setLoading(false);
    }
  };

  const deleteDetection = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ice_detections")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Detection deleted successfully!");
      loadData();
    } catch (error) {
      console.error("Error deleting detection:", error);
      toast.error("Failed to delete detection");
    }
  };

  const deleteSensor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("sensors")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Sensor deleted successfully!");
      loadData();
    } catch (error) {
      console.error("Error deleting sensor:", error);
      toast.error("Failed to delete sensor");
    }
  };

  const deleteAllDetections = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("ice_detections")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      toast.success("All detections cleared!");
      loadData();
    } catch (error) {
      console.error("Error deleting all detections:", error);
      toast.error("Failed to delete all detections");
    } finally {
      setLoading(false);
    }
  };

  const deleteAllSensors = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("sensors")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;

      toast.success("All sensors cleared!");
      loadData();
    } catch (error) {
      console.error("Error deleting all sensors:", error);
      toast.error("Failed to delete all sensors");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-severity-critical";
      case "high": return "bg-severity-high";
      case "medium": return "bg-severity-medium";
      case "low": return "bg-severity-low";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FlaskConical className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Data Management</h1>
            <p className="mt-2 text-muted-foreground">
              Create, view, and manage test data for demo and development
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Label>Generate in City</Label>
              <Select value={selectedCity} onValueChange={(value: any) => setSelectedCity(value)}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CITIES).map(([key, city]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {city.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Number of Detections</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value) || 1)}
                className="bg-secondary"
              />
            </div>

            <div className="space-y-3">
              <Label className="opacity-0">Actions</Label>
              <Button
                onClick={generateBulkDetections}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Generate {bulkCount} Detection{bulkCount > 1 ? 's' : ''}
              </Button>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              onClick={loadData}
              variant="outline"
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Detections
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all ice detections from the database. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllDetections} className="bg-destructive text-destructive-foreground">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Sensors
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all sensors from the database. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllSensors} className="bg-destructive text-destructive-foreground">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        {/* Data Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Detections */}
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Recent Detections ({detections.length})
              </h2>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {detections.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No detections yet</p>
              ) : (
                detections.map((detection) => (
                  <div
                    key={detection.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(detection.severity)}>
                          {detection.severity}
                        </Badge>
                        <span className="text-sm font-medium">{detection.sensor_id}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {detection.latitude.toFixed(4)}°, {detection.longitude.toFixed(4)}°
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(detection.detected_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDetection(detection.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Sensors */}
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Sensors ({sensors.length})
              </h2>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sensors.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No sensors yet</p>
              ) : (
                sensors.map((sensor) => (
                  <div
                    key={sensor.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`h-2 w-2 rounded-full ${
                          sensor.status === "online" ? "bg-success" :
                          sensor.status === "offline" ? "bg-destructive" : "bg-warning"
                        }`} />
                        <span className="text-sm font-medium">{sensor.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{sensor.sensor_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {sensor.latitude.toFixed(4)}°, {sensor.longitude.toFixed(4)}°
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSensor(sensor.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Create Detection Form */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Create Custom Detection
          </h2>
          <form onSubmit={handleDetectionSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sensor_id">Sensor ID</Label>
                <Input
                  id="sensor_id"
                  value={formData.sensor_id}
                  onChange={(e) =>
                    setFormData({ ...formData, sensor_id: e.target.value })
                  }
                  placeholder="SENSOR-001"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  placeholder="40.7128"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  placeholder="-74.0060"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  placeholder="-2.5"
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="humidity">Humidity (%)</Label>
                <Input
                  id="humidity"
                  type="number"
                  step="0.1"
                  value={formData.humidity}
                  onChange={(e) =>
                    setFormData({ ...formData, humidity: e.target.value })
                  }
                  placeholder="85.5"
                  className="bg-secondary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="road_condition">Road Condition</Label>
              <Input
                id="road_condition"
                value={formData.road_condition}
                onChange={(e) =>
                  setFormData({ ...formData, road_condition: e.target.value })
                }
                placeholder="Icy patches detected"
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                className="bg-secondary"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Custom Detection
            </Button>
          </form>
        </Card>

        {/* Create Sensor Form */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Create Custom Sensor
          </h2>
          <form onSubmit={handleSensorSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sensor_sensor_id">Sensor ID</Label>
                <Input
                  id="sensor_sensor_id"
                  value={sensorFormData.sensor_id}
                  onChange={(e) =>
                    setSensorFormData({
                      ...sensorFormData,
                      sensor_id: e.target.value,
                    })
                  }
                  placeholder="SENSOR-001"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensor_name">Sensor Name</Label>
                <Input
                  id="sensor_name"
                  value={sensorFormData.name}
                  onChange={(e) =>
                    setSensorFormData({ ...sensorFormData, name: e.target.value })
                  }
                  placeholder="Highway 101 North"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensor_latitude">Latitude</Label>
                <Input
                  id="sensor_latitude"
                  type="number"
                  step="any"
                  value={sensorFormData.latitude}
                  onChange={(e) =>
                    setSensorFormData({
                      ...sensorFormData,
                      latitude: e.target.value,
                    })
                  }
                  placeholder="40.7128"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensor_longitude">Longitude</Label>
                <Input
                  id="sensor_longitude"
                  type="number"
                  step="any"
                  value={sensorFormData.longitude}
                  onChange={(e) =>
                    setSensorFormData({
                      ...sensorFormData,
                      longitude: e.target.value,
                    })
                  }
                  placeholder="-74.0060"
                  required
                  className="bg-secondary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensor_status">Status</Label>
                <Select
                  value={sensorFormData.status}
                  onValueChange={(value: any) =>
                    setSensorFormData({ ...sensorFormData, status: value })
                  }
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Custom Sensor
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TestingPanel;
