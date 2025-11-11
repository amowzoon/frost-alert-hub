import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MapView from "@/components/MapView";
import TestingPanel from "@/components/TestingPanel";
import TestingSuite from "@/components/TestingSuite";
import { Map, FlaskConical, ClipboardCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="map" className="w-full">
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6">
            <TabsList className="h-16 bg-transparent">
              <TabsTrigger
                value="map"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
              <TabsTrigger
                value="tests"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <ClipboardCheck className="h-4 w-4" />
                Run Tests
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FlaskConical className="h-4 w-4" />
                Create Data
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="map" className="m-0">
          <MapView />
        </TabsContent>

        <TabsContent value="tests" className="m-0">
          <TestingSuite />
        </TabsContent>

        <TabsContent value="testing" className="m-0">
          <TestingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
