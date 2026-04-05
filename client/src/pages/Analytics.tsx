import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, MessageCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Analytics() {
  const { user } = useAuth();

  // Fetch conversations for analytics
  const { data: conversations } = trpc.whatsapp.getConversations.useQuery();

  // Calculate metrics
  const metrics = {
    totalConversations: conversations?.length || 0,
    totalMessages: conversations?.reduce((sum, conv) => sum + (conv.messageCount || 0), 0) || 0,
    aiMessages: conversations?.reduce((sum, conv) => sum + (conv.aiMessageCount || 0), 0) || 0,
    averageResponseTime: conversations && conversations.length > 0 ? conversations.reduce((sum, conv) => sum + (conv.averageResponseTime || 0), 0) / conversations.length : 0,
    qualifiedLeads: conversations?.filter((conv) => conv.leadQualified).length || 0,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="container py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600"></div>
              <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
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
      <div className="container py-12 px-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Total Conversations</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalConversations}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6 border-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Total Messages</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalMessages}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6 border-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">AI Responses</p>
                <p className="text-3xl font-bold mt-2">{metrics.aiMessages}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-6 border-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold">Qualified Leads</p>
                <p className="text-3xl font-bold mt-2">{metrics.qualifiedLeads}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-8 border-black">
            <h2 className="text-2xl font-bold mb-6">Response Performance</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">Average Response Time</p>
                <p className="text-4xl font-bold mt-2">
                  {Math.round(metrics.averageResponseTime)}
                  <span className="text-lg text-gray-600 ml-2">seconds</span>
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  AI agent responds to customer inquiries in an average of{" "}
                  <strong>{Math.round(metrics.averageResponseTime)} seconds</strong>, ensuring quick
                  engagement and high customer satisfaction.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 border-black">
            <h2 className="text-2xl font-bold mb-6">Conversion Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">Lead Qualification Rate</p>
                <p className="text-4xl font-bold mt-2">
                  {metrics.totalConversations > 0
                    ? Math.round((metrics.qualifiedLeads / metrics.totalConversations) * 100)
                    : 0}
                  <span className="text-lg text-gray-600 ml-2">%</span>
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>{metrics.qualifiedLeads}</strong> out of{" "}
                  <strong>{metrics.totalConversations}</strong> conversations have been qualified
                  as potential leads.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-8 border-black mt-6">
          <h2 className="text-2xl font-bold mb-6">Recent Conversations</h2>
          <div className="space-y-4">
              {conversations && conversations.length > 0 ? (
              conversations.slice(0, 5).map((conv: any) => (
                <div key={conv.id} className="flex items-center justify-between p-4 border border-gray-200 rounded">
                  <div>
                    <p className="font-bold">{conv.whatsappContactId}</p>
                    <p className="text-sm text-gray-600">
                      {conv.messageCount} messages • Last message:{" "}
                      {new Date(conv.lastMessageAt || "").toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      {conv.leadQualified ? "✓ Qualified" : "Pending"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {conv.status === "active" ? "Active" : conv.status === "closed" ? "Closed" : "Escalated"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No conversations yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
