import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Piston API - free code execution engine
const PISTON_API = "https://emkc.org/api/v2/piston";

// Map our language names to Piston language identifiers
const languageMap: Record<string, { language: string; version: string }> = {
  python: { language: "python", version: "3.10.0" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
  java: { language: "java", version: "15.0.2" },
};

serve(async (req) => {
  // Handle CORS preflight
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

    const langConfig = languageMap[language.toLowerCase()];
    if (!langConfig) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Executing ${langConfig.language} code...`);

    // Call Piston API to execute code
    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: language === "java" ? "Main.java" : `main.${language}`,
            content: code,
          },
        ],
        stdin: "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 5000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Piston API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Code execution service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Piston result:", result);

    // Format the response
    const output = result.run?.output || result.compile?.output || "";
    const stderr = result.run?.stderr || result.compile?.stderr || "";
    const exitCode = result.run?.code ?? result.compile?.code ?? 0;
    const executionTime = result.run?.cpu_time || 0;

    const hasError = exitCode !== 0 || stderr.length > 0;

    return new Response(
      JSON.stringify({
        success: !hasError,
        output: output.trim(),
        error: stderr.trim(),
        exitCode,
        executionTime,
        language: langConfig.language,
        version: langConfig.version,
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
