
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

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
    const { messages, conversationContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    // Format the messages for Gemini API
    const formattedMessages = messages.map((message: Message) => {
      // Gemini uses "user" and "model" roles, we need to map "assistant" to "model"
      const role = message.role === "assistant" ? "model" : message.role;
      return {
        role,
        parts: [{ text: message.content }]
      };
    });

    // Add financial context to the first system message if needed
    if (conversationContext) {
      // Find the first system message or create one if it doesn't exist
      let systemMessageIndex = formattedMessages.findIndex(msg => msg.role === "system");
      
      if (systemMessageIndex === -1) {
        // Insert a system message at the beginning
        formattedMessages.unshift({
          role: "system",
          parts: [{ text: `You are Money Map's AI assistant for Indian personal finance. You provide advice based on the following user financial data: ${JSON.stringify(conversationContext)}` }]
        });
      } else {
        // Enhance existing system message
        const existingContent = formattedMessages[systemMessageIndex].parts[0].text;
        formattedMessages[systemMessageIndex].parts[0].text = `${existingContent} You provide advice based on the following user financial data: ${JSON.stringify(conversationContext)}`;
      }
    }

    const requestBody = {
      contents: formattedMessages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    };

    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract the response text from Gemini's format
    let assistantResponse = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      assistantResponse = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("No valid response from Gemini API");
    }

    // Calculate approximate tokens (rough estimate - 4 chars per token)
    const estimatedTokens = Math.ceil(assistantResponse.length / 4);

    return new Response(
      JSON.stringify({ 
        response: assistantResponse, 
        tokens: estimatedTokens 
      }),
      {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  } catch (error) {
    console.error("Error in chat-completion function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
