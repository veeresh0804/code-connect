import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Code and language are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Executing ${language} code via AI...`);

    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a code execution engine. Execute the given ${language} code mentally and return ONLY the exact output that would be printed to stdout. If there are compilation or runtime errors, return the error message exactly as the compiler/interpreter would show it. Do not add any explanation, commentary, or formatting. Just the raw output or error.`,
          },
          {
            role: "user",
            content: `Execute this ${language} code and return only the output:\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        temperature: 0,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      throw new Error("Code execution service error");
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content?.trim() || "";

    // Check if the output looks like an error
    const errorPatterns = [
      "Error", "error:", "Exception", "Traceback", "SyntaxError",
      "TypeError", "NameError", "ValueError", "IndexError",
      "compilation failed", "segmentation fault", "undefined reference",
    ];
    const hasError = errorPatterns.some((p) =>
      output.toLowerCase().includes(p.toLowerCase())
    );

    return new Response(
      JSON.stringify({
        success: !hasError,
        output: output,
        error: hasError ? output : "",
        exitCode: hasError ? 1 : 0,
        executionTime: 0,
        language,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Code runner error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to execute code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
