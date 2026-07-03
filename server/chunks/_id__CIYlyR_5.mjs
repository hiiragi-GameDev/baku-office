globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { c as renderHead, r as renderTemplate, a as addAttribute } from "./sequence_BESBTeYg.mjs";
import { env } from "cloudflare:workers";
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$id;
  const id = Astro2.params.id ?? "";
  const { getProject, projectPublicLPs } = await import("./projects_B_gexkwU.mjs");
  const project = await getProject(env, id);
  let allowed = !!(project && project.hub_enabled);
  if (project && !allowed && Astro2.url.searchParams.get("preview") === "1") {
    const { getSession, canDevelopApps } = await import("./auth_DL5yvmzT.mjs");
    const ses = await getSession(env, Astro2.request);
    if (ses && canDevelopApps(ses.role, ses.ctx)) allowed = true;
  }
  if (!project || !allowed) {
    return new Response("ページが見つかりません", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  const lps = await projectPublicLPs(env, id);
  const origin = Astro2.url.origin;
  return renderTemplate`<html lang="ja" data-astro-cid-c55btd6p> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${project.name}</title>${renderHead()}</head> <body data-astro-cid-c55btd6p> <div class="hero" data-astro-cid-c55btd6p> <h1 data-astro-cid-c55btd6p>${project.icon ? project.icon + " " : ""}${project.name}</h1> ${project.hub_intro && renderTemplate`<p data-astro-cid-c55btd6p>${project.hub_intro}</p>`} </div> <div class="wrap" data-astro-cid-c55btd6p> ${lps.length === 0 ? renderTemplate`<p class="empty" data-astro-cid-c55btd6p>公開中のページはまだありません。</p>` : renderTemplate`<div class="grid" data-astro-cid-c55btd6p> ${lps.map((l) => renderTemplate`<a class="lp"${addAttribute(`${origin}/p/${l.appId}`, "href")} data-astro-cid-c55btd6p> <div class="t" data-astro-cid-c55btd6p>${l.title}</div> <span class="go" data-astro-cid-c55btd6p>開く →</span> </a>`)} </div>`} <div class="foot" data-astro-cid-c55btd6p>Powered by baku-office</div> </div> </body></html>`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/hub/[id].astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/hub/[id].astro";
const $$url = "/hub/[id]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
