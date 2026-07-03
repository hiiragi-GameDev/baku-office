globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { $ as $$SectionTabs } from "./SectionTabs_BZbOe6gd.mjs";
const $$ApprovalTabs = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$ApprovalTabs;
  const { active, showReview = false, showApprovals = false } = Astro2.props;
  const tabs = [
    { id: "review", href: "/review", label: "共有承認（申請）", show: showReview },
    { id: "approvals", href: "/approvals", label: "AI操作の承認", show: showApprovals }
  ];
  return renderTemplate`${renderComponent($$result, "SectionTabs", $$SectionTabs, { "active": active, "label": "承認", "tabs": tabs })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/components/ApprovalTabs.astro", void 0);
export {
  $$ApprovalTabs as $
};
