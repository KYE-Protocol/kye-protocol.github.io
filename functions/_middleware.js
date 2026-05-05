/* Cloudflare Pages Functions middleware — KYE Protocol™ landing.
 * Runs on every request. Adds:
 *   - RFC 8288 Link response headers (api-catalog, service-doc, mcp-server-card,
 *     agent-skills, oauth-authorization-server, oauth-protected-resource,
 *     openid-configuration, llms-txt, alternate text/markdown).
 *   - Markdown-for-agents content negotiation: Accept: text/markdown returns
 *     the .md sibling (index.md, whitepaper.md, legal.md) with
 *     Content-Type: text/markdown; charset=utf-8.
 *   - Correct Content-Type for extensionless /.well-known/* files.
 *   - Common security headers (X-Content-Type-Options, Referrer-Policy,
 *     Permissions-Policy, Strict-Transport-Security).
 *   - Vary: Accept on negotiable resources.
 *
 * Deploy: this file is picked up automatically by Cloudflare Pages when the
 * `functions/` directory is included in the deployed asset root.
 */

const LINK_HEADERS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</whitepaper.html>; rel="service-doc"; type="text/html"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</.well-known/oauth-authorization-server>; rel="oauth-authorization-server"; type="application/json"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</.well-known/openid-configuration>; rel="openid-configuration"; type="application/json"',
  '</llms.txt>; rel="llms-txt"; type="text/plain"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</index.md>; rel="alternate"; type="text/markdown"',
];

const CONTENT_TYPE_MAP = {
  '/.well-known/api-catalog': 'application/linkset+json; charset=utf-8',
  '/.well-known/oauth-authorization-server': 'application/json; charset=utf-8',
  '/.well-known/oauth-protected-resource': 'application/json; charset=utf-8',
  '/.well-known/openid-configuration': 'application/json; charset=utf-8',
};

const MARKDOWN_NEGOTIATION = {
  '/': '/index.md',
  '/index.html': '/index.md',
  '/whitepaper.html': '/whitepaper.md',
  '/legal.html': '/legal.md',
};

function applyHeaders(response, request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const headers = new Headers(response.headers);

  // Link headers (RFC 8288) on every page response (HTML or otherwise).
  headers.set('Link', LINK_HEADERS.join(', '));

  // Security baseline.
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content-Type for extensionless .well-known files.
  if (CONTENT_TYPE_MAP[path]) {
    headers.set('Content-Type', CONTENT_TYPE_MAP[path]);
  }

  // Mark Accept-negotiable resources.
  if (MARKDOWN_NEGOTIATION[path]) {
    headers.append('Vary', 'Accept');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function negotiateMarkdown(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const accept = (request.headers.get('Accept') || '').toLowerCase();
  const wantsMd =
    accept.includes('text/markdown') &&
    !accept.includes('text/html') &&
    MARKDOWN_NEGOTIATION[url.pathname];
  if (!wantsMd) return null;
  const mdUrl = new URL(MARKDOWN_NEGOTIATION[url.pathname], url);
  // Cloudflare Pages exposes assets via env.ASSETS.fetch in modern runtimes.
  const fetcher = (env && env.ASSETS && typeof env.ASSETS.fetch === 'function')
    ? env.ASSETS
    : null;
  const r = fetcher ? await fetcher.fetch(new Request(mdUrl, request)) : await fetch(mdUrl);
  if (!r.ok) return null;
  const body = await r.text();
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

export const onRequest = async (context) => {
  const md = await negotiateMarkdown(context);
  if (md) return applyHeaders(md, context.request);
  const response = await context.next();
  return applyHeaders(response, context.request);
};
