import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const GoogleSearchSetup = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Google Search Setup Required</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            To automatically find default images for events, you need to set up Google Custom Search API keys. 
            This will enable the system to find relevant images based on event titles and descriptions.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p><strong>Setup Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-4">
            <li>Go to Google Cloud Console and enable the Custom Search API</li>
            <li>Create API credentials (API Key)</li>
            <li>Set up a Custom Search Engine at programmablesearchengine.google.com</li>
            <li>Add your API key and Search Engine ID using the forms below</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleSearchSetup;