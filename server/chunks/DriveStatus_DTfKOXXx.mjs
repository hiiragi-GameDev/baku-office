globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { m as maybeRenderHead, a as addAttribute, r as renderTemplate } from "./sequence_BESBTeYg.mjs";
const $$DriveStatus = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$DriveStatus;
  const { status, setupHref = "/settings/google-setup" } = Astro2.props;
  const cls = (on) => on ? "pill brand" : "pill";
  return renderTemplate`${maybeRenderHead()}<div class="drive-status" style="display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin:.2rem 0 .6rem"> <span class="muted" style="font-size:.85rem">Google ドライブ連携：</span> <span${addAttribute(cls(status.read), "class")}>${status.read ? "取り込み・同期 可" : "未連携"}</span> <span${addAttribute(cls(status.write), "class")}>${status.write ? "バックアップ書き込み 可" : "書き込み 未許可"}</span> ${!status.read && renderTemplate`<a class="muted" style="font-size:.82rem" href="/drive">→ 連携する</a>`} ${status.read && !status.write && renderTemplate`<a class="muted" style="font-size:.82rem"${addAttribute(setupHref, "href")}>→ 書き込みを有効にする（再承認）</a>`} </div>`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/components/DriveStatus.astro", void 0);
export {
  $$DriveStatus as $
};
