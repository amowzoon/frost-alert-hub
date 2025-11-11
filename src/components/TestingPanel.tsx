import { useState } from "react";
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
import { toast } from "sonner";
import { FlaskConical, Plus } from "lucide-react";

const TestingPanel = () => {
  const [loading, setLoading] = useState(false);
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
      
      // Reset form
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
      
      // Reset form
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

  const generateRandomDetection = async () => {
    setLoading(true);

    try {
      // Generate random data
      const randomSensorId = `SENSOR-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`;
      const randomLat = (Math.random() * 180 - 90).toFixed(7);
      const randomLng = (Math.random() * 360 - 180).toFixed(7);
      const severities: ("low" | "medium" | "high" | "critical")[] = [
        "low",
        "medium",
        "high",
        "critical",
      ];
      const randomSeverity =
        severities[Math.floor(Math.random() * severities.length)];
      const randomTemp = (Math.random() * 10 - 5).toFixed(2);
      const randomHumidity = (Math.random() * 100).toFixed(2);

      const { error } = await supabase.from("ice_detections").insert({
        sensor_id: randomSensorId,
        latitude: parseFloat(randomLat),
        longitude: parseFloat(randomLng),
        severity: randomSeverity,
        temperature: parseFloat(randomTemp),
        humidity: parseFloat(randomHumidity),
        road_condition: "Icy patches detected",
        status: "active",
      });

      if (error) throw error;

      toast.success("Random test detection created!");
    } catch (error) {
      console.error("Error creating random detection:", error);
      toast.error("Failed to create random detection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FlaskConical className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground">Testing Panel</h1>
            <p className="mt-2 text-muted-foreground">
              Create test data for demo and development
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">Quick Actions</h2>
          <div className="flex gap-4">
            <Button
              onClick={generateRandomDetection}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Random Detection
            </Button>
          </div>
        </Card>

        {/* Create Detection Form */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Create Test Detection
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
              Create Test Detection
            </Button>
          </form>
        </Card>

        {/* Create Sensor Form */}
        <Card className="border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Create Test Sensor
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
              Create Test Sensor
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TestingPanel;
