import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { brainScore, strength, weakness, problemsSolved, currentStreak } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are a coding education AI. Generate a personalized 7-day study plan for a coding student.

Student profile:
- Brain Score: ${brainScore}/100
- Strength: ${strength}
- Weakness: ${weakness}
- Problems Solved: ${problemsSolved}
- Current Streak: ${currentStreak} days

Generate exactly 7 study tasks (one per day) that focus on improving their weaknesses while building on their strengths. Each task should be specific and actionable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a coding education planner. Return structured study plans." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_study_plan",
              description: "Create a weekly study plan with 7 tasks",
              parameters: {
                type: "object",
                properties: {
                  plan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        category: { type: "string" },
                        difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
                        estimated_time: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["title", "description", "category", "difficulty", "estimated_time", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["plan"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_study_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall) {
      const plan = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(plan), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback
    return new Response(JSON.stringify({
      plan: [
        { title: "Practice Arrays", description: "Solve 3 array problems", category: "Arrays", difficulty: "Easy", estimated_time: "30 min", reason: "Build fundamentals" },
        { title: "Learn Binary Search", description: "Study and implement binary search", category: "Searching", difficulty: "Medium", estimated_time: "45 min", reason: "Core algorithm" },
        { title: "Tree Traversals", description: "Practice BFS and DFS on trees", category: "Trees", difficulty: "Medium", estimated_time: "1 hour", reason: `Improve ${weakness}` },
        { title: "Dynamic Programming Intro", description: "Solve 2 DP problems", category: "DP", difficulty: "Medium", estimated_time: "1 hour", reason: "Pattern recognition" },
        { title: "Graph Problems", description: "Practice graph traversal problems", category: "Graphs", difficulty: "Hard", estimated_time: "1.5 hours", reason: `Target ${weakness}` },
        { title: "Code Review", description: "Review and optimize previous solutions", category: "Optimization", difficulty: "Easy", estimated_time: "30 min", reason: "Build on strength" },
        { title: "Mock Challenge", description: "Complete a timed coding challenge", category: "Mixed", difficulty: "Hard", estimated_time: "1 hour", reason: "Test preparation" },
      ],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("study-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
