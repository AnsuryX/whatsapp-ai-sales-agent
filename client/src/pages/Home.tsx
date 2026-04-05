import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Settings, BarChart3, Zap, Cog } from "lucide-react";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-black">
          <div className="container py-6 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600"></div>
                <h1 className="text-2xl font-bold tracking-tight">WhatsApp AI Sales Agent</h1>
              </div>
              <a href={getLoginUrl()}>
                <Button className="bg-black text-white hover:bg-gray-900">Sign In</Button>
              </a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container py-20 px-4 grid grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
              Automate Your Sales with AI
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Deploy an intelligent WhatsApp sales agent that engages customers 24/7, qualifies leads,
              and converts conversations into revenue—while you maintain complete control.
            </p>
            <div className="flex gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-red-600 text-white hover:bg-red-700">
                  Get Started
                </Button>
              </a>
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-gray-50">
                Learn More
              </Button>
            </div>
          </div>

          <div className="bg-gray-100 aspect-square flex items-center justify-center">
            <div className="w-32 h-32 bg-red-600 transform -rotate-12"></div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-gray-50 border-t border-b border-black py-20">
          <div className="container px-4">
            <h3 className="text-3xl font-bold mb-12 tracking-tight">Core Features</h3>
            <div className="grid grid-cols-2 gap-8">
              <Card className="p-8 border-black bg-white">
                <MessageCircle className="w-8 h-8 mb-4 text-red-600" />
                <h4 className="text-xl font-bold mb-3">Real-Time Conversations</h4>
                <p className="text-gray-700">Monitor all WhatsApp conversations in one unified dashboard with instant message delivery and read receipts.</p>
              </Card>

              <Card className="p-8 border-black bg-white">
                <Zap className="w-8 h-8 mb-4 text-red-600" />
                <h4 className="text-xl font-bold mb-3">AI-Powered Responses</h4>
                <p className="text-gray-700">Intelligent agent responds to customer inquiries automatically, learning from your sales scripts and personality.</p>
              </Card>

              <Card className="p-8 border-black bg-white">
                <Settings className="w-8 h-8 mb-4 text-red-600" />
                <h4 className="text-xl font-bold mb-3">Full Customization</h4>
                <p className="text-gray-700">Configure agent personality, sales scripts, response templates, and escalation rules to match your brand.</p>
              </Card>

              <Card className="p-8 border-black bg-white">
                <BarChart3 className="w-8 h-8 mb-4 text-red-600" />
                <h4 className="text-xl font-bold mb-3">Advanced Analytics</h4>
                <p className="text-gray-700">Track response times, conversion rates, customer sentiment, and lead quality metrics in real-time.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-20 px-4">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div className="bg-red-600 aspect-square"></div>
            <div>
              <h3 className="text-4xl font-bold mb-6 tracking-tight">Take Control of Your Sales</h3>
              <p className="text-lg text-gray-700 mb-8">
                Set up your WhatsApp AI Sales Agent in minutes. Connect your Meta Business Account, configure your agent personality, and start engaging customers immediately.
              </p>
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-black text-white hover:bg-gray-900">
                  Start Free Trial
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black bg-white">
          <div className="container py-8 px-4 text-center text-gray-600">
            <p>© 2026 WhatsApp AI Sales Agent. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Authenticated view - redirect to dashboard
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black">
        <div className="container py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600"></div>
              <h1 className="text-2xl font-bold tracking-tight">WhatsApp AI Sales Agent</h1>
            </div>
            <div className="text-sm text-gray-600">Welcome, {user?.name}</div>
          </div>
        </div>
      </header>

      <div className="container py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">Dashboard</h2>
        <div className="grid grid-cols-2 gap-6">
          <Link href="/settings">
            <Card className="p-6 border-black cursor-pointer hover:bg-gray-50 transition">
              <Settings className="w-8 h-8 mb-4 text-red-600" />
              <h3 className="text-xl font-bold">Settings</h3>
              <p className="text-gray-600 text-sm mt-2">Configure WhatsApp credentials and webhook</p>
            </Card>
          </Link>

          <Link href="/conversations">
            <Card className="p-6 border-black cursor-pointer hover:bg-gray-50 transition">
              <MessageCircle className="w-8 h-8 mb-4 text-red-600" />
              <h3 className="text-xl font-bold">Conversations</h3>
              <p className="text-gray-600 text-sm mt-2">View and manage all customer conversations</p>
            </Card>
          </Link>

          <Link href="/agent-config">
            <Card className="p-6 border-black cursor-pointer hover:bg-gray-50 transition">
              <Settings className="w-8 h-8 mb-4 text-red-600" />
              <h3 className="text-xl font-bold">Agent Settings</h3>
              <p className="text-gray-600 text-sm mt-2">Configure AI personality and behavior</p>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="p-6 border-black cursor-pointer hover:bg-gray-50 transition">
              <BarChart3 className="w-8 h-8 mb-4 text-red-600" />
              <h3 className="text-xl font-bold">Analytics</h3>
              <p className="text-gray-600 text-sm mt-2">Track performance and metrics</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
