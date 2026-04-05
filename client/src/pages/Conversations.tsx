import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search, X } from "lucide-react";
import { Link } from "wouter";
import { Textarea } from "@/components/ui/textarea";

export default function Conversations() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = trpc.whatsapp.getConversations.useQuery();

  // Fetch conversation detail
  const { data: conversationDetail } = trpc.whatsapp.getConversationDetail.useQuery(
    { conversationId: selectedConversation! },
    { enabled: !!selectedConversation }
  );

  // Send message mutation
  const sendMessageMutation = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
    },
  });

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !conversationDetail) return;

    await sendMessageMutation.mutateAsync({
      conversationId: selectedConversation,
      phoneNumber: conversationDetail.conversation.whatsappContactId,
      message: messageText,
    });
  };

  const filteredConversations = conversations?.filter((conv) =>
    conv.whatsappContactId.includes(searchQuery)
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="container py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600"></div>
              <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
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
      <div className="container py-8 px-4">
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="border border-black rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-black">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-black"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No conversations yet</div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 border-b border-gray-200 text-left hover:bg-gray-50 transition ${
                      selectedConversation === conv.id ? "bg-red-50 border-l-4 border-l-red-600" : ""
                    }`}
                  >
                    <div className="font-bold text-sm">{conv.whatsappContactId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(conv.lastMessageAt || "").toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {conv.messageCount} messages
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="col-span-2 border border-black rounded-lg overflow-hidden flex flex-col">
            {selectedConversation && conversationDetail ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-black flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{conversationDetail.conversation.whatsappContactId}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {conversationDetail.messages.length} messages
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationDetail.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "customer" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === "customer"
                            ? "bg-gray-100 text-black"
                            : msg.sender === "agent"
                            ? "bg-red-100 text-black border border-red-300"
                            : "bg-blue-100 text-black border border-blue-300"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-black">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="border-black resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="bg-red-600 text-white hover:bg-red-700 self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
