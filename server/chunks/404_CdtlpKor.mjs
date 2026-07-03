globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { c as renderHead, r as renderTemplate } from "./sequence_BESBTeYg.mjs";
const prerender = false;
const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="ja" data-astro-cid-zetdm5md> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><title>ページが見つかりません — baku-office</title>${renderHead()}</head> <body data-astro-cid-zetdm5md> <div class="card" data-astro-cid-zetdm5md> <p class="code" data-astro-cid-zetdm5md>404</p> <h1 data-astro-cid-zetdm5md>ページが見つかりません</h1> <p data-astro-cid-zetdm5md>お探しのページは移動または削除された可能性があります。URL をご確認のうえ、ホームからお探しください。</p> <a class="btn" href="/" data-astro-cid-zetdm5md>ホームへ戻る</a> <a class="btn ghost" href="/login" data-astro-cid-zetdm5md>ログイン</a> </div> </body></html>`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/404.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/404.astro";
const $$url = "/404";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
