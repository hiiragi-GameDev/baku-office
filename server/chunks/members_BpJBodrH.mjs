globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_Bc18R3r1.mjs";
import { r as renderTemplate, m as maybeRenderHead, a as addAttribute, F as Fragment } from "./sequence_BESBTeYg.mjs";
import { r as renderComponent } from "./worker-entry_D_xSL4I4.mjs";
import { env } from "cloudflare:workers";
import { $ as $$App } from "./App_Wwjuh1XD.mjs";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Members = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Members;
  const { getSession } = await import("./auth_DL5yvmzT.mjs");
  const ses = await getSession(env, Astro2.request);
  if (!ses) return Astro2.redirect("/login", 302);
  if (ses.role !== "admin") return Astro2.redirect("/forbidden", 302);
  const { listUsers, listMemberConnectors } = await import("./users_DArBIlQW.mjs");
  const { roleLabel } = await import("./ctx_D9xObGWH.mjs").then((n) => n.J);
  const users = await listUsers(env);
  const conn = await listMemberConnectors(env);
  const roles = ["admin", "developer", "accounting", "clerical", "other", "member"];
  const CONNJA = { line: "LINE", discord: "Discord", slack: "Slack" };
  return renderTemplate`${renderComponent($$result, "App", $$App, { "title": "人・ロール管理", "active": "/settings", "data-astro-cid-mzuny3q7": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<h1 data-astro-cid-mzuny3q7>人・ロール管理</h1> <div class="card" data-astro-cid-mzuny3q7> <div class="row" data-astro-cid-mzuny3q7> <select id="inviteRole" aria-label="招待する人の役割" data-astro-cid-mzuny3q7>${roles.map((r) => renderTemplate`<option${addAttribute(r, "value")} data-astro-cid-mzuny3q7>${roleLabel(r)}</option>`)}</select> <button class="btn btn-primary" id="inviteBtn" style="flex:0 0 auto" data-astro-cid-mzuny3q7>招待コードを発行</button> </div> <p class="muted small" style="margin:.3rem 0 0" data-astro-cid-mzuny3q7>新規メンバーの招待です。<strong data-astro-cid-mzuny3q7>既にいるメンバーが LINE/Discord/Slack を使いたい場合は、各メンバー行の「🔗 連携」</strong>から発行してください（アカウントは増えません）。</p> <p class="muted" id="inviteOut" data-astro-cid-mzuny3q7></p> </div> <div class="table-wrap" style="margin-top:1rem" data-astro-cid-mzuny3q7><table data-astro-cid-mzuny3q7><thead data-astro-cid-mzuny3q7><tr data-astro-cid-mzuny3q7><th data-astro-cid-mzuny3q7>氏名・連携</th><th data-astro-cid-mzuny3q7>ロール</th><th data-astro-cid-mzuny3q7>状態</th><th data-astro-cid-mzuny3q7>操作</th></tr></thead><tbody data-astro-cid-mzuny3q7> ${users.map((u) => renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-mzuny3q7": true }, { "default": async ($$result3) => renderTemplate` <tr${addAttribute(u.id, "data-id")} data-astro-cid-mzuny3q7> <td data-astro-cid-mzuny3q7><div class="m-name-wrap" data-astro-cid-mzuny3q7><span class="m-name" data-astro-cid-mzuny3q7>${u.name || "(未設定)"}</span>${(conn[u.id] ?? []).map((c) => renderTemplate`<span${addAttribute("conn-badge conn-" + c, "class")}${addAttribute(CONNJA[c] + " 連携済み", "title")} data-astro-cid-mzuny3q7>${CONNJA[c] ?? c}</span>`)}</div></td> <td data-astro-cid-mzuny3q7><select class="role btn-sm"${addAttribute(u.id === "org", "disabled")} aria-label="役割" data-astro-cid-mzuny3q7>${roles.map((r) => renderTemplate`<option${addAttribute(r, "value")}${addAttribute(r === u.role, "selected")} data-astro-cid-mzuny3q7>${roleLabel(r)}</option>`)}</select></td> <td data-astro-cid-mzuny3q7>${u.status}${u.leave_requested_at ? renderTemplate`<span class="muted" data-astro-cid-mzuny3q7>・脱退申請中</span>` : null}</td> <td data-astro-cid-mzuny3q7><div class="m-ops" data-astro-cid-mzuny3q7> ${u.status === "pending" && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, { "data-astro-cid-mzuny3q7": true }, { "default": async ($$result4) => renderTemplate`<input class="approve-name" type="text"${addAttribute(u.name, "value")} placeholder="表示名" aria-label="承認時の表示名" style="width:7rem" data-astro-cid-mzuny3q7><button class="btn btn-sm btn-ok act" data-a="approve" data-astro-cid-mzuny3q7>承認</button><button class="btn btn-sm btn-danger act" data-a="reject" data-astro-cid-mzuny3q7>却下</button>` })}`} ${u.status === "active" && u.leave_requested_at && renderTemplate`<button class="btn btn-sm btn-danger act" data-a="leave_approve" data-astro-cid-mzuny3q7>脱退を承認</button>`} ${u.status === "active" && !u.leave_requested_at && u.id !== ses.uid && u.id !== "org" && renderTemplate`<button class="btn btn-sm btn-danger act" data-a="reject" data-astro-cid-mzuny3q7>無効化</button>`} ${u.status === "active" && u.id !== "org" && renderTemplate`<button class="btn btn-sm link-btn" type="button" data-astro-cid-mzuny3q7>🔗 連携</button>`} ${u.id !== "org" && u.id !== ses.uid && renderTemplate`<button class="btn btn-sm btn-danger del-user" title="名簿から完全に削除" data-astro-cid-mzuny3q7>削除</button>`} ${(u.status === "active" || u.id === "org") && renderTemplate`<button class="btn btn-sm btn-ghost edit-btn"${addAttribute(u.name ?? "", "data-name")} title="表示名を変更" style="margin-left:auto" data-astro-cid-mzuny3q7>編集</button>`} </div></td> </tr> <tr class="link-row"${addAttribute(u.id, "data-link")} hidden data-astro-cid-mzuny3q7><td colspan="4" data-astro-cid-mzuny3q7> <div class="link-box" data-astro-cid-mzuny3q7> <span class="muted small" data-astro-cid-mzuny3q7>外部連携コードを発行（このメンバーのアカウントに紐付け）：</span> <button class="btn btn-sm conn-issue" data-c="line" data-astro-cid-mzuny3q7>LINE</button> <button class="btn btn-sm conn-issue" data-c="discord" data-astro-cid-mzuny3q7>Discord</button> <button class="btn btn-sm conn-issue" data-c="slack" data-astro-cid-mzuny3q7>Slack</button> <div class="link-out small" style="margin-top:.4rem" data-astro-cid-mzuny3q7></div> </div> </td></tr> ` })}`)} ${users.length === 0 && renderTemplate`<tr data-astro-cid-mzuny3q7><td colspan="4" class="muted" data-astro-cid-mzuny3q7>メンバーがいません。招待コードを発行してください。</td></tr>`} </tbody></table></div>   `, "scripts": async ($$result2) => renderTemplate(_a || (_a = __template([`<script data-astro-rerun>
    const CONNJA={line:"LINE",discord:"Discord",slack:"Slack"};
    document.getElementById("inviteBtn").addEventListener("click",async(e)=>{
      const r=await window.bo.api("/api/members",{_action:"invite",role:document.getElementById("inviteRole").value},{btn:e.currentTarget,successMsg:null});
      if(r.ok){const code=r.data.code,url=location.origin+"/join?code="+encodeURIComponent(code);const out=document.getElementById("inviteOut");out.replaceChildren();out.append("コード：");const c=document.createElement("code");c.textContent=code;const m=document.createElement("span");m.className="muted";m.textContent="（1週間・1回）";const cp=document.createElement("button");cp.className="btn btn-sm";cp.type="button";cp.textContent="参加URLをコピー";out.append(c," ",m," ",cp);cp.addEventListener("click",()=>navigator.clipboard.writeText(url).then(()=>window.bo.toast("参加URLをコピーしました")).catch(()=>window.bo.toast("コピーできませんでした","err")));window.bo.toast("招待コードを発行しました");}
    });
    document.querySelectorAll("tr[data-id]").forEach(tr=>{const id=tr.dataset.id;
      tr.querySelectorAll(".act").forEach(b=>b.addEventListener("click",async(e)=>{const a=e.target.dataset.a;const body={_action:a,id};if(a==="approve"){const nm=tr.querySelector(".approve-name");if(nm)body.name=nm.value.trim();}const r=await window.bo.api("/api/members",body,{btn:e.target,successMsg:"更新しました"});if(r.ok)setTimeout(()=>location.reload(),500);}));
      const delBtn=tr.querySelector(".del-user");if(delBtn)delBtn.addEventListener("click",async(e)=>{const nm=(tr.querySelector(".m-name")?.textContent||"このメンバー").trim();if(!(await window.bo.confirm("「"+nm+"」を名簿から完全に削除します。よろしいですか？",{title:"メンバーの削除",confirmLabel:"削除",danger:true,irreversible:true,auditHref:"/diagnostics"})))return;const r=await window.bo.api("/api/members",{_action:"delete",id},{btn:e.target,successMsg:"削除しました"});if(r.ok)setTimeout(()=>location.reload(),500);});
      const sel=tr.querySelector(".role");if(sel&&!sel.disabled){let prev=sel.value;sel.addEventListener("change",async()=>{if(!(await window.bo.confirm("このメンバーのロールを「"+sel.value+"」に変更しますか？",{confirmLabel:"変更",danger:true,auditHref:"/diagnostics"}))){sel.value=prev;return;}const r=await window.bo.api("/api/members",{_action:"role",id,role:sel.value},{successMsg:"ロールを変更しました"});if(r.ok)prev=sel.value;else sel.value=prev;});}
      const editBtn=tr.querySelector(".edit-btn");if(editBtn)editBtn.addEventListener("click",async(e)=>{const cur=editBtn.dataset.name||"";const nv=window.prompt("新しい表示名を入力してください",cur);if(nv===null)return;const name=nv.trim();if(!name){window.bo.toast("名前を入力してください","err");return;}const r=await window.bo.api("/api/members",{_action:"rename",id,name},{btn:e.currentTarget,successMsg:"名前を変更しました"});if(r.ok)setTimeout(()=>location.reload(),500);});
      // 🔗 連携：行を開閉。
      const linkBtn=tr.querySelector(".link-btn");const linkRow=document.querySelector('tr.link-row[data-link="'+id+'"]');
      if(linkBtn&&linkRow)linkBtn.addEventListener("click",()=>{linkRow.hidden=!linkRow.hidden;});
      // 連携コード発行（LINE/Discord/Slack）。
      if(linkRow)linkRow.querySelectorAll(".conn-issue").forEach(b=>b.addEventListener("click",async(e)=>{
        const c=e.target.dataset.c;const r=await window.bo.api("/api/members",{_action:"link_code",id,connector:c},{btn:e.target,successMsg:null});
        const out=linkRow.querySelector(".link-out");if(!out)return;
        if(!(r.ok&&r.data.code)){out.textContent="発行できませんでした。";return;}
        const cj=CONNJA[c]||c;const code=r.data.code;
        out.replaceChildren();
        out.append("発行しました（3日・1回）。このメンバーに以下を案内してください：");
        const ol=document.createElement("div");ol.style.marginTop=".2rem";
        ol.textContent="① "+cj+"でこの団体の公式アカウント/Botを友だち追加・参加　② 次のメッセージを送信：";
        const codeLine=document.createElement("div");codeLine.style.margin=".2rem 0";
        const cc=document.createElement("code");cc.textContent="参加 "+code;codeLine.append(cc," ");
        const cp=document.createElement("button");cp.className="btn btn-sm";cp.type="button";cp.textContent="文面をコピー";cp.addEventListener("click",()=>navigator.clipboard.writeText("参加 "+code).then(()=>window.bo.toast("コピーしました")).catch(()=>{}));
        codeLine.append(cp);
        out.append(ol,codeLine);
        const note=document.createElement("div");note.className="muted";note.textContent="送信すると、このメンバーの既存アカウントに "+cj+" が連携されます（新しいアカウントは作られません）。";
        out.append(note);
      }));
    });
  <\/script>`]))) })}`;
}, "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/members.astro", void 0);
const $$file = "/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/members.astro";
const $$url = "/settings/members";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Members,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
