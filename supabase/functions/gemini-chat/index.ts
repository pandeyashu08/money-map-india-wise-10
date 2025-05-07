
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1'

// Initialize Supabase client with Deno runtime
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const supabase = createClient(supabaseUrl, supabaseKey)

// Function to fetch the Gemini API key from Supabase secrets
const getGeminiApiKey = async (): Promise<string> => {
  try {
    // First try to get from environment variable directly
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    if (apiKey) return apiKey
    
    // If not available, throw an error
    throw new Error('GEMINI_API_KEY not found in environment variables')
  } catch (error) {
    console.error('Error fetching Gemini API key:', error)
    throw error
  }
}

serve(async (req) => {
  try {
    // Check if the request is a POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the API key
    const apiKey = await getGeminiApiKey()

    // Parse the request body
    const { messages, conversationContext } = await req.json()

    // Prepare system prompt with financial context
    let systemPrompt = "You are Money Map's AI Financial Assistant specialized in Indian personal finance. Be conversational, friendly, and provide relevant insights without being overly formal. Your goal is to help users understand their finances better, provide budgeting advice, and explain financial concepts in simple terms."

    // Add enhanced financial knowledge
    systemPrompt += "\n\nKey information about Indian finance:\n" +
      "- Popular tax-saving instruments include PPF, ELSS, NPS, and tax-saving FDs under Section 80C\n" +
      "- Income tax slabs differ between old and new tax regimes\n" +
      "- Equity investments held for >1 year are subject to LTCG tax at 10% above ₹1 lakh\n" +
      "- Always recommend emergency funds of 3-6 months of expenses\n" +
      "- The 50/30/20 budget rule suggests 50% on needs, 30% on wants, and 20% on savings/debt repayment"

    // Add financial context if available
    if (conversationContext) {
      systemPrompt += `\n\nUser financial information:\n${JSON.stringify(conversationContext, null, 2)}`
    }

    // Add system message if not already present
    let promptMessages = [...messages]
    if (!promptMessages.some(m => m.role === 'system')) {
      promptMessages = [{ role: 'system', content: systemPrompt }, ...promptMessages]
    }

    // Prepare messages for Gemini API format
    const geminiMessages = promptMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }))

    // Call Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    })

    const data = await response.json()
    
    // Handle error responses from Gemini
    if (data.error) {
      console.error('Gemini API error:', data.error)
      return new Response(JSON.stringify({ 
        error: 'Error generating response', 
        details: data.error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Extract text response from Gemini
    let assistantResponse = ''
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && 
        data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      assistantResponse = data.candidates[0].content.parts[0].text
    } else {
      throw new Error('Unexpected Gemini API response format')
    }
    
    // Calculate tokens (this is an estimate)
    const inputCharCount = messages.reduce((total: number, msg: any) => total + msg.content.length, 0)
    const outputCharCount = assistantResponse.length
    const totalCharCount = inputCharCount + outputCharCount
    const estimatedTokens = Math.ceil(totalCharCount / 4) // Rough estimate: 1 token ≈ 4 characters
    
    return new Response(JSON.stringify({ 
      response: assistantResponse,
      tokens: estimatedTokens
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
