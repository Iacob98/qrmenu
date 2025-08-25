import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Send } from "lucide-react";

export default function TelegramTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/test-telegram", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setTestResult(result);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Telegram bot connection is working correctly",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      }

    } catch (error) {
      const errorMessage = "Failed to test Telegram connection";
      setTestResult({ success: false, message: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Telegram Integration
          </CardTitle>
          <CardDescription>
            Test if your Telegram bot is configured correctly for receiving feedback notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>This will send a test message to your configured Telegram chat to verify that:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>The bot token is valid</li>
              <li>The chat ID is correct</li>
              <li>The bot has permission to send messages</li>
            </ul>
          </div>

          <Button 
            onClick={handleTestConnection}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Test Telegram Connection
              </>
            )}
          </Button>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                </span>
              </div>
              <p className={`mt-2 text-sm ${
                testResult.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {testResult.message}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Note:</strong> If the test fails, check that your Telegram bot token and chat ID are correct in the environment variables.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}