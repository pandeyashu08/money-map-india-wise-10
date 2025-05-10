
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: string;
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key is not configured");
    }

    const { messages, conversationContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    // Add financial context to the first system message if needed
    let formattedMessages = messages.map((message: Message) => ({
      role: message.role,
      content: message.content,
    }));

    if (conversationContext) {
      let systemMessageIndex = formattedMessages.findIndex(msg => msg.role === "system");
      const contextText = `You are Money Map's AI assistant for Indian personal finance. You provide advice based on the following user financial data: ${JSON.stringify(conversationContext)}`;
      if (systemMessageIndex === -1) {
        formattedMessages.unshift({ role: "system", content: contextText });
      } else {
        formattedMessages[systemMessageIndex].content += " " + contextText;
      }
    }

    const requestBody = {
      model: "mistralai/mistral-7b-instruct:free", // Using the specified free model
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7,
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://moneymap.app", // Required by OpenRouter
        "X-Title": "Money Map", // Required by OpenRouter
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    let assistantResponse = "";
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      assistantResponse = data.choices[0].message.content;
    } else {
      console.error("Invalid response format:", data);
      throw new Error("No valid response from OpenRouter API");
    }

    const estimatedTokens = Math.ceil(assistantResponse.length / 4);

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        tokens: estimatedTokens,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in chat-completion function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
