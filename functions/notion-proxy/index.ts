const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { notionToken, databaseId, text, category } = await req.json();

    if (!notionToken || !databaseId || !text) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: notionToken, databaseId, text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const categoryName = (category || "task").charAt(0).toUpperCase() + (category || "task").slice(1);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${notionToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: {
          "Name": {
            title: [{ text: { content: text.slice(0, 100) } }],
          },
          "Category": {
            select: { name: categoryName },
          },
        },
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: text } }],
            },
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await notionResponse.json();

    if (!notionResponse.ok) {
      return new Response(
        JSON.stringify({ error: data.message || `Notion API error: ${notionResponse.status}`, details: data }),
        { status: notionResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, pageId: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = error instanceof DOMException && error.name === "AbortError" ? 504 : 500;
    return new Response(
      JSON.stringify({ error: status === 504 ? "Notion API request timed out" : message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
