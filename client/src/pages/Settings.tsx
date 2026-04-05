import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { WebhookStatusIndicator, WebhookStatusBadge } from "@/components/WebhookStatusIndicator";

export default function Settings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    businessPhoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    webhookVerifyToken: "",
  });
  const [showTokens, setShowTokens] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch WhatsApp config
  const { data: config, isLoading } = trpc.whatsapp.getConfig.useQuery();

  // Update config mutation
  const updateConfigMutation = trpc.whatsapp.updateConfig.useMutation({
    onSuccess: () => {
      setIsSaved(true);
      toast.success("WhatsApp configuration saved successfully!");
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save configuration");
    },
  });

  // Load config into form
  useEffect(() => {
    if (config) {
      setFormData({
        businessPhoneNumberId: config.businessPhoneNumberId || "",
        businessAccountId: config.businessAccountId || "",
        accessToken: config.accessToken || "",
        webhookVerifyToken: config.webhookVerifyToken || "",
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessPhoneNumberId.trim()) {
      toast.error("Phone Number ID is required");
      return;
    }
    if (!formData.businessAccountId.trim()) {
      toast.error("Business Account ID is required");
      return;
    }
    if (!formData.accessToken.trim()) {
      toast.error("Access Token is required");
      return;
    }
    if (!formData.webhookVerifyToken.trim()) {
      toast.error("Webhook Verify Token is required");
      return;
    }

    await updateConfigMutation.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="container py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600"></div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-black">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12 px-4 max-w-4xl">
        {/* Info Banner */}
        <Card className="p-6 border-black mb-8 bg-blue-50 border-blue-200">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Need Your Meta Credentials?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Follow our <strong>WhatsApp Setup Guide</strong> to get your credentials from Meta Business Manager:
              </p>
              <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                <li>Go to Meta Developers (developers.facebook.com)</li>
                <li>Create or select your Meta App</li>
                <li>Add WhatsApp product</li>
                <li>Get your Phone Number ID from Phone Numbers section</li>
                <li>Generate Access Token from API Credentials</li>
                <li>Find your Business Account ID in Business Manager</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Success Banner */}
        {isSaved && (
          <Card className="p-6 border-black mb-8 bg-green-50 border-green-200">
            <div className="flex gap-4 items-center">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900">Configuration Saved</h3>
                <p className="text-sm text-green-800">Your WhatsApp credentials have been saved successfully.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Webhook Status Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Connection Status</h2>
          <WebhookStatusIndicator autoRefresh={true} refreshInterval={30000} />
        </div>

      {/* WhatsApp Configuration Form */}
        <Card className="p-8 border-black mb-8">
          <h2 className="text-2xl font-bold mb-6">WhatsApp Business Configuration</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Phone Number ID */}
            <div>
              <Label htmlFor="phoneNumberId" className="text-sm font-bold">
                Business Phone Number ID *
              </Label>
              <Input
                id="phoneNumberId"
                value={formData.businessPhoneNumberId}
                onChange={(e) =>
                  setFormData({ ...formData, businessPhoneNumberId: e.target.value })
                }
                placeholder="e.g., 1234567890123456"
                className="border-black mt-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                Found in Meta Business Manager → WhatsApp → Phone Numbers
              </p>
            </div>

            {/* Business Account ID */}
            <div>
              <Label htmlFor="accountId" className="text-sm font-bold">
                Business Account ID *
              </Label>
              <Input
                id="accountId"
                value={formData.businessAccountId}
                onChange={(e) =>
                  setFormData({ ...formData, businessAccountId: e.target.value })
                }
                placeholder="e.g., 1234567890123456"
                className="border-black mt-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                Found in Meta Business Manager → WhatsApp Business Accounts
              </p>
            </div>

            {/* Access Token */}
            <div>
              <Label htmlFor="accessToken" className="text-sm font-bold">
                Access Token *
              </Label>
              <div className="relative mt-2">
                <Input
                  id="accessToken"
                  type={showTokens ? "text" : "password"}
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  placeholder="Paste your access token here"
                  className="border-black pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowTokens(!showTokens)}
                  className="absolute right-3 top-3 text-sm text-gray-600 hover:text-gray-900"
                >
                  {showTokens ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Generate from Meta Business Manager → Apps → Your App → Settings → API Credentials
              </p>
              <p className="text-xs text-red-600 mt-1 font-bold">
                ⚠️ Keep this token secret. Never share it publicly.
              </p>
            </div>

            {/* Webhook Verify Token */}
            <div>
              <Label htmlFor="webhookToken" className="text-sm font-bold">
                Webhook Verify Token *
              </Label>
              <Input
                id="webhookToken"
                type="password"
                value={formData.webhookVerifyToken}
                onChange={(e) =>
                  setFormData({ ...formData, webhookVerifyToken: e.target.value })
                }
                placeholder="Create a secure token (e.g., my_secure_token_123)"
                className="border-black mt-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                Create any secure string. You'll use this in Meta webhook configuration to verify requests.
              </p>
            </div>

            {/* Webhook URL Info */}
            <div className="bg-gray-50 p-4 border border-gray-200 rounded">
              <h3 className="font-bold text-sm mb-2">Your Webhook URL</h3>
              <div className="bg-white p-3 border border-gray-300 rounded font-mono text-xs break-all">
                https://your-domain.com/api/whatsapp/webhook
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Use this URL when configuring your webhook in Meta App settings. Replace "your-domain.com" with your actual domain.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateConfigMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
              <Link href="/">
                <Button variant="outline" className="border-black">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Testing Section */}
        <Card className="p-8 border-black">
          <h2 className="text-2xl font-bold mb-6">Test Your Setup</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                1
              </div>
              <div>
                <h3 className="font-bold">Save Your Credentials</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fill in all fields above and click "Save Configuration"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                2
              </div>
              <div>
                <h3 className="font-bold">Send a Test Message</h3>
                <p className="text-sm text-gray-600 mt-1">
                  From your personal WhatsApp, send a message to your business phone number
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                3
              </div>
              <div>
                <h3 className="font-bold">Check Conversations</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Go to Conversations tab and verify your message appears there
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                4
              </div>
              <div>
                <h3 className="font-bold">Verify AI Response</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Check that your AI agent automatically responds to the message
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
