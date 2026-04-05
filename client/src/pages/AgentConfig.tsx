import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, Save } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AgentConfig() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    agentName: "",
    personality: "",
    salesScript: "",
    responseStyle: "professional" as const,
    maxResponseLength: 500,
    autoRespond: true,
    escalationKeywords: "",
  });

  // Fetch agent config
  const { data: agentConfig, isLoading } = trpc.whatsapp.getAgentConfig.useQuery();

  // Update agent config mutation
  const updateConfigMutation = trpc.whatsapp.updateAgentConfig.useMutation({
    onSuccess: () => {
      toast.success("Agent configuration updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update configuration");
    },
  });

  // Load agent config into form
  useEffect(() => {
    if (agentConfig) {
      setFormData({
        agentName: agentConfig.agentName || "",
        personality: agentConfig.personality || "",
        salesScript: agentConfig.salesScript || "",
        responseStyle: agentConfig.responseStyle as any || "professional",
        maxResponseLength: agentConfig.maxResponseLength || 500,
        autoRespond: agentConfig.autoRespond ?? true,
        escalationKeywords: Array.isArray(agentConfig.escalationKeywords)
          ? agentConfig.escalationKeywords.join(", ")
          : "",
      });
    }
  }, [agentConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateConfigMutation.mutateAsync({
      agentName: formData.agentName,
      personality: formData.personality,
      salesScript: formData.salesScript,
      responseStyle: formData.responseStyle,
      maxResponseLength: formData.maxResponseLength,
      autoRespond: formData.autoRespond,
      escalationKeywords: formData.escalationKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
    });
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="container py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600"></div>
              <h1 className="text-2xl font-bold tracking-tight">Agent Configuration</h1>
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
      <div className="container py-12 px-4 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Settings */}
          <Card className="p-8 border-black">
            <h2 className="text-2xl font-bold mb-6">Basic Settings</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="agentName" className="text-sm font-bold">
                  Agent Name
                </Label>
                <Input
                  id="agentName"
                  value={formData.agentName}
                  onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                  placeholder="e.g., Sarah - Sales Assistant"
                  className="border-black mt-2"
                />
              </div>

              <div>
                <Label htmlFor="responseStyle" className="text-sm font-bold">
                  Response Style
                </Label>
                <select
                  id="responseStyle"
                  value={formData.responseStyle}
                  onChange={(e) =>
                    setFormData({ ...formData, responseStyle: e.target.value as any })
                  }
                  className="w-full border border-black rounded px-3 py-2 mt-2"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="maxResponseLength" className="text-sm font-bold">
                  Max Response Length (characters)
                </Label>
                <Input
                  id="maxResponseLength"
                  type="number"
                  min="100"
                  max="2000"
                  value={formData.maxResponseLength}
                  onChange={(e) =>
                    setFormData({ ...formData, maxResponseLength: parseInt(e.target.value) })
                  }
                  className="border-black mt-2"
                />
              </div>
            </div>
          </Card>

          {/* Personality & Scripts */}
          <Card className="p-8 border-black">
            <h2 className="text-2xl font-bold mb-6">Personality & Scripts</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="personality" className="text-sm font-bold">
                  Agent Personality
                </Label>
                <Textarea
                  id="personality"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  placeholder="Describe your agent's personality, tone, and approach. E.g., 'You are a knowledgeable sales consultant who is patient, enthusiastic, and focused on understanding customer needs...'"
                  className="border-black mt-2 min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="salesScript" className="text-sm font-bold">
                  Sales Script & Approach
                </Label>
                <Textarea
                  id="salesScript"
                  value={formData.salesScript}
                  onChange={(e) => setFormData({ ...formData, salesScript: e.target.value })}
                  placeholder="Define your sales approach, key talking points, and value propositions. E.g., 'Focus on the customer's pain points first. Then explain how our product solves their specific problem...'"
                  className="border-black mt-2 min-h-32"
                />
              </div>
            </div>
          </Card>

          {/* Behavior Settings */}
          <Card className="p-8 border-black">
            <h2 className="text-2xl font-bold mb-6">Behavior Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="autoRespond"
                  checked={formData.autoRespond}
                  onChange={(e) => setFormData({ ...formData, autoRespond: e.target.checked })}
                  className="w-4 h-4 border-black"
                />
                <Label htmlFor="autoRespond" className="text-sm font-bold cursor-pointer">
                  Enable Auto-Response
                </Label>
              </div>

              <div>
                <Label htmlFor="escalationKeywords" className="text-sm font-bold">
                  Escalation Keywords (comma-separated)
                </Label>
                <Input
                  id="escalationKeywords"
                  value={formData.escalationKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, escalationKeywords: e.target.value })
                  }
                  placeholder="e.g., help, urgent, problem, complaint"
                  className="border-black mt-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Messages containing these keywords will trigger human escalation
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={updateConfigMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </Button>
            <Link href="/">
              <Button variant="outline" className="border-black">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
