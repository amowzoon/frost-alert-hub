import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import TestingPanel from "@/components/TestingPanel";
import { Activity, FlaskConical } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-6">
            <TabsList className="h-16 bg-transparent">
              <TabsTrigger
                value="dashboard"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Activity className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="testing"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FlaskConical className="h-4 w-4" />
                Testing
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="dashboard" className="m-0">
          <Dashboard />
        </TabsContent>

        <TabsContent value="testing" className="m-0">
          <TestingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
