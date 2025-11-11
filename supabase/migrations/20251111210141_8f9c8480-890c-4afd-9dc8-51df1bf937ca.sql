-- Create enum for severity levels
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create enum for sensor status
CREATE TYPE sensor_status AS ENUM ('online', 'offline', 'maintenance');

-- Create enum for detection status
CREATE TYPE detection_status AS ENUM ('active', 'investigating', 'resolved');

-- Create sensors table
CREATE TABLE public.sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  status sensor_status NOT NULL DEFAULT 'online',
  last_ping TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ice_detections table
CREATE TABLE public.ice_detections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id TEXT NOT NULL,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  severity severity_level NOT NULL DEFAULT 'low',
  temperature NUMERIC(5, 2),
  humidity NUMERIC(5, 2),
  road_condition TEXT,
  status detection_status NOT NULL DEFAULT 'active',
  notes TEXT,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ice_detections ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (monitoring dashboard)
CREATE POLICY "Allow public read access to sensors"
  ON public.sensors
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to sensors"
  ON public.sensors
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to sensors"
  ON public.sensors
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to ice detections"
  ON public.ice_detections
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to ice detections"
  ON public.ice_detections
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to ice detections"
  ON public.ice_detections
  FOR UPDATE
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ice_detections_updated_at
  BEFORE UPDATE ON public.ice_detections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for ice_detections
ALTER PUBLICATION supabase_realtime ADD TABLE public.ice_detections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensors;

-- Add indexes for better performance
CREATE INDEX idx_ice_detections_status ON public.ice_detections(status);
CREATE INDEX idx_ice_detections_severity ON public.ice_detections(severity);
CREATE INDEX idx_ice_detections_detected_at ON public.ice_detections(detected_at DESC);
CREATE INDEX idx_sensors_status ON public.sensors(status);
CREATE INDEX idx_sensors_sensor_id ON public.sensors(sensor_id);