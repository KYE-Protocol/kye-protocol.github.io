/* WebMCP — exposes KYE Protocol™ navigation + discovery tools to AI agents
 * via the browser. Spec: https://webmachinelearning.github.io/webmcp/
 *
 * The landing page itself does not host a live KYE Gateway, so the tools
 * here are navigation / discovery / spec-retrieval rather than mutating
 * runtime calls. A bank or vendor that hosts a conformant Gateway can
 * extend this with mutating tools that proxy to /v1/* endpoints.
 */
export function initWebMcp() {
  if (typeof navigator === "undefined" || !navigator.modelContext || typeof navigator.modelContext.provideContext !== "function") {
    return; // browser without WebMCP — silently skip
  }
  try {
    navigator.modelContext.provideContext({
      tools: [
        {
          name: "kye_open_section",
          description: "Scroll the KYE Protocol landing page to a named section (e.g. profiles, sectors, state-model, assurance, faq, vocab, urn, evolution, cmp, who, roi).",
          inputSchema: {
            type: "object",
            required: ["section"],
            properties: {
              section: { type: "string", description: "Section id (without the leading #)." },
            },
          },
          execute: async ({ section }) => {
            const id = String(section || "").replace(/^#/, "");
            const el = document.getElementById(id);
            if (!el) return { ok: false, error: `Unknown section: ${id}` };
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            history.replaceState(null, "", "#" + id);
            return { ok: true, section: id };
          },
        },
        {
          name: "kye_search_vocab",
          description: "Search the KYE Protocol vocabulary (entity types, actions, lifecycle states, decisions, signals, obligations).",
          inputSchema: {
            type: "object",
            required: ["query"],
            properties: { query: { type: "string" } },
          },
          execute: async ({ query }) => {
            const input = document.getElementById("vocab-q");
            if (!input) return { ok: false, error: "vocab section not present" };
            input.value = String(query || "");
            input.dispatchEvent(new Event("input", { bubbles: true }));
            document.getElementById("vocab")?.scrollIntoView({ behavior: "smooth", block: "start" });
            const items = Array.from(document.querySelectorAll("#vocab-out [data-term]")).map((n) => n.getAttribute("data-term"));
            return { ok: true, query, results: items };
          },
        },
        {
          name: "kye_parse_urn",
          description: "Parse a KYE Protocol URN of shape kye:<class>:<trust-domain>:<subclass>:<local>.",
          inputSchema: {
            type: "object",
            required: ["urn"],
            properties: { urn: { type: "string" } },
          },
          execute: async ({ urn }) => {
            const parts = String(urn || "").split(":");
            if (parts.length < 5 || parts[0] !== "kye") return { ok: false, error: "Not a KYE URN" };
            return {
              ok: true,
              class: parts[1],
              trust_domain: parts[2],
              subclass: parts[3],
              local: parts.slice(4).join(":"),
            };
          },
        },
        {
          name: "kye_list_profiles",
          description: "Return the inventory of all 15 KYE Protocol normative v1.0 profiles with descriptions and required endpoints.",
          inputSchema: { type: "object", properties: {} },
          execute: async () => {
            const mod = await import("./data/profiles.js").catch(() => null) ||
                        await import("../data/profiles.js").catch(() => null);
            if (!mod || !mod.PROFILES) return { ok: false, error: "Profile data not loaded" };
            return { ok: true, count: mod.PROFILES.length, profiles: mod.PROFILES };
          },
        },
        {
          name: "kye_discovery",
          description: "Return the agent-discovery URLs for KYE Protocol™ — API catalog, OpenAPI spec, MCP server card, agent skills, OAuth/OIDC metadata, whitepaper.",
          inputSchema: { type: "object", properties: {} },
          execute: async () => ({
            ok: true,
            site: location.origin,
            api_catalog: location.origin + "/.well-known/api-catalog",
            mcp_server_card: location.origin + "/.well-known/mcp/server-card.json",
            agent_skills: location.origin + "/.well-known/agent-skills/index.json",
            oauth_authorization_server: location.origin + "/.well-known/oauth-authorization-server",
            oauth_protected_resource: location.origin + "/.well-known/oauth-protected-resource",
            openid_configuration: location.origin + "/.well-known/openid-configuration",
            sitemap: location.origin + "/sitemap.xml",
            whitepaper: location.origin + "/whitepaper.html",
            llms_txt: location.origin + "/llms.txt",
            markdown: location.origin + "/index.md",
          }),
        },
      ],
    });
  } catch (err) {
    // Browser supports WebMCP but rejected our context — log and continue.
    if (typeof console !== "undefined") console.warn("WebMCP registration failed:", err);
  }
}
