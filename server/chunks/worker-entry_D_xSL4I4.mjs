globalThis.process ??= {};
globalThis.process.env ??= {};
import { EventEmitter } from "node:events";
import { Writable } from "node:stream";
import "cloudflare:workers";
import { d as defineMiddleware, v as NOOP_MIDDLEWARE_HEADER, w as s, A as AstroError, x as EndpointDidNotReturnAResponse, y as REROUTABLE_STATUS_CODES, z as REROUTE_DIRECTIVE_HEADER, B as isPropagatingHint, C as getPropagationHint$1, D as MissingMediaQueryDirective, G as NoMatchingImport, H as escapeHTML, J as bufferPropagatedHead, K as isHeadAndContent, O as isRenderTemplateResult, P as OnlyResponseCanBeReturned, Q as isPromise, S as promiseWithResolvers, T as encoder, V as ResponseSentError, W as chunkToByteArray, X as chunkToString, Y as chunkToByteArrayOrString, Z as toAttributeString, _ as markHTMLString, $ as renderSlotToString, m as maybeRenderHead, a0 as containsServerDirective, F as Fragment, a1 as renderChild, a2 as clsx, a3 as renderSlots, a4 as ServerIslandComponent, a5 as createAstroComponentInstance, a6 as Renderer, a7 as NoMatchingRenderer, a8 as formatList, a9 as NoClientOnlyHint, aa as internalSpreadAttributes, ab as voidElementNames, r as renderTemplate, e as createRenderInstruction, ac as renderElement$1, ad as SlotString, ae as mergeSlotInstructions, af as HTMLString, ag as isHTMLString, ah as isRenderInstruction, ai as isAstroComponentInstance, aj as isRenderInstance, ak as renderCspContent, al as isNode, am as isDeno, a as addAttribute, an as decryptString, ao as createSlotValueFromString, ap as DEFAULT_404_COMPONENT, aq as DEFAULT_404_ROUTE, ar as default404Instance, as as removeTrailingForwardSlash, at as getParams, au as prependForwardSlash, av as decodeKey, aw as UnableToLoadLogger, ax as RouteCache, s as sequence, ay as ActionNotFoundError, az as ReservedSlotName, aA as pipelineSymbol, aB as shouldAppendForwardSlash, aC as REDIRECT_STATUS_CODES, aD as ActionsReturnedInvalidDataError, aE as ROUTE_TYPE_HEADER, aF as appendForwardSlash, aG as i18nNoLocaleFoundInPath, aH as MiddlewareNoDataOrNextCalled, aI as MiddlewareNotAResponse, aJ as CacheNotEnabled, aK as ASTRO_ERROR_HEADER, aL as REWRITE_DIRECTIVE_HEADER_KEY, aM as REWRITE_DIRECTIVE_HEADER_VALUE, aN as validateAndDecodePathname, aO as collapseDuplicateSlashes, aP as ForbiddenRewrite, aQ as copyRequest, aR as setOriginPathname, aS as isRoute404, aT as isRoute500, j as joinPaths, aU as collapseDuplicateLeadingSlashes, aV as originPathnameSymbol, aW as generateCspDigest, aX as ASTRO_GENERATOR, aY as PrerenderClientAddressNotAvailable, aZ as ClientAddressNotAvailable, a_ as StaticClientAddressNotAvailable, a$ as routeHasHtmlExtension, b0 as getCustom404Route, b1 as MultiLevelEncodingError, b2 as appSymbol, b3 as getProps, b4 as fetchStateSymbol, b5 as AstroResponseHeadersReassigned, b6 as responseSentSymbol$1, b7 as getOriginPathname, b8 as LocalsReassigned, b9 as INTERNAL_RESPONSE_HEADERS, ba as escape, bb as isInternalPath, bc as collapseDuplicateTrailingSlashes, bd as hasFileExtension, be as removeLeadingForwardSlash, bf as getRouteGenerator, bg as SessionStorageInitError, bh as SessionStorageSaveError, bi as LocalsNotAnObject, bj as clientAddressSymbol, bk as fileExtension, bl as slash, bm as routeIsRedirect, bn as routeIsFallback, bo as getFallbackRoute, bp as findRouteToRewrite } from "./sequence_BESBTeYg.mjs";
const NOOP_ACTIONS_MOD = {
  server: {}
};
const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url, isPrerendered } = context;
    if (isPrerendered) {
      return next();
    }
    if (SAFE_METHODS.includes(request.method)) {
      return next();
    }
    const isSameOrigin = request.headers.get("origin") === url.origin;
    const hasContentType2 = request.headers.has("content-type");
    if (hasContentType2) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!isSameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}
const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};
const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next()
};
async function renderEndpoint(mod, context, isPrerendered, logger) {
  const { request, url } = context;
  const method = request.method.toUpperCase();
  let handler = mod[method] ?? mod["ALL"];
  if (!handler && method === "HEAD" && mod["GET"]) {
    handler = mod["GET"];
  }
  if (isPrerendered && !["GET", "HEAD"].includes(method)) {
    logger.warn(
      "router",
      `${url.pathname} ${s.bold(
        method
      )} requests are not available in static endpoints. Mark this page as server-rendered (\`export const prerender = false;\`) or update your config to \`output: 'server'\` to make all your pages server-rendered by default.`
    );
  }
  if (handler === void 0) {
    logger.warn(
      "router",
      `No API Route handler exists for the method "${method}" for the route "${url.pathname}".
Found handlers: ${Object.keys(mod).map((exp) => JSON.stringify(exp)).join(", ")}
` + ("all" in mod ? `One of the exported handlers is "all" (lowercase), did you mean to export 'ALL'?
` : "")
    );
    return new Response(null, { status: 404 });
  }
  if (typeof handler !== "function") {
    logger.error(
      "router",
      `The route "${url.pathname}" exports a value for the method "${method}", but it is of the type ${typeof handler} instead of a function.`
    );
    return new Response(null, { status: 500 });
  }
  let response = await handler.call(mod, context);
  if (!response || response instanceof Response === false) {
    throw new AstroError(EndpointDidNotReturnAResponse);
  }
  if (REROUTABLE_STATUS_CODES.includes(response.status)) {
    try {
      response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
    } catch (err) {
      if (err.message?.includes("immutable")) {
        response = new Response(response.body, response);
        response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
      } else {
        throw err;
      }
    }
  }
  if (method === "HEAD") {
    return new Response(null, response);
  }
  return response;
}
const AstroJSX = "astro:jsx";
function isVNode(vnode) {
  return vnode && typeof vnode === "object" && vnode[AstroJSX];
}
function isAstroComponentFactory(obj) {
  return obj == null ? false : obj.isAstroComponentFactory === true;
}
function isAPropagatingComponent(result, factory) {
  return isPropagatingHint(getPropagationHint(result, factory));
}
function getPropagationHint(result, factory) {
  return getPropagationHint$1(result, factory);
}
const PROP_TYPE = {
  Value: 0,
  JSON: 1,
  // Actually means Array
  RegExp: 2,
  Date: 3,
  Map: 4,
  Set: 5,
  BigInt: 6,
  URL: 7,
  Uint8Array: 8,
  Uint16Array: 9,
  Uint32Array: 10,
  Infinity: 11
};
function serializeArray(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = value.map((v) => {
    return convertToSerializedForm(v, metadata, parents);
  });
  parents.delete(value);
  return serialized;
}
function serializeObject(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  if (parents.has(value)) {
    throw new Error(`Cyclic reference detected while serializing props for <${metadata.displayName} client:${metadata.hydrate}>!

Cyclic references cannot be safely serialized for client-side usage. Please remove the cyclic reference.`);
  }
  parents.add(value);
  const serialized = Object.fromEntries(
    Object.entries(value).map(([k, v]) => {
      return [k, convertToSerializedForm(v, metadata, parents)];
    })
  );
  parents.delete(value);
  return serialized;
}
function convertToSerializedForm(value, metadata = {}, parents = /* @__PURE__ */ new WeakSet()) {
  const tag = Object.prototype.toString.call(value);
  switch (tag) {
    case "[object Date]": {
      return [PROP_TYPE.Date, value.toISOString()];
    }
    case "[object RegExp]": {
      return [PROP_TYPE.RegExp, value.source];
    }
    case "[object Map]": {
      return [PROP_TYPE.Map, serializeArray(Array.from(value), metadata, parents)];
    }
    case "[object Set]": {
      return [PROP_TYPE.Set, serializeArray(Array.from(value), metadata, parents)];
    }
    case "[object BigInt]": {
      return [PROP_TYPE.BigInt, value.toString()];
    }
    case "[object URL]": {
      return [PROP_TYPE.URL, value.toString()];
    }
    case "[object Array]": {
      return [PROP_TYPE.JSON, serializeArray(value, metadata, parents)];
    }
    case "[object Uint8Array]": {
      return [PROP_TYPE.Uint8Array, Array.from(value)];
    }
    case "[object Uint16Array]": {
      return [PROP_TYPE.Uint16Array, Array.from(value)];
    }
    case "[object Uint32Array]": {
      return [PROP_TYPE.Uint32Array, Array.from(value)];
    }
    default: {
      if (value !== null && typeof value === "object") {
        return [PROP_TYPE.Value, serializeObject(value, metadata, parents)];
      }
      if (value === Number.POSITIVE_INFINITY) {
        return [PROP_TYPE.Infinity, 1];
      }
      if (value === Number.NEGATIVE_INFINITY) {
        return [PROP_TYPE.Infinity, -1];
      }
      if (value === void 0) {
        return [PROP_TYPE.Value];
      }
      return [PROP_TYPE.Value, value];
    }
  }
}
function serializeProps(props, metadata) {
  const serialized = JSON.stringify(serializeObject(props, metadata));
  return serialized;
}
const transitionDirectivesToCopyOnIsland = Object.freeze([
  "data-astro-transition-scope",
  "data-astro-transition-persist",
  "data-astro-transition-persist-props"
]);
function extractDirectives(inputProps, clientDirectives) {
  let extracted = {
    isPage: false,
    hydration: null,
    props: {},
    propsWithoutTransitionAttributes: {}
  };
  for (const [key, value] of Object.entries(inputProps)) {
    if (key.startsWith("server:")) {
      if (key === "server:root") {
        extracted.isPage = true;
      }
    }
    if (key.startsWith("client:")) {
      if (!extracted.hydration) {
        extracted.hydration = {
          directive: "",
          value: "",
          componentUrl: "",
          componentExport: { value: "" }
        };
      }
      switch (key) {
        case "client:component-path": {
          extracted.hydration.componentUrl = value;
          break;
        }
        case "client:component-export": {
          extracted.hydration.componentExport.value = value;
          break;
        }
        // This is a special prop added to prove that the client hydration method
        // was added statically.
        case "client:component-hydration": {
          break;
        }
        case "client:display-name": {
          break;
        }
        default: {
          extracted.hydration.directive = key.split(":")[1];
          extracted.hydration.value = value;
          if (!clientDirectives.has(extracted.hydration.directive)) {
            const hydrationMethods = Array.from(clientDirectives.keys()).map((d) => `client:${d}`).join(", ");
            throw new Error(
              `Error: invalid hydration directive "${key}". Supported hydration methods: ${hydrationMethods}`
            );
          }
          if (extracted.hydration.directive === "media" && typeof extracted.hydration.value !== "string") {
            throw new AstroError(MissingMediaQueryDirective);
          }
          break;
        }
      }
    } else {
      extracted.props[key] = value;
      if (!transitionDirectivesToCopyOnIsland.includes(key)) {
        extracted.propsWithoutTransitionAttributes[key] = value;
      }
    }
  }
  for (const sym of Object.getOwnPropertySymbols(inputProps)) {
    extracted.props[sym] = inputProps[sym];
    extracted.propsWithoutTransitionAttributes[sym] = inputProps[sym];
  }
  return extracted;
}
async function generateHydrateScript(scriptOptions, metadata) {
  const { renderer, result, astroId, props, attrs } = scriptOptions;
  const { hydrate, componentUrl, componentExport } = metadata;
  if (!componentExport.value) {
    throw new AstroError({
      ...NoMatchingImport,
      message: NoMatchingImport.message(metadata.displayName)
    });
  }
  const island = {
    children: "",
    props: {
      // This is for HMR, probably can avoid it in prod
      uid: astroId
    }
  };
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      island.props[key] = escapeHTML(value);
    }
  }
  island.props["component-url"] = await result.resolve(decodeURI(componentUrl));
  if (renderer.clientEntrypoint) {
    island.props["component-export"] = componentExport.value;
    island.props["renderer-url"] = await result.resolve(
      decodeURI(renderer.clientEntrypoint.toString())
    );
    island.props["props"] = escapeHTML(serializeProps(props, metadata));
  }
  island.props["ssr"] = "";
  island.props["client"] = hydrate;
  let beforeHydrationUrl = await result.resolve("astro:scripts/before-hydration.js");
  if (beforeHydrationUrl.length) {
    island.props["before-hydration-url"] = beforeHydrationUrl;
  }
  island.props["opts"] = escapeHTML(
    JSON.stringify({
      name: metadata.displayName,
      value: metadata.hydrateArgs || ""
    })
  );
  transitionDirectivesToCopyOnIsland.forEach((name) => {
    if (typeof props[name] !== "undefined") {
      island.props[name] = props[name];
    }
  });
  return island;
}
const dictionary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY";
const binary = dictionary.length;
function bitwise(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash = hash & hash;
  }
  return hash;
}
function shorthash(text) {
  let num;
  let result = "";
  let integer = bitwise(text);
  const sign = integer < 0 ? "Z" : "";
  integer = Math.abs(integer);
  while (integer >= binary) {
    num = integer % binary;
    integer = Math.floor(integer / binary);
    result = dictionary[num] + result;
  }
  if (integer > 0) {
    result = dictionary[integer] + result;
  }
  return sign + result;
}
const DOCTYPE_EXP = /<!doctype html/i;
async function renderToString(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response) return templateResult;
  let str = "";
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          str += doctype;
        }
      }
      if (chunk instanceof Response) return;
      str += chunkToString(result, chunk);
    }
  };
  await templateResult.render(destination);
  return str;
}
async function renderToReadableStream(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response) return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  return new ReadableStream({
    start(controller) {
      const destination = {
        write(chunk) {
          if (isPage && !renderedFirstPageChunk) {
            renderedFirstPageChunk = true;
            if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              controller.enqueue(encoder.encode(doctype));
            }
          }
          if (chunk instanceof Response) {
            throw new AstroError({
              ...ResponseSentError
            });
          }
          const bytes = chunkToByteArray(result, chunk);
          controller.enqueue(bytes);
        }
      };
      (async () => {
        try {
          await templateResult.render(destination);
          controller.close();
        } catch (e) {
          if (AstroError.is(e) && !e.loc) {
            e.setLocation({
              file: route?.component
            });
          }
          setTimeout(() => controller.error(e), 0);
        }
      })();
    },
    cancel() {
      result.cancelled = true;
    }
  });
}
async function callComponentAsTemplateResultOrResponse(result, componentFactory, props, children, route) {
  const factoryResult = await componentFactory(result, props, children);
  if (factoryResult instanceof Response) {
    return factoryResult;
  } else if (isHeadAndContent(factoryResult)) {
    if (!isRenderTemplateResult(factoryResult.content)) {
      throw new AstroError({
        ...OnlyResponseCanBeReturned,
        message: OnlyResponseCanBeReturned.message(
          route?.route,
          typeof factoryResult
        ),
        location: {
          file: route?.component
        }
      });
    }
    return factoryResult.content;
  } else if (!isRenderTemplateResult(factoryResult)) {
    throw new AstroError({
      ...OnlyResponseCanBeReturned,
      message: OnlyResponseCanBeReturned.message(route?.route, typeof factoryResult),
      location: {
        file: route?.component
      }
    });
  }
  return factoryResult;
}
async function bufferHeadContent(result) {
  await bufferPropagatedHead(result);
}
async function renderToAsyncIterable(result, componentFactory, props, children, isPage = false, route) {
  const templateResult = await callComponentAsTemplateResultOrResponse(
    result,
    componentFactory,
    props,
    children,
    route
  );
  if (templateResult instanceof Response) return templateResult;
  let renderedFirstPageChunk = false;
  if (isPage) {
    await bufferHeadContent(result);
  }
  let error2 = null;
  let next = null;
  const buffer2 = [];
  let renderingComplete = false;
  const iterator = {
    async next() {
      if (result.cancelled) return { done: true, value: void 0 };
      if (next !== null) {
        await next.promise;
      } else if (!renderingComplete && !buffer2.length) {
        next = promiseWithResolvers();
        await next.promise;
      }
      if (!renderingComplete) {
        next = promiseWithResolvers();
      }
      if (error2) {
        throw error2;
      }
      let length = 0;
      let stringToEncode = "";
      for (let i = 0, len = buffer2.length; i < len; i++) {
        const bufferEntry = buffer2[i];
        if (typeof bufferEntry === "string") {
          const nextIsString = i + 1 < len && typeof buffer2[i + 1] === "string";
          stringToEncode += bufferEntry;
          if (!nextIsString) {
            const encoded = encoder.encode(stringToEncode);
            length += encoded.length;
            stringToEncode = "";
            buffer2[i] = encoded;
          } else {
            buffer2[i] = "";
          }
        } else {
          length += bufferEntry.length;
        }
      }
      let mergedArray = new Uint8Array(length);
      let offset = 0;
      for (let i = 0, len = buffer2.length; i < len; i++) {
        const item = buffer2[i];
        if (item === "") {
          continue;
        }
        mergedArray.set(item, offset);
        offset += item.length;
      }
      buffer2.length = 0;
      const returnValue = {
        // The iterator is done when rendering has finished
        // and there are no more chunks to return.
        done: length === 0 && renderingComplete,
        value: mergedArray
      };
      return returnValue;
    },
    async return() {
      result.cancelled = true;
      return { done: true, value: void 0 };
    }
  };
  const destination = {
    write(chunk) {
      if (isPage && !renderedFirstPageChunk) {
        renderedFirstPageChunk = true;
        if (!result.partial && !DOCTYPE_EXP.test(String(chunk))) {
          const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
          buffer2.push(encoder.encode(doctype));
        }
      }
      if (chunk instanceof Response) {
        throw new AstroError(ResponseSentError);
      }
      const bytes = chunkToByteArrayOrString(result, chunk);
      if (bytes.length > 0) {
        buffer2.push(bytes);
        next?.resolve();
      } else if (buffer2.length > 0) {
        next?.resolve();
      }
    }
  };
  const renderResult = toPromise(() => templateResult.render(destination));
  renderResult.catch((err) => {
    error2 = err;
  }).finally(() => {
    renderingComplete = true;
    next?.resolve();
  });
  return {
    [Symbol.asyncIterator]() {
      return iterator;
    }
  };
}
function toPromise(fn) {
  try {
    const result = fn();
    return isPromise(result) ? result : Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}
function componentIsHTMLElement(Component) {
  return typeof HTMLElement !== "undefined" && HTMLElement.isPrototypeOf(Component);
}
async function renderHTMLElement$1(result, constructor, props, slots) {
  const name = getHTMLElementName(constructor);
  let attrHTML = "";
  for (const attr in props) {
    attrHTML += ` ${attr}="${toAttributeString(await props[attr])}"`;
  }
  return markHTMLString(
    `<${name}${attrHTML}>${await renderSlotToString(result, slots?.default)}</${name}>`
  );
}
function getHTMLElementName(constructor) {
  const definedName = customElements.getName(constructor);
  if (definedName) return definedName;
  const assignedName = constructor.name.replace(/^HTML|Element$/g, "").replace(/[A-Z]/g, "-$&").toLowerCase().replace(/^-/, "html-");
  return assignedName;
}
const needsHeadRenderingSymbol = /* @__PURE__ */ Symbol.for("astro.needsHeadRendering");
const rendererAliases = /* @__PURE__ */ new Map([["solid", "solid-js"]]);
const clientOnlyValues = /* @__PURE__ */ new Set(["solid-js", "react", "preact", "vue", "svelte"]);
function guessRenderers(componentUrl) {
  const extname = componentUrl?.split(".").pop();
  switch (extname) {
    case "svelte":
      return ["@astrojs/svelte"];
    case "vue":
      return ["@astrojs/vue"];
    case "jsx":
    case "tsx":
      return ["@astrojs/react", "@astrojs/preact", "@astrojs/solid-js", "@astrojs/vue (jsx)"];
    case void 0:
    default:
      return [
        "@astrojs/react",
        "@astrojs/preact",
        "@astrojs/solid-js",
        "@astrojs/vue",
        "@astrojs/svelte"
      ];
  }
}
function isFragmentComponent(Component) {
  return Component === Fragment;
}
function isHTMLComponent(Component) {
  return Component && Component["astro:html"] === true;
}
const ASTRO_SLOT_EXP = /<\/?astro-slot\b[^>]*>/g;
const ASTRO_STATIC_SLOT_EXP = /<\/?astro-static-slot\b[^>]*>/g;
function removeStaticAstroSlot(html, supportsAstroStaticSlot = true) {
  const exp = supportsAstroStaticSlot ? ASTRO_STATIC_SLOT_EXP : ASTRO_SLOT_EXP;
  return html.replace(exp, "");
}
async function renderFrameworkComponent(result, displayName, Component, _props, slots = {}) {
  if (!Component && "client:only" in _props === false) {
    throw new Error(
      `Unable to render ${displayName} because it is ${Component}!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  const { renderers: renderers2, clientDirectives } = result;
  const metadata = {
    astroStaticSlot: true,
    displayName
  };
  const { hydration, isPage, props, propsWithoutTransitionAttributes } = extractDirectives(
    _props,
    clientDirectives
  );
  let html = "";
  let attrs = void 0;
  if (hydration) {
    metadata.hydrate = hydration.directive;
    metadata.hydrateArgs = hydration.value;
    metadata.componentExport = hydration.componentExport;
    metadata.componentUrl = hydration.componentUrl;
  }
  const probableRendererNames = guessRenderers(metadata.componentUrl);
  const validRenderers = renderers2.filter((r) => r.name !== "astro:jsx");
  const { children, slotInstructions } = await renderSlots(result, slots);
  let renderer;
  if (metadata.hydrate !== "only") {
    let isTagged = false;
    try {
      isTagged = Component && Component[Renderer];
    } catch {
    }
    if (isTagged) {
      const rendererName = Component[Renderer];
      renderer = renderers2.find(({ name }) => name === rendererName);
    }
    if (!renderer) {
      let error2;
      for (const r of renderers2) {
        try {
          if (await r.ssr.check.call({ result }, Component, props, children, metadata)) {
            renderer = r;
            break;
          }
        } catch (e) {
          error2 ??= e;
        }
      }
      if (!renderer && error2) {
        throw error2;
      }
    }
    if (!renderer && typeof HTMLElement === "function" && componentIsHTMLElement(Component)) {
      const output = await renderHTMLElement$1(
        result,
        Component,
        _props,
        slots
      );
      return {
        render(destination) {
          destination.write(output);
        }
      };
    }
  } else {
    if (metadata.hydrateArgs) {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        renderer = renderers2.find(
          ({ name }) => name === `@astrojs/${rendererName}` || name === rendererName
        );
      }
    }
    if (!renderer && validRenderers.length === 1) {
      renderer = validRenderers[0];
    }
    if (!renderer) {
      const extname = metadata.componentUrl?.split(".").pop();
      renderer = renderers2.find(({ name }) => name === `@astrojs/${extname}` || name === extname);
    }
    if (!renderer && metadata.hydrateArgs) {
      const rendererName = metadata.hydrateArgs;
      if (typeof rendererName === "string") {
        renderer = renderers2.find(({ name }) => name === rendererName);
      }
    }
  }
  if (!renderer) {
    if (metadata.hydrate === "only") {
      const rendererName = rendererAliases.has(metadata.hydrateArgs) ? rendererAliases.get(metadata.hydrateArgs) : metadata.hydrateArgs;
      if (clientOnlyValues.has(rendererName)) {
        const plural = validRenderers.length > 1;
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else {
        throw new AstroError({
          ...NoClientOnlyHint,
          message: NoClientOnlyHint.message(metadata.displayName),
          hint: NoClientOnlyHint.hint(
            probableRendererNames.map((r) => r.replace("@astrojs/", "")).join("|")
          )
        });
      }
    } else if (typeof Component !== "string") {
      const matchingRenderers = validRenderers.filter(
        (r) => probableRendererNames.includes(r.name)
      );
      const plural = validRenderers.length > 1;
      if (matchingRenderers.length === 0) {
        throw new AstroError({
          ...NoMatchingRenderer,
          message: NoMatchingRenderer.message(
            metadata.displayName,
            metadata?.componentUrl?.split(".").pop(),
            plural,
            validRenderers.length
          ),
          hint: NoMatchingRenderer.hint(
            formatList(probableRendererNames.map((r) => "`" + r + "`"))
          )
        });
      } else if (matchingRenderers.length === 1) {
        renderer = matchingRenderers[0];
        ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
          { result },
          Component,
          propsWithoutTransitionAttributes,
          children,
          metadata
        ));
      } else {
        throw new Error(`Unable to render ${metadata.displayName}!

This component likely uses ${formatList(probableRendererNames)},
but Astro encountered an error during server-side rendering.

Please ensure that ${metadata.displayName}:
1. Does not unconditionally access browser-specific globals like \`window\` or \`document\`.
   If this is unavoidable, use the \`client:only\` hydration directive.
2. Does not conditionally return \`null\` or \`undefined\` when rendered on the server.
3. If using multiple JSX frameworks at the same time (e.g. React + Preact), pass the correct \`include\`/\`exclude\` options to integrations.

If you're still stuck, please open an issue on GitHub or join us at https://astro.build/chat.`);
      }
    }
  } else {
    if (metadata.hydrate === "only") {
      html = await renderSlotToString(result, slots?.fallback);
    } else {
      performance.now();
      ({ html, attrs } = await renderer.ssr.renderToStaticMarkup.call(
        { result },
        Component,
        propsWithoutTransitionAttributes,
        children,
        metadata
      ));
    }
  }
  if (!html && typeof Component === "string") {
    const Tag = sanitizeElementName(Component);
    const childSlots = Object.values(children).join("");
    const renderTemplateResult = renderTemplate`<${Tag}${internalSpreadAttributes(
      props,
      true,
      Tag
    )}${markHTMLString(
      childSlots === "" && voidElementNames.test(Tag) ? `/>` : `>${childSlots}</${Tag}>`
    )}`;
    html = "";
    const destination = {
      write(chunk) {
        if (chunk instanceof Response) return;
        html += chunkToString(result, chunk);
      }
    };
    await renderTemplateResult.render(destination);
  }
  if (!hydration) {
    return {
      render(destination) {
        if (slotInstructions) {
          for (const instruction of slotInstructions) {
            destination.write(instruction);
          }
        }
        if (isPage || renderer?.name === "astro:jsx") {
          destination.write(html);
        } else if (html && html.length > 0) {
          destination.write(
            markHTMLString(removeStaticAstroSlot(html, renderer?.ssr?.supportsAstroStaticSlot))
          );
        }
      }
    };
  }
  const astroId = shorthash(
    `<!--${metadata.componentExport.value}:${metadata.componentUrl}-->
${html}
${serializeProps(
      props,
      metadata
    )}`
  );
  const island = await generateHydrateScript(
    { renderer, result, astroId, props, attrs },
    metadata
  );
  let unrenderedSlots = [];
  if (html) {
    if (Object.keys(children).length > 0) {
      for (const key of Object.keys(children)) {
        let tagName = renderer?.ssr?.supportsAstroStaticSlot ? !!metadata.hydrate ? "astro-slot" : "astro-static-slot" : "astro-slot";
        let expectedHTML = key === "default" ? `<${tagName}>` : `<${tagName} name="${escapeHTML(key)}">`;
        if (!html.includes(expectedHTML)) {
          unrenderedSlots.push(key);
        }
      }
    }
  } else {
    unrenderedSlots = Object.keys(children);
  }
  const template = unrenderedSlots.length > 0 ? unrenderedSlots.map(
    (key) => `<template data-astro-template${key !== "default" ? `="${escapeHTML(key)}"` : ""}>${children[key]}</template>`
  ).join("") : "";
  island.children = `${html ?? ""}${template}`;
  if (island.children) {
    island.props["await-children"] = "";
    island.children += `<!--astro:end-->`;
  }
  return {
    render(destination) {
      if (slotInstructions) {
        for (const instruction of slotInstructions) {
          destination.write(instruction);
        }
      }
      destination.write(createRenderInstruction({ type: "directive", hydration }));
      if (hydration.directive !== "only" && renderer?.ssr.renderHydrationScript) {
        destination.write(
          createRenderInstruction({
            type: "renderer-hydration-script",
            rendererName: renderer.name,
            render: renderer.ssr.renderHydrationScript
          })
        );
      }
      const renderedElement = renderElement$1("astro-island", island, false);
      destination.write(markHTMLString(renderedElement));
    }
  };
}
function sanitizeElementName(tag) {
  const unsafe = /[&<>'"\s]+/;
  if (!unsafe.test(tag)) return tag;
  return tag.trim().split(unsafe)[0].trim();
}
function renderFragmentComponent(result, slots = {}) {
  const slot = slots?.default;
  const preRendered = slot?.(result);
  return {
    render(destination) {
      if (preRendered == null) return;
      return renderChild(destination, preRendered);
    }
  };
}
async function renderHTMLComponent(result, Component, _props, slots = {}) {
  const { slotInstructions, children } = await renderSlots(result, slots);
  const html = Component({ slots: children });
  const hydrationHtml = slotInstructions ? slotInstructions.map((instr) => chunkToString(result, instr)).join("") : "";
  return {
    render(destination) {
      destination.write(markHTMLString(hydrationHtml + html));
    }
  };
}
function renderAstroComponent(result, displayName, Component, props, slots = {}) {
  if (containsServerDirective(props)) {
    const serverIslandComponent = new ServerIslandComponent(result, props, slots, displayName);
    result._metadata.propagators.add(serverIslandComponent);
    return serverIslandComponent;
  }
  const instance = createAstroComponentInstance(result, displayName, Component, props, slots);
  return {
    render(destination) {
      return instance.render(destination);
    }
  };
}
function renderComponent(result, displayName, Component, props, slots = {}) {
  if (isPromise(Component)) {
    return Component.catch(handleCancellation).then((x) => {
      return renderComponent(result, displayName, x, props, slots);
    });
  }
  if (isFragmentComponent(Component)) {
    return renderFragmentComponent(result, slots);
  }
  props = normalizeProps(props);
  if (isHTMLComponent(Component)) {
    return renderHTMLComponent(result, Component, props, slots).catch(handleCancellation);
  }
  if (isAstroComponentFactory(Component)) {
    return renderAstroComponent(result, displayName, Component, props, slots);
  }
  return renderFrameworkComponent(result, displayName, Component, props, slots).catch(
    handleCancellation
  );
  function handleCancellation(e) {
    if (result.cancelled)
      return {
        render() {
        }
      };
    throw e;
  }
}
function normalizeProps(props) {
  if (props["class:list"] !== void 0) {
    const value = props["class:list"];
    delete props["class:list"];
    props["class"] = clsx(props["class"], value);
    if (props["class"] === "") {
      delete props["class"];
    }
  }
  return props;
}
async function renderComponentToString(result, displayName, Component, props, slots = {}, isPage = false, route) {
  let str = "";
  let renderedFirstPageChunk = false;
  let head = "";
  if (isPage && !result.partial && nonAstroPageNeedsHeadInjection(Component)) {
    head += chunkToString(result, maybeRenderHead());
  }
  try {
    const destination = {
      write(chunk) {
        if (isPage && !result.partial && !renderedFirstPageChunk) {
          renderedFirstPageChunk = true;
          if (!/<!doctype html/i.test(String(chunk))) {
            const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
            str += doctype + head;
          }
        }
        if (chunk instanceof Response) return;
        str += chunkToString(result, chunk);
      }
    };
    const renderInstance = await renderComponent(result, displayName, Component, props, slots);
    if (containsServerDirective(props)) {
      await bufferHeadContent(result);
    }
    await renderInstance.render(destination);
  } catch (e) {
    if (AstroError.is(e) && !e.loc) {
      e.setLocation({
        file: route?.component
      });
    }
    throw e;
  }
  return str;
}
function nonAstroPageNeedsHeadInjection(pageComponent) {
  return !!pageComponent?.[needsHeadRenderingSymbol];
}
const ClientOnlyPlaceholder$1 = "astro-client-only";
const hasTriedRenderComponentSymbol = /* @__PURE__ */ Symbol("hasTriedRenderComponent");
async function renderJSX(result, vnode) {
  switch (true) {
    case vnode instanceof HTMLString:
      if (vnode.toString().trim() === "") {
        return "";
      }
      return vnode;
    case typeof vnode === "string":
      return markHTMLString(escapeHTML(vnode));
    case typeof vnode === "function":
      return vnode;
    case (!vnode && vnode !== 0):
      return "";
    case Array.isArray(vnode): {
      const renderedItems = await Promise.all(vnode.map((v) => renderJSX(result, v)));
      let instructions = null;
      let content = "";
      for (const item of renderedItems) {
        if (item instanceof SlotString) {
          content += item;
          instructions = mergeSlotInstructions(instructions, item);
        } else {
          content += item;
        }
      }
      if (instructions) {
        return markHTMLString(new SlotString(content, instructions));
      }
      return markHTMLString(content);
    }
  }
  return renderJSXVNode(result, vnode);
}
async function renderJSXVNode(result, vnode) {
  if (isVNode(vnode)) {
    switch (true) {
      case !vnode.type: {
        throw new Error(`Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
      }
      case vnode.type === /* @__PURE__ */ Symbol.for("astro:fragment"):
        return renderJSX(result, vnode.props.children);
      case isAstroComponentFactory(vnode.type): {
        let props = {};
        let slots = {};
        for (const [key, value] of Object.entries(vnode.props ?? {})) {
          if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
            slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
          } else {
            props[key] = value;
          }
        }
        const str = await renderComponentToString(
          result,
          vnode.type.name,
          vnode.type,
          props,
          slots
        );
        const html = markHTMLString(str);
        return html;
      }
      case (!vnode.type && vnode.type !== 0):
        return "";
      case (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder$1 && !vnode.type.includes("-")):
        return markHTMLString(await renderElement(result, vnode.type, vnode.props ?? {}));
    }
    if (vnode.type) {
      let extractSlots2 = function(child) {
        if (Array.isArray(child)) {
          return child.map((c) => extractSlots2(c));
        }
        if (!isVNode(child)) {
          _slots.default.push(child);
          return;
        }
        if ("slot" in child.props && !isCustomElement) {
          _slots[child.props.slot] = [..._slots[child.props.slot] ?? [], child];
          delete child.props.slot;
          return;
        }
        _slots.default.push(child);
      };
      if (typeof vnode.type === "function" && vnode.props["server:root"]) {
        const output2 = await vnode.type(vnode.props ?? {});
        return await renderJSX(result, output2);
      }
      if (typeof vnode.type === "function") {
        if (vnode.props[hasTriedRenderComponentSymbol]) {
          delete vnode.props[hasTriedRenderComponentSymbol];
          const output2 = await vnode.type(vnode.props ?? {});
          if (output2?.[AstroJSX] || !output2) {
            return await renderJSXVNode(result, output2);
          } else {
            return;
          }
        } else {
          vnode.props[hasTriedRenderComponentSymbol] = true;
        }
      }
      const { children = null, ...props } = vnode.props ?? {};
      const _slots = {
        default: []
      };
      const isCustomElement = typeof vnode.type === "string" && vnode.type.includes("-");
      extractSlots2(children);
      for (const [key, value] of Object.entries(props)) {
        if (value?.["$$slot"]) {
          _slots[key] = value;
          delete props[key];
        }
      }
      const slotPromises = [];
      const slots = {};
      for (const [key, value] of Object.entries(_slots)) {
        slotPromises.push(
          renderJSX(result, value).then((output2) => {
            if (output2.toString().trim().length === 0) return;
            slots[key] = () => output2;
          })
        );
      }
      await Promise.all(slotPromises);
      let output;
      if (vnode.type === ClientOnlyPlaceholder$1 && vnode.props["client:only"]) {
        output = await renderComponentToString(
          result,
          vnode.props["client:display-name"] ?? "",
          null,
          props,
          slots
        );
      } else {
        output = await renderComponentToString(
          result,
          typeof vnode.type === "function" ? vnode.type.name : vnode.type,
          vnode.type,
          props,
          slots
        );
      }
      return markHTMLString(output);
    }
  }
  return markHTMLString(`${vnode}`);
}
async function renderElement(result, tag, { children, ...props }) {
  return markHTMLString(
    `<${tag}${spreadAttributes(props)}${markHTMLString(
      (children == null || children === "") && voidElementNames.test(tag) ? `/>` : `>${children == null ? "" : await renderJSX(result, prerenderElementChildren$1(tag, children))}</${tag}>`
    )}`
  );
}
function prerenderElementChildren$1(tag, children) {
  if (typeof children === "string" && (tag === "style" || tag === "script")) {
    return markHTMLString(children);
  } else {
    return children;
  }
}
const ClientOnlyPlaceholder = "astro-client-only";
function renderJSXToQueue(vnode, result, queue, pool, stack, parent, metadata) {
  if (vnode instanceof HTMLString) {
    const html = vnode.toString();
    if (html.trim() === "") return;
    const node = pool.acquire("html-string", html);
    node.html = html;
    queue.nodes.push(node);
    return;
  }
  if (typeof vnode === "string") {
    const node = pool.acquire("text", vnode);
    node.content = vnode;
    queue.nodes.push(node);
    return;
  }
  if (typeof vnode === "number" || typeof vnode === "boolean") {
    const str = String(vnode);
    const node = pool.acquire("text", str);
    node.content = str;
    queue.nodes.push(node);
    return;
  }
  if (vnode == null || vnode === false) {
    return;
  }
  if (Array.isArray(vnode)) {
    for (let i = vnode.length - 1; i >= 0; i = i - 1) {
      stack.push({ node: vnode[i], parent, metadata });
    }
    return;
  }
  if (!isVNode(vnode)) {
    const str = String(vnode);
    const node = pool.acquire("text", str);
    node.content = str;
    queue.nodes.push(node);
    return;
  }
  handleVNode(vnode, result, queue, pool, stack, parent, metadata);
}
function handleVNode(vnode, result, queue, pool, stack, parent, metadata) {
  if (!vnode.type) {
    throw new Error(
      `Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`
    );
  }
  if (vnode.type === /* @__PURE__ */ Symbol.for("astro:fragment")) {
    stack.push({ node: vnode.props?.children, parent, metadata });
    return;
  }
  if (isAstroComponentFactory(vnode.type)) {
    const factory = vnode.type;
    let props = {};
    let slots = {};
    for (const [key, value] of Object.entries(vnode.props ?? {})) {
      if (key === "children" || value && typeof value === "object" && value["$$slot"]) {
        slots[key === "children" ? "default" : key] = () => renderJSX(result, value);
      } else {
        props[key] = value;
      }
    }
    const displayName = metadata?.displayName || factory.name || "Anonymous";
    const instance = createAstroComponentInstance(result, displayName, factory, props, slots);
    const queueNode = pool.acquire("component");
    queueNode.instance = instance;
    queue.nodes.push(queueNode);
    return;
  }
  if (typeof vnode.type === "string" && vnode.type !== ClientOnlyPlaceholder) {
    renderHTMLElement(vnode, result, queue, pool, stack, parent, metadata);
    return;
  }
  if (typeof vnode.type === "function") {
    if (vnode.props?.["server:root"]) {
      const output3 = vnode.type(vnode.props ?? {});
      stack.push({ node: output3, parent, metadata });
      return;
    }
    const output2 = vnode.type(vnode.props ?? {});
    stack.push({ node: output2, parent, metadata });
    return;
  }
  const output = renderJSX(result, vnode);
  stack.push({ node: output, parent, metadata });
}
function renderHTMLElement(vnode, _result, queue, pool, stack, parent, metadata) {
  const tag = vnode.type;
  const { children, ...props } = vnode.props ?? {};
  const attrs = spreadAttributes(props);
  const isVoidElement = (children == null || children === "") && voidElementNames.test(tag);
  if (isVoidElement) {
    const html = `<${tag}${attrs}/>`;
    const node = pool.acquire("html-string", html);
    node.html = html;
    queue.nodes.push(node);
    return;
  }
  const openTag = `<${tag}${attrs}>`;
  const openTagHtml = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(openTag) : markHTMLString(openTag);
  stack.push({ node: openTagHtml, parent, metadata });
  if (children != null && children !== "") {
    const processedChildren = prerenderElementChildren(tag, children, queue.htmlStringCache);
    stack.push({ node: processedChildren, parent, metadata });
  }
  const closeTag = `</${tag}>`;
  const closeTagHtml = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(closeTag) : markHTMLString(closeTag);
  stack.push({ node: closeTagHtml, parent, metadata });
}
function prerenderElementChildren(tag, children, htmlStringCache) {
  if (typeof children === "string" && (tag === "style" || tag === "script")) {
    return htmlStringCache ? htmlStringCache.getOrCreate(children) : markHTMLString(children);
  }
  return children;
}
async function buildRenderQueue(root, result, pool) {
  const queue = {
    nodes: [],
    result,
    pool,
    htmlStringCache: result._experimentalQueuedRendering?.htmlStringCache
  };
  const stack = [{ node: root, parent: null }];
  while (stack.length > 0) {
    const item = stack.pop();
    if (!item) {
      continue;
    }
    let { node, parent } = item;
    if (isPromise(node)) {
      try {
        const resolved = await node;
        stack.push({ node: resolved, parent, metadata: item.metadata });
      } catch (error2) {
        throw error2;
      }
      continue;
    }
    if (node == null || node === false) {
      continue;
    }
    if (typeof node === "string") {
      const queueNode = pool.acquire("text", node);
      queueNode.content = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (typeof node === "number" || typeof node === "boolean") {
      const str = String(node);
      const queueNode = pool.acquire("text", str);
      queueNode.content = str;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isHTMLString(node)) {
      const html = node.toString();
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
      continue;
    }
    if (node instanceof SlotString) {
      const html = node.toString();
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isVNode(node)) {
      renderJSXToQueue(node, result, queue, pool, stack, parent, item.metadata);
      continue;
    }
    if (Array.isArray(node)) {
      for (const n of node) {
        stack.push({ node: n, parent, metadata: item.metadata });
      }
      continue;
    }
    if (isRenderInstruction(node)) {
      const queueNode = pool.acquire("instruction");
      queueNode.instruction = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isRenderTemplateResult(node)) {
      const htmlParts = node["htmlParts"];
      const expressions = node["expressions"];
      if (htmlParts[0]) {
        const htmlString = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(htmlParts[0]) : markHTMLString(htmlParts[0]);
        stack.push({
          node: htmlString,
          parent,
          metadata: item.metadata
        });
      }
      for (let i = 0; i < expressions.length; i = i + 1) {
        stack.push({ node: expressions[i], parent, metadata: item.metadata });
        if (htmlParts[i + 1]) {
          const htmlString = queue.htmlStringCache ? queue.htmlStringCache.getOrCreate(htmlParts[i + 1]) : markHTMLString(htmlParts[i + 1]);
          stack.push({
            node: htmlString,
            parent,
            metadata: item.metadata
          });
        }
      }
      continue;
    }
    if (isAstroComponentInstance(node)) {
      const queueNode = pool.acquire("component");
      queueNode.instance = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (isAstroComponentFactory(node)) {
      const factory = node;
      const props = item.metadata?.props || {};
      const slots = item.metadata?.slots || {};
      const displayName = item.metadata?.displayName || factory.name || "Anonymous";
      const instance = createAstroComponentInstance(result, displayName, factory, props, slots);
      const queueNode = pool.acquire("component");
      queueNode.instance = instance;
      if (isAPropagatingComponent(result, factory)) {
        try {
          const returnValue = await instance.init(result);
          if (isHeadAndContent(returnValue) && returnValue.head) {
            result._metadata.extraHead.push(returnValue.head);
          }
        } catch (error2) {
          throw error2;
        }
      }
      queue.nodes.push(queueNode);
      continue;
    }
    if (isRenderInstance(node)) {
      const queueNode = pool.acquire("component");
      queueNode.instance = node;
      queue.nodes.push(queueNode);
      continue;
    }
    if (typeof node === "object" && Symbol.iterator in node) {
      const items = Array.from(node);
      for (const iterItem of items) {
        stack.push({ node: iterItem, parent, metadata: item.metadata });
      }
      continue;
    }
    if (typeof node === "object" && Symbol.asyncIterator in node) {
      try {
        const items = [];
        for await (const asyncItem of node) {
          items.push(asyncItem);
        }
        for (const iterItem of items) {
          stack.push({ node: iterItem, parent, metadata: item.metadata });
        }
      } catch (error2) {
        throw error2;
      }
      continue;
    }
    if (node instanceof Response) {
      const queueNode = pool.acquire("html-string", "");
      queueNode.html = "";
      queue.nodes.push(queueNode);
      continue;
    }
    if (isHTMLString(node)) {
      const html = String(node);
      const queueNode = pool.acquire("html-string", html);
      queueNode.html = html;
      queue.nodes.push(queueNode);
    } else {
      const str = String(node);
      const queueNode = pool.acquire("text", str);
      queueNode.content = str;
      queue.nodes.push(queueNode);
    }
  }
  queue.nodes.reverse();
  return queue;
}
async function renderQueue(queue, destination) {
  const result = queue.result;
  const pool = queue.pool;
  const cache = queue.htmlStringCache;
  let batchBuffer = "";
  let i = 0;
  while (i < queue.nodes.length) {
    const node = queue.nodes[i];
    try {
      if (canBatch(node)) {
        const batchStart = i;
        while (i < queue.nodes.length && canBatch(queue.nodes[i])) {
          batchBuffer += renderNodeToString(queue.nodes[i]);
          i = i + 1;
        }
        if (batchBuffer) {
          const htmlString = cache ? cache.getOrCreate(batchBuffer) : markHTMLString(batchBuffer);
          destination.write(htmlString);
          batchBuffer = "";
        }
        if (pool) {
          for (let j = batchStart; j < i; j++) {
            pool.release(queue.nodes[j]);
          }
        }
      } else {
        await renderNode(node, destination, result);
        if (pool) {
          pool.release(node);
        }
        i = i + 1;
      }
    } catch (error2) {
      throw error2;
    }
  }
  if (batchBuffer) {
    const htmlString = cache ? cache.getOrCreate(batchBuffer) : markHTMLString(batchBuffer);
    destination.write(htmlString);
  }
}
function canBatch(node) {
  return node.type === "text" || node.type === "html-string";
}
function renderNodeToString(node) {
  switch (node.type) {
    case "text":
      return node.content ? escapeHTML(node.content) : "";
    case "html-string":
      return node.html || "";
    case "component":
    case "instruction": {
      return "";
    }
  }
}
async function renderNode(node, destination, result) {
  const cache = result._experimentalQueuedRendering?.htmlStringCache;
  switch (node.type) {
    case "text": {
      if (node.content) {
        const escaped = escapeHTML(node.content);
        const htmlString = cache ? cache.getOrCreate(escaped) : markHTMLString(escaped);
        destination.write(htmlString);
      }
      break;
    }
    case "html-string": {
      if (node.html) {
        const htmlString = cache ? cache.getOrCreate(node.html) : markHTMLString(node.html);
        destination.write(htmlString);
      }
      break;
    }
    case "instruction": {
      if (node.instruction) {
        destination.write(node.instruction);
      }
      break;
    }
    case "component": {
      if (node.instance) {
        let componentHtml = "";
        const componentDestination = {
          write(chunk) {
            if (chunk instanceof Response) return;
            componentHtml += chunkToString(result, chunk);
          }
        };
        await node.instance.render(componentDestination);
        if (componentHtml) {
          destination.write(componentHtml);
        }
      }
      break;
    }
  }
}
async function renderPage(result, componentFactory, props, children, streaming, route) {
  if (!isAstroComponentFactory(componentFactory)) {
    result._metadata.headInTree = result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
    const pageProps = { ...props ?? {}, "server:root": true };
    let str;
    if (result._experimentalQueuedRendering && result._experimentalQueuedRendering.enabled) {
      let vnode = await componentFactory(pageProps);
      if (componentFactory["astro:html"] && typeof vnode === "string") {
        vnode = markHTMLString(vnode);
      }
      const queue = await buildRenderQueue(
        vnode,
        result,
        result._experimentalQueuedRendering.pool
      );
      let html = "";
      let renderedFirst = false;
      const destination = {
        write(chunk) {
          if (chunk instanceof Response) return;
          if (!renderedFirst && !result.partial) {
            renderedFirst = true;
            const chunkStr = String(chunk);
            if (!/<!doctype html/i.test(chunkStr)) {
              const doctype = result.compressHTML ? "<!DOCTYPE html>" : "<!DOCTYPE html>\n";
              html += doctype;
            }
          }
          html += chunkToString(result, chunk);
        }
      };
      await renderQueue(queue, destination);
      str = html;
    } else {
      str = await renderComponentToString(
        result,
        componentFactory.name,
        componentFactory,
        pageProps,
        {},
        true,
        route
      );
    }
    const bytes = encoder.encode(str);
    const headers2 = new Headers([
      ["Content-Type", "text/html"],
      ["Content-Length", bytes.byteLength.toString()]
    ]);
    if (result.shouldInjectCspMetaTags && (result.cspDestination === "header" || result.cspDestination === "adapter")) {
      headers2.set("content-security-policy", renderCspContent(result));
    }
    return new Response(bytes, {
      headers: headers2,
      status: result.response.status
    });
  }
  result._metadata.headInTree = result.componentMetadata.get(componentFactory.moduleId)?.containsHead ?? false;
  let body;
  if (streaming) {
    if (isNode && !isDeno) {
      const nodeBody = await renderToAsyncIterable(
        result,
        componentFactory,
        props,
        children,
        true,
        route
      );
      body = nodeBody;
    } else {
      body = await renderToReadableStream(result, componentFactory, props, children, true, route);
    }
  } else {
    body = await renderToString(result, componentFactory, props, children, true, route);
  }
  if (body instanceof Response) return body;
  const init = result.response;
  const headers = new Headers(init.headers);
  if (result.shouldInjectCspMetaTags && result.cspDestination === "header" || result.cspDestination === "adapter") {
    headers.set("content-security-policy", renderCspContent(result));
  }
  if (!streaming && typeof body === "string") {
    body = encoder.encode(body);
    headers.set("Content-Length", body.byteLength.toString());
  }
  let status = init.status;
  let statusText = init.statusText;
  if (route?.route === "/404") {
    status = 404;
    if (statusText === "OK") {
      statusText = "Not Found";
    }
  } else if (route?.route === "/500") {
    status = 500;
    if (statusText === "OK") {
      statusText = "Internal Server Error";
    }
  }
  if (status) {
    return new Response(body, { ...init, headers, status, statusText });
  } else {
    return new Response(body, { ...init, headers });
  }
}
function spreadAttributes(values = {}, _name, { class: scopedClassName } = {}) {
  let output = "";
  if (scopedClassName) {
    if (typeof values.class !== "undefined") {
      values.class += ` ${scopedClassName}`;
    } else if (typeof values["class:list"] !== "undefined") {
      values["class:list"] = [values["class:list"], scopedClassName];
    } else {
      values.class = scopedClassName;
    }
  }
  for (const [key, value] of Object.entries(values)) {
    output += addAttribute(value, key, true, _name);
  }
  return markHTMLString(output);
}
async function readBodyWithLimit(request, limit) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > limit) {
      throw new BodySizeLimitError(limit);
    }
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      received += value.byteLength;
      if (received > limit) {
        throw new BodySizeLimitError(limit);
      }
      chunks.push(value);
    }
  }
  const buffer2 = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buffer2.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return buffer2;
}
class BodySizeLimitError extends Error {
  limit;
  constructor(limit) {
    super(`Request body exceeds the configured limit of ${limit} bytes`);
    this.name = "BodySizeLimitError";
    this.limit = limit;
  }
}
function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments.map((segment) => {
    if (segment.length === 1 && segment[0].spread) {
      return "(?:\\/(.*?))?";
    } else {
      return "\\/" + segment.map((part) => {
        if (part.spread) {
          return "(.*?)";
        } else if (part.dynamic) {
          return "([^/]+?)";
        } else {
          return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
      }).join("");
    }
  }).join("");
  const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/" && pathname !== "") {
    initial = "";
  }
  return new RegExp(`^${pathname || initial}${trailing}`);
}
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") {
    return "\\/$";
  }
  if (addTrailingSlash === "never") {
    return "$";
  }
  return "\\/?$";
}
const SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
const SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function badRequest(reason) {
  return new Response(null, {
    status: 400,
    statusText: "Bad request: " + reason
  });
}
const DEFAULT_BODY_SIZE_LIMIT = 1024 * 1024;
async function getRequestData(request, bodySizeLimit = DEFAULT_BODY_SIZE_LIMIT) {
  switch (request.method) {
    case "GET": {
      const url = new URL(request.url);
      const params = url.searchParams;
      if (!params.has("s") || !params.has("e") || !params.has("p")) {
        return badRequest("Missing required query parameters.");
      }
      const encryptedSlots = params.get("s");
      return {
        encryptedComponentExport: params.get("e"),
        encryptedProps: params.get("p"),
        encryptedSlots
      };
    }
    case "POST": {
      try {
        const body = await readBodyWithLimit(request, bodySizeLimit);
        const raw = new TextDecoder().decode(body);
        const data = JSON.parse(raw);
        if (Object.hasOwn(data, "slots") && typeof data.slots === "object") {
          return badRequest("Plaintext slots are not allowed. Slots must be encrypted.");
        }
        if (Object.hasOwn(data, "componentExport") && typeof data.componentExport === "string") {
          return badRequest(
            "Plaintext componentExport is not allowed. componentExport must be encrypted."
          );
        }
        return data;
      } catch (e) {
        if (e instanceof BodySizeLimitError) {
          return new Response(null, {
            status: 413,
            statusText: e.message
          });
        }
        if (e instanceof SyntaxError) {
          return badRequest("Request format is invalid.");
        }
        throw e;
      }
    }
    default: {
      return new Response(null, { status: 405 });
    }
  }
}
function createEndpoint(manifest2) {
  const page = async (result) => {
    const params = result.params;
    if (!params.name) {
      return new Response(null, {
        status: 400,
        statusText: "Bad request"
      });
    }
    const componentId = params.name;
    const data = await getRequestData(result.request, manifest2.serverIslandBodySizeLimit);
    if (data instanceof Response) {
      return data;
    }
    const serverIslandMappings = await manifest2.serverIslandMappings?.();
    const serverIslandMap = await serverIslandMappings?.serverIslandMap;
    let imp = serverIslandMap?.get(componentId);
    if (!imp) {
      return new Response(null, {
        status: 404,
        statusText: "Not found"
      });
    }
    const key = await manifest2.key;
    let componentExport;
    try {
      componentExport = await decryptString(
        key,
        data.encryptedComponentExport,
        `export:${componentId}`
      );
    } catch (_e) {
      return badRequest("Encrypted componentExport value is invalid.");
    }
    const encryptedProps = data.encryptedProps;
    let props = {};
    if (encryptedProps !== "") {
      try {
        const propString = await decryptString(key, encryptedProps, `props:${componentId}`);
        props = JSON.parse(propString);
      } catch (_e) {
        return badRequest("Encrypted props value is invalid.");
      }
    }
    let decryptedSlots = {};
    const encryptedSlots = data.encryptedSlots;
    if (encryptedSlots !== "") {
      try {
        const slotsString = await decryptString(key, encryptedSlots, `slots:${componentId}`);
        decryptedSlots = JSON.parse(slotsString);
      } catch (_e) {
        return badRequest("Encrypted slots value is invalid.");
      }
    }
    const componentModule = await imp();
    let Component = componentModule[componentExport];
    const slots = {};
    for (const prop in decryptedSlots) {
      slots[prop] = createSlotValueFromString(decryptedSlots[prop]);
    }
    result.response.headers.set("X-Robots-Tag", "noindex");
    if (isAstroComponentFactory(Component)) {
      const ServerIsland = Component;
      Component = function(...args) {
        return ServerIsland.apply(this, args);
      };
      Object.assign(Component, ServerIsland);
      Component.propagation = "self";
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  };
  page.isAstroComponentFactory = true;
  const instance = {
    default: page,
    partial: true
  };
  return instance;
}
function createDefaultRoutes(manifest2) {
  const root = new URL(manifest2.rootDir);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest2),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}
function ensure404Route(manifest2) {
  if (!manifest2.routes.some((route) => route.route === "/404")) {
    manifest2.routes.push(DEFAULT_404_ROUTE);
  }
  return manifest2;
}
function routeComparator(a, b) {
  const commonLength = Math.min(a.segments.length, b.segments.length);
  for (let index = 0; index < commonLength; index++) {
    const aSegment = a.segments[index];
    const bSegment = b.segments[index];
    const aIsStatic = aSegment.every((part) => !part.dynamic && !part.spread);
    const bIsStatic = bSegment.every((part) => !part.dynamic && !part.spread);
    if (aIsStatic && bIsStatic) {
      const aContent = aSegment.map((part) => part.content).join("");
      const bContent = bSegment.map((part) => part.content).join("");
      if (aContent !== bContent) {
        return aContent.localeCompare(bContent);
      }
    }
    if (aIsStatic !== bIsStatic) {
      return aIsStatic ? -1 : 1;
    }
    const aAllDynamic = aSegment.every((part) => part.dynamic);
    const bAllDynamic = bSegment.every((part) => part.dynamic);
    if (aAllDynamic !== bAllDynamic) {
      return aAllDynamic ? 1 : -1;
    }
    const aHasSpread = aSegment.some((part) => part.spread);
    const bHasSpread = bSegment.some((part) => part.spread);
    if (aHasSpread !== bHasSpread) {
      return aHasSpread ? 1 : -1;
    }
  }
  const aLength = a.segments.length;
  const bLength = b.segments.length;
  if (aLength !== bLength) {
    const aEndsInRest = a.segments.at(-1)?.some((part) => part.spread);
    const bEndsInRest = b.segments.at(-1)?.some((part) => part.spread);
    if (aEndsInRest !== bEndsInRest && Math.abs(aLength - bLength) === 1) {
      if (aLength > bLength && aEndsInRest) {
        return 1;
      }
      if (bLength > aLength && bEndsInRest) {
        return -1;
      }
    }
    return aLength > bLength ? -1 : 1;
  }
  if (a.type === "endpoint" !== (b.type === "endpoint")) {
    return a.type === "endpoint" ? -1 : 1;
  }
  return a.route.localeCompare(b.route);
}
class Router {
  #routes;
  #base;
  #baseWithoutTrailingSlash;
  #buildFormat;
  #trailingSlash;
  constructor(routes, options) {
    this.#routes = [...routes].sort(routeComparator);
    this.#base = normalizeBase(options.base);
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#base);
    this.#buildFormat = options.buildFormat;
    this.#trailingSlash = options.trailingSlash;
  }
  /**
   * Match an input pathname against the route list.
   * If allowWithoutBase is true, a non-base-prefixed path is still considered.
   */
  match(inputPathname, { allowWithoutBase = false } = {}) {
    const normalized = getRedirectForPathname(inputPathname);
    if (normalized.redirect) {
      return { type: "redirect", location: normalized.redirect, status: 301 };
    }
    if (this.#base !== "/") {
      const baseWithSlash = `${this.#baseWithoutTrailingSlash}/`;
      if (this.#trailingSlash === "always" && (normalized.pathname === this.#baseWithoutTrailingSlash || normalized.pathname === this.#base)) {
        return { type: "redirect", location: baseWithSlash, status: 301 };
      }
      if (this.#trailingSlash === "never" && normalized.pathname === baseWithSlash) {
        return { type: "redirect", location: this.#baseWithoutTrailingSlash, status: 301 };
      }
    }
    const baseResult = stripBase(
      normalized.pathname,
      this.#base,
      this.#baseWithoutTrailingSlash,
      this.#trailingSlash
    );
    if (!baseResult) {
      if (!allowWithoutBase) {
        return { type: "none", reason: "outside-base" };
      }
    }
    let pathname = baseResult ?? normalized.pathname;
    if (this.#buildFormat === "file") {
      pathname = normalizeFileFormatPathname(pathname);
    }
    const route = this.#routes.find((candidate) => {
      if (candidate.pattern.test(pathname)) return true;
      return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
    });
    if (!route) {
      return { type: "none", reason: "no-match" };
    }
    const params = getParams(route, pathname);
    return { type: "match", route, params, pathname };
  }
  /**
   * Returns all routes that match the given pathname, in priority order.
   * Used when the first match (e.g. a prerendered route) cannot serve
   * the request and subsequent matches need to be tried.
   */
  matchAll(inputPathname, { allowWithoutBase = false } = {}) {
    const normalized = getRedirectForPathname(inputPathname);
    if (normalized.redirect) {
      return [];
    }
    const baseResult = stripBase(
      normalized.pathname,
      this.#base,
      this.#baseWithoutTrailingSlash,
      this.#trailingSlash
    );
    if (!baseResult && !allowWithoutBase) {
      return [];
    }
    let pathname = baseResult ?? normalized.pathname;
    if (this.#buildFormat === "file") {
      pathname = normalizeFileFormatPathname(pathname);
    }
    return this.#routes.filter((candidate) => {
      if (candidate.pattern.test(pathname)) return true;
      return candidate.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
    });
  }
}
function normalizeBase(base) {
  if (!base) return "/";
  if (base === "/") return base;
  return prependForwardSlash(base);
}
function getRedirectForPathname(pathname) {
  let value = prependForwardSlash(pathname);
  if (value.startsWith("//")) {
    const collapsed = `/${value.replace(/^\/+/, "")}`;
    return { pathname: value, redirect: collapsed };
  }
  return { pathname: value };
}
function stripBase(pathname, base, baseWithoutTrailingSlash, trailingSlash) {
  if (base === "/") return pathname;
  const baseWithSlash = `${baseWithoutTrailingSlash}/`;
  if (pathname === baseWithoutTrailingSlash || pathname === base) {
    return trailingSlash === "always" ? null : "/";
  }
  if (pathname === baseWithSlash) {
    return trailingSlash === "never" ? null : "/";
  }
  if (pathname.startsWith(baseWithSlash)) {
    return pathname.slice(baseWithoutTrailingSlash.length);
  }
  return null;
}
function normalizeFileFormatPathname(pathname) {
  if (pathname.endsWith("/index.html")) {
    const trimmed = pathname.slice(0, -"/index.html".length);
    return trimmed === "" ? "/" : trimmed;
  }
  if (pathname.endsWith(".html")) {
    const trimmed = pathname.slice(0, -".html".length);
    return trimmed === "" ? "/" : trimmed;
  }
  return pathname;
}
function deserializeManifest(serializedManifest, routesList) {
  const routes = [];
  if (serializedManifest.routes) {
    for (const serializedRoute of serializedManifest.routes) {
      routes.push({
        ...serializedRoute,
        routeData: deserializeRouteData(serializedRoute.routeData)
      });
      const route = serializedRoute;
      route.routeData = deserializeRouteData(serializedRoute.routeData);
    }
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    rootDir: new URL(serializedManifest.rootDir),
    srcDir: new URL(serializedManifest.srcDir),
    publicDir: new URL(serializedManifest.publicDir),
    outDir: new URL(serializedManifest.outDir),
    cacheDir: new URL(serializedManifest.cacheDir),
    buildClientDir: new URL(serializedManifest.buildClientDir),
    buildServerDir: new URL(serializedManifest.buildServerDir),
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    key
  };
}
function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
    // This pattern is serialized from Astro's own route manifest.
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin,
    distURL: rawRouteData.distURL
  };
}
function deserializeRouteInfo(rawRouteInfo) {
  return {
    styles: rawRouteInfo.styles,
    file: rawRouteInfo.file,
    links: rawRouteInfo.links,
    scripts: rawRouteInfo.scripts,
    routeData: deserializeRouteData(rawRouteInfo.routeData)
  };
}
class NodePool {
  textPool = [];
  htmlStringPool = [];
  componentPool = [];
  instructionPool = [];
  maxSize;
  enableStats;
  stats = {
    acquireFromPool: 0,
    acquireNew: 0,
    released: 0,
    releasedDropped: 0
  };
  /**
   * Creates a new object pool for queue nodes.
   *
   * @param maxSize - Maximum number of nodes to keep in the pool (default: 1000).
   *   The cap is shared across all typed sub-pools.
   * @param enableStats - Enable statistics tracking (default: false for performance)
   */
  constructor(maxSize = 1e3, enableStats = false) {
    this.maxSize = maxSize;
    this.enableStats = enableStats;
  }
  /**
   * Acquires a queue node from the pool or creates a new one if the pool is empty.
   * Pops from the type-specific sub-pool to reuse an existing object when available.
   *
   * @param type - The type of queue node to acquire
   * @param content - Optional content to set on the node (for text or html-string types)
   * @returns A queue node ready to be populated with data
   */
  acquire(type, content) {
    const pooledNode = this.popFromTypedPool(type);
    if (pooledNode) {
      if (this.enableStats) {
        this.stats.acquireFromPool = this.stats.acquireFromPool + 1;
      }
      this.resetNodeContent(pooledNode, type, content);
      return pooledNode;
    }
    if (this.enableStats) {
      this.stats.acquireNew = this.stats.acquireNew + 1;
    }
    return this.createNode(type, content);
  }
  /**
   * Creates a new node of the specified type with the given content.
   * Helper method to reduce branching in acquire().
   */
  createNode(type, content = "") {
    switch (type) {
      case "text":
        return { type: "text", content };
      case "html-string":
        return { type: "html-string", html: content };
      case "component":
        return { type: "component", instance: void 0 };
      case "instruction":
        return { type: "instruction", instruction: void 0 };
    }
  }
  /**
   * Pops a node from the type-specific sub-pool.
   * Returns undefined if the sub-pool for the requested type is empty.
   */
  popFromTypedPool(type) {
    switch (type) {
      case "text":
        return this.textPool.pop();
      case "html-string":
        return this.htmlStringPool.pop();
      case "component":
        return this.componentPool.pop();
      case "instruction":
        return this.instructionPool.pop();
    }
  }
  /**
   * Resets the content/value field on a reused pooled node.
   * The type discriminant is already correct since we pop from the matching sub-pool.
   */
  resetNodeContent(node, type, content) {
    switch (type) {
      case "text":
        node.content = content ?? "";
        break;
      case "html-string":
        node.html = content ?? "";
        break;
      case "component":
        node.instance = void 0;
        break;
      case "instruction":
        node.instruction = void 0;
        break;
    }
  }
  /**
   * Returns the total number of nodes across all typed sub-pools.
   */
  totalPoolSize() {
    return this.textPool.length + this.htmlStringPool.length + this.componentPool.length + this.instructionPool.length;
  }
  /**
   * Releases a queue node back to the pool for reuse.
   * If the pool is at max capacity, the node is discarded (will be GC'd).
   *
   * @param node - The node to release back to the pool
   */
  release(node) {
    if (this.totalPoolSize() >= this.maxSize) {
      if (this.enableStats) {
        this.stats.releasedDropped = this.stats.releasedDropped + 1;
      }
      return;
    }
    switch (node.type) {
      case "text":
        node.content = "";
        this.textPool.push(node);
        break;
      case "html-string":
        node.html = "";
        this.htmlStringPool.push(node);
        break;
      case "component":
        node.instance = void 0;
        this.componentPool.push(node);
        break;
      case "instruction":
        node.instruction = void 0;
        this.instructionPool.push(node);
        break;
    }
    if (this.enableStats) {
      this.stats.released = this.stats.released + 1;
    }
  }
  /**
   * Releases all nodes in an array back to the pool.
   * This is a convenience method for releasing multiple nodes at once.
   *
   * @param nodes - Array of nodes to release
   */
  releaseAll(nodes) {
    for (const node of nodes) {
      this.release(node);
    }
  }
  /**
   * Clears all typed sub-pools, discarding all cached nodes.
   * This can be useful if you want to free memory after a large render.
   */
  clear() {
    this.textPool.length = 0;
    this.htmlStringPool.length = 0;
    this.componentPool.length = 0;
    this.instructionPool.length = 0;
  }
  /**
   * Gets the current total number of nodes across all typed sub-pools.
   * Useful for monitoring pool usage and tuning maxSize.
   *
   * @returns Number of nodes currently available in the pool
   */
  size() {
    return this.totalPoolSize();
  }
  /**
   * Gets pool statistics for debugging.
   *
   * @returns Pool usage statistics including computed metrics
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.totalPoolSize(),
      maxSize: this.maxSize,
      hitRate: this.stats.acquireFromPool + this.stats.acquireNew > 0 ? this.stats.acquireFromPool / (this.stats.acquireFromPool + this.stats.acquireNew) * 100 : 0
    };
  }
  /**
   * Resets pool statistics.
   */
  resetStats() {
    this.stats = {
      acquireFromPool: 0,
      acquireNew: 0,
      released: 0,
      releasedDropped: 0
    };
  }
}
class HTMLStringCache {
  cache = /* @__PURE__ */ new Map();
  maxSize;
  constructor(maxSize = 1e3) {
    this.maxSize = maxSize;
    this.warm(COMMON_HTML_PATTERNS);
  }
  /**
   * Get or create an HTMLString for the given content.
   * If cached, the existing object is returned and moved to end (most recently used).
   * If not cached, a new HTMLString is created, cached, and returned.
   *
   * @param content - The HTML string content
   * @returns HTMLString object (cached or newly created)
   */
  getOrCreate(content) {
    const cached = this.cache.get(content);
    if (cached) {
      this.cache.delete(content);
      this.cache.set(content, cached);
      return cached;
    }
    const htmlString = new HTMLString(content);
    this.cache.set(content, htmlString);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== void 0) {
        this.cache.delete(firstKey);
      }
    }
    return htmlString;
  }
  /**
   * Get current cache size
   */
  size() {
    return this.cache.size;
  }
  /**
   * Pre-warms the cache with common HTML patterns.
   * This ensures first-render cache hits for frequently used tags.
   *
   * @param patterns - Array of HTML strings to pre-cache
   */
  warm(patterns) {
    for (const pattern of patterns) {
      if (!this.cache.has(pattern)) {
        this.cache.set(pattern, new HTMLString(pattern));
      }
    }
  }
  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }
}
const COMMON_HTML_PATTERNS = [
  // Structural elements
  "<div>",
  "</div>",
  "<span>",
  "</span>",
  "<p>",
  "</p>",
  "<section>",
  "</section>",
  "<article>",
  "</article>",
  "<header>",
  "</header>",
  "<footer>",
  "</footer>",
  "<nav>",
  "</nav>",
  "<main>",
  "</main>",
  "<aside>",
  "</aside>",
  // List elements
  "<ul>",
  "</ul>",
  "<ol>",
  "</ol>",
  "<li>",
  "</li>",
  // Void/self-closing elements
  "<br>",
  "<hr>",
  "<br/>",
  "<hr/>",
  // Heading elements
  "<h1>",
  "</h1>",
  "<h2>",
  "</h2>",
  "<h3>",
  "</h3>",
  "<h4>",
  "</h4>",
  // Inline elements
  "<a>",
  "</a>",
  "<strong>",
  "</strong>",
  "<em>",
  "</em>",
  "<code>",
  "</code>",
  // Common whitespace
  " ",
  "\n"
];
const FORBIDDEN_PATH_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.destination;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(s.bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return s.red(prefix.join(" "));
  }
  if (level === "warn") {
    return s.yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return s.dim(prefix[0]);
  }
  return s.dim(prefix[0]) + " " + s.blue(prefix.splice(1).join(" "));
}
class AstroLogger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  setDestination(destination) {
    this.options.destination = destination;
  }
  /**
   * It calls the `close` function of the provided destination, if it exists.
   */
  close() {
    if (this.options.destination.close) {
      this.options.destination.close();
    }
  }
  /**
   * It calls the `flush` function of the provided destination, if it exists.
   */
  flush() {
    if (this.options.destination.flush) {
      this.options.destination.flush();
    }
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
  /**
   * It calls the `flush` function of the provided destination, if it exists.
   */
  flush() {
    if (this.options.destination.flush) {
      this.options.destination.flush();
    }
  }
  /**
   * It calls the `close` function of the provided destination, if it exists.
   */
  close() {
    if (this.options.destination.close) {
      this.options.destination.close();
    }
  }
}
function matchesLevel(messageLevel, configuredLevel) {
  return levels[messageLevel] >= levels[configuredLevel];
}
function nodeLogDestination(config2 = {}) {
  const { level = "info" } = config2;
  return {
    write(event) {
      let dest = process.stderr;
      if (levels[event.level] < levels["error"]) {
        dest = process.stdout;
      }
      if (!matchesLevel(event.level, level)) {
        return;
      }
      let trailingLine = event.newLine ? "\n" : "";
      if (event.label === "SKIP_FORMAT") {
        dest.write(event.message + trailingLine);
      } else {
        dest.write(getEventPrefix(event) + " " + event.message + trailingLine);
      }
    }
  };
}
function node_default(options) {
  return nodeLogDestination(options);
}
function consoleLogDestination(config2 = {}) {
  const { level = "info" } = config2;
  return {
    write(event) {
      let dest = console.error;
      if (levels[event.level] < levels["error"]) {
        dest = console.info;
      }
      if (!matchesLevel(event.level, level)) {
        return;
      }
      if (event.label === "SKIP_FORMAT") {
        dest(event.message);
      } else {
        dest(getEventPrefix(event) + " " + event.message);
      }
    }
  };
}
function createConsoleLogger({ level }) {
  return new AstroLogger({
    level,
    destination: consoleLogDestination()
  });
}
function console_default(options) {
  return consoleLogDestination(options);
}
const SGR_REGEX = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
function jsonLoggerDestination(config2 = {}) {
  const { pretty = false, level = "info" } = config2;
  return {
    write(event) {
      let dest = process.stderr;
      if (levels[event.level] < levels["error"]) {
        dest = process.stdout;
      }
      if (!matchesLevel(event.level, level)) {
        return;
      }
      let trailingLine = event.newLine ? "\n" : "";
      const message = event.message.replace(SGR_REGEX, "");
      if (pretty) {
        dest.write(
          JSON.stringify({ message, label: event.label, level: event.level }, null, 2) + trailingLine
        );
      } else {
        dest.write(
          JSON.stringify({ message, label: event.label, level: event.level }) + trailingLine
        );
      }
    }
  };
}
function compose(destinations) {
  return {
    write(chunk) {
      for (const logger of destinations) {
        logger.write(chunk);
      }
    },
    flush() {
      for (const logger of destinations) {
        if (logger.flush) {
          logger.flush();
        }
      }
    },
    close() {
      for (const logger of destinations) {
        if (logger.close) {
          logger.close();
        }
      }
    }
  };
}
async function loadLogger(config2, level = "info") {
  let cause = void 0;
  try {
    switch (config2.entrypoint) {
      case "astro/logger/node": {
        return new AstroLogger({
          destination: node_default(config2.config),
          level
        });
      }
      case "astro/logger/console": {
        return new AstroLogger({
          destination: console_default(config2.config),
          level
        });
      }
      case "astro/logger/json": {
        return new AstroLogger({
          destination: jsonLoggerDestination(config2.config),
          level
        });
      }
      case "astro/logger/compose": {
        let destinations = [];
        if (config2.config?.loggers) {
          const loggers = config2.config?.loggers;
          destinations = await Promise.all(
            loggers.map(async (loggerConfig) => {
              const logger = await import(
                /* @vite-ignore */
                loggerConfig.entrypoint
              );
              return logger.default(loggerConfig.config);
            })
          );
        }
        return new AstroLogger({
          destination: compose(destinations),
          level
        });
      }
      default: {
        const nodeLogger = await import(
          /* @vite-ignore */
          config2.entrypoint
        );
        return new AstroLogger({
          destination: nodeLogger.default(config2.config),
          level
        });
      }
    }
  } catch (e) {
    if (e instanceof Error) {
      cause = e;
    }
  }
  const error2 = new AstroError({
    ...UnableToLoadLogger,
    message: UnableToLoadLogger.message(config2.entrypoint)
  });
  if (cause) {
    error2.cause = cause;
  }
  throw error2;
}
const PipelineFeatures = {
  redirects: 1 << 0,
  sessions: 1 << 1,
  actions: 1 << 2,
  middleware: 1 << 3,
  i18n: 1 << 4,
  cache: 1 << 5
};
const ALL_PIPELINE_FEATURES = PipelineFeatures.redirects | PipelineFeatures.sessions | PipelineFeatures.actions | PipelineFeatures.middleware | PipelineFeatures.i18n | PipelineFeatures.cache;
class Pipeline {
  internalMiddleware;
  resolvedMiddleware = void 0;
  resolvedLogger = false;
  resolvedActions = void 0;
  resolvedSessionDriver = void 0;
  resolvedCacheProvider = void 0;
  compiledCacheRoutes = void 0;
  nodePool;
  htmlStringCache;
  /**
   * Bit mask of pipeline features activated by handler classes.
   * Each handler sets its bit via `|=`. Only meaningful when a
   * custom `src/app.ts` fetch handler is in use.
   */
  usedFeatures = 0;
  logger;
  manifest;
  /**
   * "development" or "production" only
   */
  runtimeMode;
  renderers;
  resolve;
  streaming;
  /**
   * Used to provide better error messages for `Astro.clientAddress`
   */
  adapterName;
  clientDirectives;
  inlinedScripts;
  compressHTML;
  i18n;
  middleware;
  routeCache;
  /**
   * Used for `Astro.site`.
   */
  site;
  /**
   * Array of built-in, internal, routes.
   * Used to find the route module
   */
  defaultRoutes;
  actions;
  sessionDriver;
  cacheProvider;
  cacheConfig;
  serverIslands;
  /** Route data derived from the manifest, used for route matching. */
  manifestData;
  /** Pattern-matching router built from manifestData. */
  #router;
  constructor(logger, manifest2, runtimeMode, renderers2, resolve, streaming, adapterName = manifest2.adapterName, clientDirectives = manifest2.clientDirectives, inlinedScripts = manifest2.inlinedScripts, compressHTML = manifest2.compressHTML, i18n = manifest2.i18n, middleware = manifest2.middleware, routeCache = new RouteCache(logger, runtimeMode), site = manifest2.site ? new URL(manifest2.site) : void 0, defaultRoutes = createDefaultRoutes(manifest2), actions = manifest2.actions, sessionDriver = manifest2.sessionDriver, cacheProvider = manifest2.cacheProvider, cacheConfig = manifest2.cacheConfig, serverIslands = manifest2.serverIslandMappings) {
    this.logger = logger;
    this.manifest = manifest2;
    this.runtimeMode = runtimeMode;
    this.renderers = renderers2;
    this.resolve = resolve;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.actions = actions;
    this.sessionDriver = sessionDriver;
    this.cacheProvider = cacheProvider;
    this.cacheConfig = cacheConfig;
    this.serverIslands = serverIslands;
    this.manifestData = { routes: (manifest2.routes ?? []).map((route) => route.routeData) };
    ensure404Route(this.manifestData);
    this.#router = new Router(this.manifestData.routes, {
      base: manifest2.base,
      trailingSlash: manifest2.trailingSlash,
      buildFormat: manifest2.buildFormat
    });
    this.internalMiddleware = [];
    if (manifest2.experimentalQueuedRendering.enabled) {
      this.nodePool = this.createNodePool(
        manifest2.experimentalQueuedRendering.poolSize ?? 1e3,
        false
      );
      if (manifest2.experimentalQueuedRendering.contentCache) {
        this.htmlStringCache = this.createStringCache();
      }
    }
  }
  /**
   * Low-level route matching against the manifest routes. Returns the
   * matched `RouteData` or `undefined`. Does not filter prerendered
   * routes or check public assets — use `BaseApp.match()` for that.
   */
  matchRoute(pathname) {
    const match = this.#router.match(pathname, { allowWithoutBase: true });
    if (match.type !== "match") return void 0;
    return match.route;
  }
  /**
   * Returns all routes matching the given pathname, in priority order.
   * Used when the first match cannot serve the request (e.g. a
   * prerendered dynamic route that doesn't cover this specific path)
   * and the caller needs to try subsequent matches.
   */
  matchAllRoutes(pathname) {
    return this.#router.matchAll(pathname, { allowWithoutBase: true });
  }
  /**
   * Rebuilds the internal router after routes have been added or
   * removed (e.g. by the dev server on HMR).
   */
  rebuildRouter() {
    this.#router = new Router(this.manifestData.routes, {
      base: this.manifest.base,
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat
    });
  }
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    }
    if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      const internalMiddlewares = [onRequest];
      if (this.manifest.checkOrigin) {
        internalMiddlewares.unshift(createOriginCheckMiddleware());
      }
      this.resolvedMiddleware = sequence(...internalMiddlewares);
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
  /**
   * Clears the cached middleware so it is re-resolved on the next request.
   * Called via HMR when middleware files change during development.
   */
  clearMiddleware() {
    this.resolvedMiddleware = void 0;
  }
  /**
   * Resolves the logger destination from the manifest and updates the pipeline logger.
   * If the user configured `experimental.logger`, the bundled logger factory is loaded
   * and replaces the default console destination. This is lazy and only resolves once.
   */
  async getLogger() {
    if (this.resolvedLogger) {
      return this.logger;
    }
    this.resolvedLogger = true;
    if (this.manifest.experimentalLogger) {
      this.logger = await loadLogger(this.manifest.experimentalLogger);
    }
    return this.logger;
  }
  async getActions() {
    if (this.resolvedActions) {
      return this.resolvedActions;
    } else if (this.actions) {
      this.resolvedActions = await this.actions();
      return this.resolvedActions;
    }
    return NOOP_ACTIONS_MOD;
  }
  async getSessionDriver() {
    if (this.resolvedSessionDriver !== void 0) {
      return this.resolvedSessionDriver;
    }
    if (this.sessionDriver) {
      const driverModule = await this.sessionDriver();
      this.resolvedSessionDriver = driverModule?.default || null;
      return this.resolvedSessionDriver;
    }
    this.resolvedSessionDriver = null;
    return null;
  }
  async getCacheProvider() {
    if (this.resolvedCacheProvider !== void 0) {
      return this.resolvedCacheProvider;
    }
    if (this.cacheProvider) {
      const mod = await this.cacheProvider();
      const factory = mod?.default || null;
      this.resolvedCacheProvider = factory ? factory(this.cacheConfig?.options) : null;
      return this.resolvedCacheProvider;
    }
    this.resolvedCacheProvider = null;
    return null;
  }
  async getServerIslands() {
    if (this.serverIslands) {
      return this.serverIslands();
    }
    return {
      serverIslandMap: /* @__PURE__ */ new Map(),
      serverIslandNameMap: /* @__PURE__ */ new Map()
    };
  }
  async getAction(path) {
    const pathKeys = path.split(".").map((key) => decodeURIComponent(key));
    let { server } = await this.getActions();
    if (!server || !(typeof server === "object")) {
      throw new TypeError(
        `Expected \`server\` export in actions file to be an object. Received ${typeof server}.`
      );
    }
    for (const key of pathKeys) {
      if (FORBIDDEN_PATH_KEYS.has(key)) {
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join("."))
        });
      }
      if (!Object.hasOwn(server, key)) {
        throw new AstroError({
          ...ActionNotFoundError,
          message: ActionNotFoundError.message(pathKeys.join("."))
        });
      }
      server = server[key];
    }
    if (typeof server !== "function") {
      throw new TypeError(
        `Expected handler for action ${pathKeys.join(".")} to be a function. Received ${typeof server}.`
      );
    }
    return server;
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance)
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
      );
    }
  }
  createNodePool(poolSize, stats) {
    return new NodePool(poolSize, stats);
  }
  createStringCache() {
    return new HTMLStringCache(1e3);
  }
}
function getFunctionExpression(slot) {
  if (!slot) return;
  const expressions = slot?.expressions?.filter(
    (e) => isRenderInstruction(e) === false || isRenderTemplateResult(e)
  );
  if (expressions?.length !== 1) return;
  const expression = expressions[0];
  if (isRenderTemplateResult(expression)) {
    return getFunctionExpression(expression);
  }
  return expression;
}
class Slots {
  #result;
  #slots;
  #logger;
  constructor(result, slots, logger) {
    this.#result = result;
    this.#slots = slots;
    this.#logger = logger;
    if (slots) {
      for (const key of Object.keys(slots)) {
        if (this[key] !== void 0) {
          throw new AstroError({
            ...ReservedSlotName,
            message: ReservedSlotName.message(key)
          });
        }
        Object.defineProperty(this, key, {
          get() {
            return true;
          },
          enumerable: true
        });
      }
    }
  }
  has(name) {
    if (!this.#slots) return false;
    return Boolean(this.#slots[name]);
  }
  async render(name, args = []) {
    if (!this.#slots || !this.has(name)) return;
    const result = this.#result;
    if (!Array.isArray(args)) {
      this.#logger.warn(
        null,
        `Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as an item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`
      );
    } else if (args.length > 0) {
      const slotValue = this.#slots[name];
      const component = typeof slotValue === "function" ? await slotValue(result) : await slotValue;
      const expression = getFunctionExpression(component);
      if (expression) {
        const slot = async () => typeof expression === "function" ? expression(...args) : expression;
        return await renderSlotToString(result, slot).then((res) => {
          return res;
        });
      }
      if (typeof component === "function") {
        return await renderJSX(result, component(...args)).then(
          (res) => res != null ? String(res) : res
        );
      }
    }
    const content = await renderSlotToString(result, this.#slots[name]);
    const outHTML = chunkToString(result, content);
    return outHTML;
  }
}
const hrtime$1 = /* @__PURE__ */ Object.assign(function hrtime(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, { bigint: function bigint() {
  return BigInt(Date.now() * 1e6);
} });
class ReadStream {
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
}
class WriteStream {
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
}
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = () => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  };
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
const NODE_VERSION = "22.14.0";
class Process extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
}
const globalProcess = globalThis["process"];
const getBuiltinModule = globalProcess.getBuiltinModule;
const workerdProcess = getBuiltinModule("node:process");
const unenvProcess = new Process({
  env: globalProcess.env,
  hrtime: hrtime$1,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
const { exit, features, platform } = workerdProcess;
const {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime2,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
const _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime2,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
globalThis.process = _process;
const noop = Object.assign(() => {
}, { __unenv__: true });
const _console = globalThis.console;
const _ignoreErrors = true;
const _stderr = new Writable();
const _stdout = new Writable();
const Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
const _times = /* @__PURE__ */ new Map();
const _stdoutErrorHandler = noop;
const _stderrErrorHandler = noop;
const workerdConsole = globalThis["console"];
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
globalThis.console = workerdConsole;
const _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
const _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
const nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
class PerformanceEntry {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
}
const PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
class PerformanceMeasure extends PerformanceEntry {
  entryType = "measure";
}
class PerformanceResourceTiming extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
}
class PerformanceObserverEntryList {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
}
class Performance {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
}
class PerformanceObserver {
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
}
const performance$1 = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
if (!("__unenv__" in performance$1)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance$1)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance$1, key, desc);
      }
    }
  }
}
globalThis.performance = performance$1;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
const sessionKVBindingName = "SESSION";
const UNDEFINED = -1;
const HOLE = -2;
const NAN = -3;
const POSITIVE_INFINITY = -4;
const NEGATIVE_INFINITY = -5;
const NEGATIVE_ZERO = -6;
const SPARSE = -7;
const MAX_ARRAY_LEN = 2 ** 32 - 1;
const MAX_ARRAY_INDEX = MAX_ARRAY_LEN - 1;
class DevalueError extends Error {
  /**
   * @param {string} message
   * @param {string[]} keys
   * @param {any} [value] - The value that failed to be serialized
   * @param {any} [root] - The root value being serialized
   */
  constructor(message, keys, value, root) {
    super(message);
    this.name = "DevalueError";
    this.path = keys.join("");
    this.value = value;
    this.root = root;
  }
}
function is_primitive(thing) {
  return thing === null || typeof thing !== "object" && typeof thing !== "function";
}
const object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return proto === Object.prototype || proto === null || Object.getPrototypeOf(proto) === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"';
    case "<":
      return "\\u003C";
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "	":
      return "\\t";
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
  }
}
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}
function enumerable_symbols(object) {
  return Object.getOwnPropertySymbols(object).filter(
    (symbol) => Object.getOwnPropertyDescriptor(object, symbol).enumerable
  );
}
const is_identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
function stringify_key(key) {
  return is_identifier.test(key) ? "." + key : "[" + JSON.stringify(key) + "]";
}
function is_valid_array_index(n) {
  if (!Number.isInteger(n)) return false;
  if (n < 0) return false;
  if (n > MAX_ARRAY_INDEX) return false;
  return true;
}
function is_valid_array_len(n) {
  if (!Number.isInteger(n)) return false;
  if (n < 0) return false;
  if (n > MAX_ARRAY_LEN) return false;
  return true;
}
function is_valid_array_index_string(s2) {
  if (s2.length === 0) return false;
  if (s2.length > 1 && s2.charCodeAt(0) === 48) return false;
  for (let i = 0; i < s2.length; i++) {
    const c = s2.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return is_valid_array_index(+s2);
}
function valid_array_indices(array) {
  const keys = Object.keys(array);
  for (var i = keys.length - 1; i >= 0; i--) {
    if (is_valid_array_index_string(keys[i])) {
      break;
    }
  }
  keys.length = i + 1;
  return keys;
}
function encode_native(array_buffer) {
  return new Uint8Array(array_buffer).toBase64();
}
function decode_native(base64) {
  return Uint8Array.fromBase64(base64).buffer;
}
function encode_buffer(array_buffer) {
  return Buffer.from(array_buffer).toString("base64");
}
function decode_buffer(base64) {
  return Uint8Array.from(Buffer.from(base64, "base64")).buffer;
}
function encode_legacy(array_buffer) {
  const array = new Uint8Array(array_buffer);
  let binary2 = "";
  const chunk_size = 32768;
  for (let i = 0; i < array.length; i += chunk_size) {
    const chunk = array.subarray(i, i + chunk_size);
    binary2 += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary2);
}
function decode_legacy(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = binary_string.charCodeAt(i);
  }
  return array.buffer;
}
const native = typeof Uint8Array.fromBase64 === "function";
const buffer = typeof process === "object" && process.versions?.node !== void 0;
const encode64 = native ? encode_native : buffer ? encode_buffer : encode_legacy;
const decode64 = native ? decode_native : buffer ? decode_buffer : decode_legacy;
function parse(serialized, revivers) {
  return unflatten$1(JSON.parse(serialized), revivers);
}
function unflatten$1(parsed, revivers) {
  if (typeof parsed === "number") return hydrate(parsed, true);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid input");
  }
  const values = (
    /** @type {any[]} */
    parsed
  );
  const hydrated = Array(values.length);
  let hydrating = null;
  function hydrate(index, standalone = false) {
    if (index === UNDEFINED) return void 0;
    if (index === NAN) return NaN;
    if (index === POSITIVE_INFINITY) return Infinity;
    if (index === NEGATIVE_INFINITY) return -Infinity;
    if (index === NEGATIVE_ZERO) return -0;
    if (standalone || typeof index !== "number") {
      throw new Error(`Invalid input`);
    }
    if (index in hydrated) return hydrated[index];
    const value = values[index];
    if (!value || typeof value !== "object") {
      hydrated[index] = value;
    } else if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        const type = value[0];
        const reviver = revivers && Object.hasOwn(revivers, type) ? revivers[type] : void 0;
        if (reviver) {
          let i = value[1];
          if (typeof i !== "number") {
            i = values.push(value[1]) - 1;
          }
          hydrating ??= /* @__PURE__ */ new Set();
          if (hydrating.has(i)) {
            throw new Error("Invalid circular reference");
          }
          hydrating.add(i);
          hydrated[index] = reviver(hydrate(i));
          hydrating.delete(i);
          return hydrated[index];
        }
        switch (type) {
          case "Date":
            hydrated[index] = new Date(value[1]);
            break;
          case "Set":
            const set = /* @__PURE__ */ new Set();
            hydrated[index] = set;
            for (let i = 1; i < value.length; i += 1) {
              set.add(hydrate(value[i]));
            }
            break;
          case "Map":
            const map = /* @__PURE__ */ new Map();
            hydrated[index] = map;
            for (let i = 1; i < value.length; i += 2) {
              map.set(hydrate(value[i]), hydrate(value[i + 1]));
            }
            break;
          case "RegExp":
            hydrated[index] = new RegExp(value[1], value[2]);
            break;
          case "Object": {
            const wrapped_index = value[1];
            if (typeof values[wrapped_index] === "object" && values[wrapped_index][0] !== "BigInt") {
              throw new Error("Invalid input");
            }
            hydrated[index] = Object(hydrate(wrapped_index));
            break;
          }
          case "BigInt":
            hydrated[index] = BigInt(value[1]);
            break;
          case "null":
            const obj = /* @__PURE__ */ Object.create(null);
            hydrated[index] = obj;
            for (let i = 1; i < value.length; i += 2) {
              if (value[i] === "__proto__") {
                throw new Error("Cannot parse an object with a `__proto__` property");
              }
              obj[value[i]] = hydrate(value[i + 1]);
            }
            break;
          case "Int8Array":
          case "Uint8Array":
          case "Uint8ClampedArray":
          case "Int16Array":
          case "Uint16Array":
          case "Float16Array":
          case "Int32Array":
          case "Uint32Array":
          case "Float32Array":
          case "Float64Array":
          case "BigInt64Array":
          case "BigUint64Array":
          case "DataView": {
            if (values[value[1]][0] !== "ArrayBuffer") {
              throw new Error("Invalid data");
            }
            const TypedArrayConstructor = globalThis[type];
            const buffer2 = hydrate(value[1]);
            hydrated[index] = value[2] !== void 0 ? new TypedArrayConstructor(buffer2, value[2], value[3]) : new TypedArrayConstructor(buffer2);
            break;
          }
          case "ArrayBuffer": {
            const base64 = value[1];
            if (typeof base64 !== "string") {
              throw new Error("Invalid ArrayBuffer encoding");
            }
            const arraybuffer = decode64(base64);
            hydrated[index] = arraybuffer;
            break;
          }
          case "Temporal.Duration":
          case "Temporal.Instant":
          case "Temporal.PlainDate":
          case "Temporal.PlainTime":
          case "Temporal.PlainDateTime":
          case "Temporal.PlainMonthDay":
          case "Temporal.PlainYearMonth":
          case "Temporal.ZonedDateTime": {
            const temporalName = type.slice(9);
            hydrated[index] = Temporal[temporalName].from(value[1]);
            break;
          }
          case "URL": {
            const url = new URL(value[1]);
            hydrated[index] = url;
            break;
          }
          case "URLSearchParams": {
            const url = new URLSearchParams(value[1]);
            hydrated[index] = url;
            break;
          }
          default:
            throw new Error(`Unknown type ${type}`);
        }
      } else if (value[0] === SPARSE) {
        const len = value[1];
        if (!is_valid_array_len(len)) {
          throw new Error("Invalid input");
        }
        const array = [];
        hydrated[index] = array;
        array[MAX_ARRAY_INDEX] = void 0;
        delete array[MAX_ARRAY_INDEX];
        for (let i = 2; i < value.length; i += 2) {
          const idx = value[i];
          if (!is_valid_array_index(idx) || idx >= len) {
            throw new Error("Invalid input");
          }
          array[idx] = hydrate(value[i + 1]);
        }
        array.length = len;
      } else {
        const array = new Array(value.length);
        hydrated[index] = array;
        for (let i = 0; i < value.length; i += 1) {
          const n = value[i];
          if (n === HOLE) continue;
          array[i] = hydrate(n);
        }
      }
    } else {
      const object = {};
      hydrated[index] = object;
      for (const key of Object.keys(value)) {
        if (key === "__proto__") {
          throw new Error("Cannot parse an object with a `__proto__` property");
        }
        const n = value[key];
        object[key] = hydrate(n);
      }
    }
    return hydrated[index];
  }
  return hydrate(0);
}
function stringify$2(value, reducers) {
  const stringified = run(false, value, reducers);
  return typeof stringified === "string" ? stringified : `[${stringified.join(",")}]`;
}
function run(async, value, reducers) {
  const stringified = [];
  const indexes = /* @__PURE__ */ new Map();
  const custom = [];
  if (reducers) {
    for (const key of Object.getOwnPropertyNames(reducers)) {
      custom.push({ key, fn: reducers[key] });
    }
  }
  const keys = [];
  let p = 0;
  function flatten(thing, index2) {
    if (thing === void 0) return UNDEFINED;
    if (Number.isNaN(thing)) return NAN;
    if (thing === Infinity) return POSITIVE_INFINITY;
    if (thing === -Infinity) return NEGATIVE_INFINITY;
    if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO;
    if (indexes.has(thing)) return (
      /** @type {number} */
      indexes.get(thing)
    );
    index2 ??= p++;
    indexes.set(thing, index2);
    for (const { key, fn } of custom) {
      const value2 = fn(thing);
      if (value2) {
        stringified[index2] = `["${key}",${flatten(value2)}]`;
        return index2;
      }
    }
    if (typeof thing === "function") {
      throw new DevalueError(`Cannot stringify a function`, keys, thing, value);
    } else if (typeof thing === "symbol") {
      throw new DevalueError(`Cannot stringify a Symbol primitive`, keys, thing, value);
    }
    let str = "";
    if (is_primitive(thing)) {
      str = stringify_primitive(thing);
    } else if (typeof thing.then === "function") {
      {
        throw new DevalueError(
          `Cannot stringify a Promise or thenable — use stringifyAsync instead`,
          keys,
          thing,
          value
        );
      }
    } else {
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "BigInt":
          str = `["Object",${flatten(thing.valueOf())}]`;
          break;
        case "Date":
          const valid = !isNaN(thing.getDate());
          str = `["Date","${valid ? thing.toISOString() : ""}"]`;
          break;
        case "URL":
          str = `["URL",${stringify_string(thing.toString())}]`;
          break;
        case "URLSearchParams":
          str = `["URLSearchParams",${stringify_string(thing.toString())}]`;
          break;
        case "RegExp":
          const { source, flags } = thing;
          str = flags ? `["RegExp",${stringify_string(source)},"${flags}"]` : `["RegExp",${stringify_string(source)}]`;
          break;
        case "Array": {
          let mostly_dense = false;
          str = "[";
          for (let i = 0; i < thing.length; i += 1) {
            if (i > 0) str += ",";
            if (Object.hasOwn(thing, i)) {
              keys.push(`[${i}]`);
              str += flatten(thing[i]);
              keys.pop();
            } else if (mostly_dense) {
              str += HOLE;
            } else {
              const populated_keys = valid_array_indices(
                /** @type {any[]} */
                thing
              );
              const population = populated_keys.length;
              const d = String(thing.length).length;
              const hole_cost = (thing.length - population) * 3;
              const sparse_cost = 4 + d + population * (d + 1);
              if (hole_cost > sparse_cost) {
                str = "[" + SPARSE + "," + thing.length;
                for (let j = 0; j < populated_keys.length; j++) {
                  const key = populated_keys[j];
                  keys.push(`[${key}]`);
                  str += "," + key + "," + flatten(thing[key]);
                  keys.pop();
                }
                break;
              } else {
                mostly_dense = true;
                str += HOLE;
              }
            }
          }
          str += "]";
          break;
        }
        case "Set":
          str = '["Set"';
          for (const value2 of thing) {
            str += `,${flatten(value2)}`;
          }
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key, value2] of thing) {
            keys.push(`.get(${is_primitive(key) ? stringify_primitive(key) : "..."})`);
            str += `,${flatten(key)},${flatten(value2)}`;
            keys.pop();
          }
          str += "]";
          break;
        case "Int8Array":
        case "Uint8Array":
        case "Uint8ClampedArray":
        case "Int16Array":
        case "Uint16Array":
        case "Float16Array":
        case "Int32Array":
        case "Uint32Array":
        case "Float32Array":
        case "Float64Array":
        case "BigInt64Array":
        case "BigUint64Array":
        case "DataView": {
          const typedArray = thing;
          str = '["' + type + '",' + flatten(typedArray.buffer);
          if (typedArray.byteLength !== typedArray.buffer.byteLength) {
            str += `,${typedArray.byteOffset},${typedArray.length}`;
          }
          str += "]";
          break;
        }
        case "ArrayBuffer": {
          const arraybuffer = thing;
          const base64 = encode64(arraybuffer);
          str = `["ArrayBuffer","${base64}"]`;
          break;
        }
        case "Temporal.Duration":
        case "Temporal.Instant":
        case "Temporal.PlainDate":
        case "Temporal.PlainTime":
        case "Temporal.PlainDateTime":
        case "Temporal.PlainMonthDay":
        case "Temporal.PlainYearMonth":
        case "Temporal.ZonedDateTime":
          str = `["${type}",${stringify_string(thing.toString())}]`;
          break;
        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(`Cannot stringify arbitrary non-POJOs`, keys, thing, value);
          }
          if (enumerable_symbols(thing).length > 0) {
            throw new DevalueError(`Cannot stringify POJOs with symbolic keys`, keys, thing, value);
          }
          if (Object.getPrototypeOf(thing) === null) {
            str = '["null"';
            for (const key of Object.keys(thing)) {
              if (key === "__proto__") {
                throw new DevalueError(
                  `Cannot stringify objects with __proto__ keys`,
                  keys,
                  thing,
                  value
                );
              }
              keys.push(stringify_key(key));
              str += `,${stringify_string(key)},${flatten(thing[key])}`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key of Object.keys(thing)) {
              if (key === "__proto__") {
                throw new DevalueError(
                  `Cannot stringify objects with __proto__ keys`,
                  keys,
                  thing,
                  value
                );
              }
              if (started) str += ",";
              started = true;
              keys.push(stringify_key(key));
              str += `${stringify_string(key)}:${flatten(thing[key])}`;
              keys.pop();
            }
            str += "}";
          }
      }
    }
    stringified[index2] = str;
    return index2;
  }
  const index = flatten(value);
  if (index < 0) return `${index}`;
  return stringified;
}
function stringify_primitive(thing) {
  const type = typeof thing;
  if (type === "string") return stringify_string(thing);
  if (thing === void 0) return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0) return NEGATIVE_ZERO.toString();
  if (type === "bigint") return `["BigInt","${thing}"]`;
  return String(thing);
}
const ACTION_QUERY_PARAMS = {
  actionName: "_action"
};
const ACTION_RPC_ROUTE_PATTERN = "/_actions/[...path]";
const __vite_import_meta_env__$1 = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": void 0, "SSR": true };
const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
const statusToCodeMap = Object.fromEntries(
  Object.entries(codeToStatusMap).map(([key, value]) => [value, key])
);
class ActionError extends Error {
  type = "AstroActionError";
  code = "INTERNAL_SERVER_ERROR";
  status = 500;
  constructor(params) {
    super(params.message);
    this.code = params.code;
    this.status = ActionError.codeToStatus(params.code);
    if (params.stack) {
      this.stack = params.stack;
    }
  }
  static codeToStatus(code) {
    return codeToStatusMap[code];
  }
  static statusToCode(status) {
    return statusToCodeMap[status] ?? "INTERNAL_SERVER_ERROR";
  }
  static fromJson(body) {
    if (isInputError(body)) {
      return new ActionInputError(body.issues);
    }
    if (isActionError(body)) {
      return new ActionError(body);
    }
    return new ActionError({
      code: "INTERNAL_SERVER_ERROR"
    });
  }
}
function isActionError(error2) {
  return typeof error2 === "object" && error2 != null && "type" in error2 && error2.type === "AstroActionError";
}
function isInputError(error2) {
  return typeof error2 === "object" && error2 != null && "type" in error2 && error2.type === "AstroActionInputError" && "issues" in error2 && Array.isArray(error2.issues);
}
class ActionInputError extends ActionError {
  type = "AstroActionInputError";
  // We don't expose all ZodError properties.
  // Not all properties will serialize from server to client,
  // and we don't want to import the full ZodError object into the client.
  issues;
  fields;
  constructor(issues) {
    super({
      message: `Failed to validate: ${JSON.stringify(issues, null, 2)}`,
      code: "BAD_REQUEST"
    });
    this.issues = issues;
    this.fields = {};
    for (const issue of issues) {
      if (issue.path.length > 0) {
        const key = issue.path[0].toString();
        this.fields[key] ??= [];
        this.fields[key]?.push(issue.message);
      }
    }
  }
}
function deserializeActionResult(res) {
  if (res.type === "error") {
    let json;
    try {
      json = JSON.parse(res.body);
    } catch {
      return {
        data: void 0,
        error: new ActionError({
          message: res.body,
          code: "INTERNAL_SERVER_ERROR"
        })
      };
    }
    if (Object.assign(__vite_import_meta_env__$1, { CI: "true", _: "/opt/hostedtoolcache/node/22.23.1/x64/bin/npm" })?.PROD) {
      return { error: ActionError.fromJson(json), data: void 0 };
    } else {
      const error2 = ActionError.fromJson(json);
      error2.stack = actionResultErrorStack.get();
      return {
        error: error2,
        data: void 0
      };
    }
  }
  if (res.type === "empty") {
    return { data: void 0, error: void 0 };
  }
  return {
    data: parse(res.body, {
      URL: (href) => new URL(href)
    }),
    error: void 0
  };
}
const actionResultErrorStack = /* @__PURE__ */ (function actionResultErrorStackFn() {
  let errorStack;
  return {
    set(stack) {
      errorStack = stack;
    },
    get() {
      return errorStack;
    }
  };
})();
function getActionQueryString(name) {
  const searchParams = new URLSearchParams({ [ACTION_QUERY_PARAMS.actionName]: name });
  return `?${searchParams.toString()}`;
}
var ImportType;
!(function(A) {
  A[A.Static = 1] = "Static", A[A.Dynamic = 2] = "Dynamic", A[A.ImportMeta = 3] = "ImportMeta", A[A.StaticSourcePhase = 4] = "StaticSourcePhase", A[A.DynamicSourcePhase = 5] = "DynamicSourcePhase", A[A.StaticDeferPhase = 6] = "StaticDeferPhase", A[A.DynamicDeferPhase = 7] = "DynamicDeferPhase";
})(ImportType || (ImportType = {}));
1 === new Uint8Array(new Uint16Array([1]).buffer)[0];
const E = () => {
  return A = "AGFzbQEAAAABKwhgAX8Bf2AEf39/fwBgAAF/YAAAYAF/AGADf39/AX9gAn9/AX9gA39/fwADODcAAQECAgICAgICAgICAgICAgICAgICAgICAwIAAwMDBAAEAAAABQAAAAAAAwMDAAAGAAcABgIFBAUBcAEBAQUDAQABBg8CfwFBsPIAC38AQbDyAAsHnQEbBm1lbW9yeQIAAnNhAAABZQADAmlzAAQCaWUABQJzcwAGAnNlAAcCaXQACAJhaQAJAmlkAAoCaXAACwJlcwAMAmVlAA0DZWxzAA4DZWxlAA8CcmkAEAJyZQARAWYAEgJtcwATAnJhABQDYWtzABUDYWtlABYDYXZzABcDYXZlABgDcnNhABkFcGFyc2UAGgtfX2hlYXBfYmFzZQMBCrxJN2gBAX9BACAANgL0CUEAKALQCSIBIABBAXRqIgBBADsBAEEAIABBAmoiADYC+AlBACAANgL8CUEAQQA2AtQJQQBBADYC5AlBAEEANgLcCUEAQQA2AtgJQQBBADYC7AlBAEEANgLgCSABC9MBAQN/QQAoAuQJIQRBAEEAKAL8CSIFNgLkCUEAIAQ2AugJQQAgBUEoajYC/AkgBEEkakHUCSAEGyAFNgIAQQAoAsgJIQRBACgCxAkhBiAFIAE2AgAgBSAANgIIIAUgAiACQQJqQQAgBiADRiIAGyAEIANGIgQbNgIMIAUgAzYCFCAFQQA2AhAgBSACNgIEIAVCADcCICAFQQNBAUECIAAbIAQbNgIcIAVBACgCxAkgA0YiAjoAGAJAAkAgAg0AQQAoAsgJIANHDQELQQBBAToAgAoLC14BAX9BACgC7AkiBEEQakHYCSAEG0EAKAL8CSIENgIAQQAgBDYC7AlBACAEQRRqNgL8CUEAQQE6AIAKIARBADYCECAEIAM2AgwgBCACNgIIIAQgATYCBCAEIAA2AgALCABBACgChAoLFQBBACgC3AkoAgBBACgC0AlrQQF1Cx4BAX9BACgC3AkoAgQiAEEAKALQCWtBAXVBfyAAGwsVAEEAKALcCSgCCEEAKALQCWtBAXULHgEBf0EAKALcCSgCDCIAQQAoAtAJa0EBdUF/IAAbCwsAQQAoAtwJKAIcCx4BAX9BACgC3AkoAhAiAEEAKALQCWtBAXVBfyAAGws7AQF/AkBBACgC3AkoAhQiAEEAKALECUcNAEF/DwsCQCAAQQAoAsgJRw0AQX4PCyAAQQAoAtAJa0EBdQsLAEEAKALcCS0AGAsVAEEAKALgCSgCAEEAKALQCWtBAXULFQBBACgC4AkoAgRBACgC0AlrQQF1Cx4BAX9BACgC4AkoAggiAEEAKALQCWtBAXVBfyAAGwseAQF/QQAoAuAJKAIMIgBBACgC0AlrQQF1QX8gABsLJQEBf0EAQQAoAtwJIgBBJGpB1AkgABsoAgAiADYC3AkgAEEARwslAQF/QQBBACgC4AkiAEEQakHYCSAAGygCACIANgLgCSAAQQBHCwgAQQAtAIgKCwgAQQAtAIAKCysBAX9BAEEAKAKMCiIAQRBqQQAoAtwJQSBqIAAbKAIAIgA2AowKIABBAEcLFQBBACgCjAooAgBBACgC0AlrQQF1CxUAQQAoAowKKAIEQQAoAtAJa0EBdQsVAEEAKAKMCigCCEEAKALQCWtBAXULFQBBACgCjAooAgxBACgC0AlrQQF1CwoAQQBBADYCjAoLuw8BBX8jAEGA0ABrIgAkAEEAQQE6AIgKQQBBACgCzAk2ApQKQQBBACgC0AlBfmoiATYCqApBACABQQAoAvQJQQF0aiICNgKsCkEAQQA6AIAKQQBBADsBkApBAEEAOwGSCkEAQQA6AJgKQQBBADYChApBAEEAOgDwCUEAIABBgBBqNgKcCkEAIAA2AqAKQQBBADoApAoCQAJAAkACQANAQQAgAUECaiIDNgKoCiABIAJPDQECQCADLwEAIgJBd2pBBUkNAAJAAkACQAJAAkAgAkGbf2oOBQEICAgCAAsgAkEgRg0EIAJBL0YNAyACQTtGDQIMBwtBAC8BkgoNASADEBtFDQEgAUEEakGCCEEKEDYNARAcQQAtAIgKDQFBAEEAKAKoCiIBNgKUCgwHCyADEBtFDQAgAUEEakGMCEEKEDYNABAdC0EAQQAoAqgKNgKUCgwBCwJAIAEvAQQiA0EqRg0AIANBL0cNBBAeDAELQQEQHwtBACgCrAohAkEAKAKoCiEBDAALC0EAIQIgAyEBQQAtAPAJDQIMAQtBACABNgKoCkEAQQA6AIgKCwNAQQAgAUECaiIDNgKoCgJAAkACQAJAAkACQAJAIAFBACgCrApPDQACQAJAAkACQAJAAkACQAJAAkACQAJAAkACQCADLwEAIgJBYGoOEBMSCRISEhIIAQUSEgQSEgoACwJAAkACQAJAIAJBpX9qDg8FFQYVFQ4VFQMVARUVFQIACyACQXdqQQVJDRUgAkGFf2oOAwgUCRQLQQAvAZIKDRMgAxAbRQ0TIAFBBGpBgghBChA2DRMQHAwTCyADEBtFDRIgAUEEakGMCEEKEDYNEhAdDBILIAMQG0UNESABKQAEQuyAhIOwjsA5Ug0RIAEvAQwiA0F3aiIBQRdLDQ9BASABdEGfgIAEcUUNDwwQC0EAQQAvAZIKIgFBAWo7AZIKQQAoApwKIAFBA3RqIgFBATYCACABQQAoApQKNgIEDBALQQBBAC8BkgoiAUEBajsBkgpBACgCnAogAUEDdGoiAUEINgIAIAFBACgClAo2AgQMDwtBAC8BkgoiAUUNC0EAIAFBf2o7AZIKDA4LQQAvAZAKIgNFDQ1BAC8BkgoiAkUNDSACQQN0QQAoApwKakF4aigCAEEFRw0NIANBAnRBACgCoApqQXxqKAIAIgMoAgQNDUEAIAFBBGo2AqgKIANBACgClApBAmo2AgRBARAgGiADQQAoAqgKIgE2AhBBACABQX5qNgKoCgwNC0EALwGSCiIDRQ0JQQAgA0F/aiIDOwGSCkEALwGQCiICRQ0MQQAoApwKIANB//8DcUEDdGooAgBBBUcNDAJAIAJBAnRBACgCoApqQXxqKAIAIgMoAgQNACADQQAoApQKQQJqNgIEC0EAIAJBf2o7AZAKIAMgAUEEajYCDAwMCwJAQQAoApQKIgEvAQBBKUcNAEEAKALkCSIDRQ0AIAMoAgQgAUcNAEEAQQAoAugJIgM2AuQJAkAgA0UNACADQQA2AiQMAQtBAEEANgLUCQtBAEEALwGSCiIDQQFqOwGSCkEAKAKcCiADQQN0aiIDQQZBAkEALQCkChs2AgAgAyABNgIEQQBBADoApAoMCwtBAC8BkgoiAUUNB0EAIAFBf2oiATsBkgpBACgCnAogAUH//wNxQQN0aigCAEEERg0EDAoLQScQIQwJC0EiECEMCAsCQAJAIAEvAQQiAUEqRg0AIAFBL0cNARAeDAoLQQEQHwwJCwJAAkACQAJAQQAoApQKIgEvAQAiAxAiRQ0AAkACQCADQVVqDgQACQEDCQsgAUF+ai8BAEErRg0DDAgLIAFBfmovAQBBLUYNAgwHCyADQSlHDQFBACgCnApBAC8BkgoiAkEDdGooAgQQI0UNAgwGCyABQX5qLwEAQVBqQf//A3FBCk8NBQtBAC8BkgohAgsCQAJAIAJB//8DcSICRQ0AIANB5gBHDQBBACgCnAogAkF/akEDdGoiBCgCAEEBRw0AIAFBfmovAQBB7wBHDQEgAUF8ahAkRQ0BIAQoAgRBlghBAxAlRQ0BDAULIANB/QBHDQBBACgCnAogAkEDdGoiAigCBBAmDQQgAigCAEEGRg0ECyABECcNAyADRQ0DIANBL0ZBAC0AmApBAEdxDQMCQEEAKALsCSICRQ0AIAEgAigCAEkNACABIAIoAgRNDQQLIAFBfmohAUEAKALQCSECAkADQCABQQJqIgQgAk0NAUEAIAE2ApQKIAEvAQAhAyABQX5qIgQhASADEChFDQALIARBAmohBAsCQCADQf//A3EQKUUNACAEQX5qIQECQANAIAFBAmoiAyACTQ0BQQAgATYClAogAS8BACEDIAFBfmoiBCEBIAMQKQ0ACyAEQQJqIQMLIAMQKg0EC0EAQQE6AJgKDAcLQQAoApwKQQAvAZIKIgFBA3QiA2pBACgClAo2AgRBACABQQFqOwGSCkEAKAKcCiADakEDNgIACxArDAULQQAtAPAJQQAvAZAKQQAvAZIKcnJFIQIMBwsQLEEAQQA6AJgKDAMLEC1BACECDAULIANBoAFHDQELQQBBAToApAoLQQBBACgCqAo2ApQKC0EAKAKoCiEBDAALCyAAQYDQAGokACACCxoAAkBBACgC0AkgAEcNAEEBDwsgAEF+ahAuC/4KAQZ/QQBBACgCqAoiAEEMaiIBNgKoCkEAKALsCSECQQEQICEDAkACQAJAAkACQAJAAkACQAJAQQAoAqgKIgQgAUcNACADEC9FDQELAkACQAJAAkACQAJAAkAgA0EqRg0AIANB+wBHDQFBACAEQQJqNgKoCkEBECAhA0EAKAKoCiEEA0ACQAJAIANB//8DcSIDQSJGDQAgA0EnRg0AIAMQMxpBACgCqAohAwwBCyADECFBAEEAKAKoCkECaiIDNgKoCgtBARAgGgJAIAQgAxA0IgNBLEcNAEEAQQAoAqgKQQJqNgKoCkEBECAhAwsgA0H9AEYNA0EAKAKoCiIFIARGDQ8gBSEEIAVBACgCrApNDQAMDwsLQQAgBEECajYCqApBARAgGkEAKAKoCiIDIAMQNBoMAgtBAEEAOgCICgJAAkACQAJAAkACQCADQZ9/ag4MAgsEAQsDCwsLCwsFAAsgA0H2AEYNBAwKC0EAIARBDmoiAzYCqAoCQAJAAkBBARAgQZ9/ag4GABICEhIBEgtBACgCqAoiBSkAAkLzgOSD4I3AMVINESAFLwEKEClFDRFBACAFQQpqNgKoCkEAECAaC0EAKAKoCiIFQQJqQbIIQQ4QNg0QIAUvARAiAkF3aiIBQRdLDQ1BASABdEGfgIAEcUUNDQwOC0EAKAKoCiIFKQACQuyAhIOwjsA5Ug0PIAUvAQoiAkF3aiIBQRdNDQYMCgtBACAEQQpqNgKoCkEAECAaQQAoAqgKIQQLQQAgBEEQajYCqAoCQEEBECAiBEEqRw0AQQBBACgCqApBAmo2AqgKQQEQICEEC0EAKAKoCiEDIAQQMxogA0EAKAKoCiIEIAMgBBACQQBBACgCqApBfmo2AqgKDwsCQCAEKQACQuyAhIOwjsA5Ug0AIAQvAQoQKEUNAEEAIARBCmo2AqgKQQEQICEEQQAoAqgKIQMgBBAzGiADQQAoAqgKIgQgAyAEEAJBAEEAKAKoCkF+ajYCqAoPC0EAIARBBGoiBDYCqAoLQQAgBEEGajYCqApBAEEAOgCICkEBECAhBEEAKAKoCiEDIAQQMyEEQQAoAqgKIQIgBEHf/wNxIgFB2wBHDQNBACACQQJqNgKoCkEBECAhBUEAKAKoCiEDQQAhBAwEC0EAQQE6AIAKQQBBACgCqApBAmo2AqgKC0EBECAhBEEAKAKoCiEDAkAgBEHmAEcNACADQQJqQawIQQYQNg0AQQAgA0EIajYCqAogAEEBECBBABAyIAJBEGpB2AkgAhshAwNAIAMoAgAiA0UNBSADQgA3AgggA0EQaiEDDAALC0EAIANBfmo2AqgKDAMLQQEgAXRBn4CABHFFDQMMBAtBASEECwNAAkACQCAEDgIAAQELIAVB//8DcRAzGkEBIQQMAQsCQAJAQQAoAqgKIgQgA0YNACADIAQgAyAEEAJBARAgIQQCQCABQdsARw0AIARBIHJB/QBGDQQLQQAoAqgKIQMCQCAEQSxHDQBBACADQQJqNgKoCkEBECAhBUEAKAKoCiEDIAVBIHJB+wBHDQILQQAgA0F+ajYCqAoLIAFB2wBHDQJBACACQX5qNgKoCg8LQQAhBAwACwsPCyACQaABRg0AIAJB+wBHDQQLQQAgBUEKajYCqApBARAgIgVB+wBGDQMMAgsCQCACQVhqDgMBAwEACyACQaABRw0CC0EAIAVBEGo2AqgKAkBBARAgIgVBKkcNAEEAQQAoAqgKQQJqNgKoCkEBECAhBQsgBUEoRg0BC0EAKAKoCiEBIAUQMxpBACgCqAoiBSABTQ0AIAQgAyABIAUQAkEAQQAoAqgKQX5qNgKoCg8LIAQgA0EAQQAQAkEAIARBDGo2AqgKDwsQLQuFDAEKf0EAQQAoAqgKIgBBDGoiATYCqApBARAgIQJBACgCqAohAwJAAkACQAJAAkACQAJAAkAgAkEuRw0AQQAgA0ECajYCqAoCQEEBECAiAkHkAEYNAAJAIAJB8wBGDQAgAkHtAEcNB0EAKAKoCiICQQJqQZwIQQYQNg0HAkBBACgClAoiAxAxDQAgAy8BAEEuRg0ICyAAIAAgAkEIakEAKALICRABDwtBACgCqAoiAkECakGiCEEKEDYNBgJAQQAoApQKIgMQMQ0AIAMvAQBBLkYNBwtBACEEQQAgAkEMajYCqApBASEFQQUhBkEBECAhAkEAIQdBASEIDAILQQAoAqgKIgIpAAJC5YCYg9CMgDlSDQUCQEEAKAKUCiIDEDENACADLwEAQS5GDQYLQQAhBEEAIAJBCmo2AqgKQQIhCEEHIQZBASEHQQEQICECQQEhBQwBCwJAAkACQAJAIAJB8wBHDQAgAyABTQ0AIANBAmpBoghBChA2DQACQCADLwEMIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAgsgBEGgAUYNAQtBACEHQQchBkEBIQQgAkHkAEYNAQwCC0EAIQRBACADQQxqIgI2AqgKQQEhBUEBECAhCQJAQQAoAqgKIgYgAkYNAEHmACECAkAgCUHmAEYNAEEFIQZBACEHQQEhCCAJIQIMBAtBACEHQQEhCCAGQQJqQawIQQYQNg0EIAYvAQgQKEUNBAtBACEHQQAgAzYCqApBByEGQQEhBEEAIQVBACEIIAkhAgwCCyADIABBCmpNDQBBACEIQeQAIQICQCADKQACQuWAmIPQjIA5Ug0AAkACQCADLwEKIgRBd2oiB0EXSw0AQQEgB3RBn4CABHENAQtBACEIIARBoAFHDQELQQAhBUEAIANBCmo2AqgKQSohAkEBIQdBAiEIQQEQICIJQSpGDQRBACADNgKoCkEBIQRBACEHQQAhCCAJIQIMAgsgAyEGQQAhBwwCC0EAIQVBACEICwJAIAJBKEcNAEEAKAKcCkEALwGSCiICQQN0aiIDQQAoAqgKNgIEQQAgAkEBajsBkgogA0EFNgIAQQAoApQKLwEAQS5GDQRBAEEAKAKoCiIDQQJqNgKoCkEBECAhAiAAQQAoAqgKQQAgAxABAkACQCAFDQBBACgC5AkhAQwBC0EAKALkCSIBIAY2AhwLQQBBAC8BkAoiA0EBajsBkApBACgCoAogA0ECdGogATYCAAJAIAJBIkYNACACQSdGDQBBAEEAKAKoCkF+ajYCqAoPCyACECFBAEEAKAKoCkECaiICNgKoCgJAAkACQEEBECBBV2oOBAECAgACC0EAQQAoAqgKQQJqNgKoCkEBECAaQQAoAuQJIgMgAjYCBCADQQE6ABggA0EAKAKoCiICNgIQQQAgAkF+ajYCqAoPC0EAKALkCSIDIAI2AgQgA0EBOgAYQQBBAC8BkgpBf2o7AZIKIANBACgCqApBAmo2AgxBAEEALwGQCkF/ajsBkAoPC0EAQQAoAqgKQX5qNgKoCg8LAkAgBEEBcyACQfsAR3INAEEAKAKoCiECQQAvAZIKDQUDQAJAAkACQCACQQAoAqwKTw0AQQEQICICQSJGDQEgAkEnRg0BIAJB/QBHDQJBAEEAKAKoCkECajYCqAoLQQEQICEDQQAoAqgKIQICQCADQeYARw0AIAJBAmpBrAhBBhA2DQcLQQAgAkEIajYCqAoCQEEBECAiAkEiRg0AIAJBJ0cNBwsgACACQQAQMg8LIAIQIQtBAEEAKAKoCkECaiICNgKoCgwACwsCQAJAIAJBWWoOBAMBAQMACyACQSJGDQILQQAoAqgKIQYLIAYgAUcNAEEAIABBCmo2AqgKDwsgAkEqRyAHcQ0DQQAvAZIKQf//A3ENA0EAKAKoCiECQQAoAqwKIQEDQCACIAFPDQECQAJAIAIvAQAiA0EnRg0AIANBIkcNAQsgACADIAgQMg8LQQAgAkECaiICNgKoCgwACwsQLQsPC0EAIAJBfmo2AqgKDwtBAEEAKAKoCkF+ajYCqAoLRwEDf0EAKAKoCkECaiEAQQAoAqwKIQECQANAIAAiAkF+aiABTw0BIAJBAmohACACLwEAQXZqDgQBAAABAAsLQQAgAjYCqAoLmAEBA39BAEEAKAKoCiIBQQJqNgKoCiABQQZqIQFBACgCrAohAgNAAkACQAJAIAFBfGogAk8NACABQX5qLwEAIQMCQAJAIAANACADQSpGDQEgA0F2ag4EAgQEAgQLIANBKkcNAwsgAS8BAEEvRw0CQQAgAUF+ajYCqAoMAQsgAUF+aiEBC0EAIAE2AqgKDwsgAUECaiEBDAALC5wBAQN/QQAoAqgKIQECQANAAkACQCABLwEAIgJBL0cNAAJAIAEvAQIiAUEqRg0AIAFBL0cNBBAeDAILIAAQHwwBCwJAAkAgAEUNACACQXdqIgFBF0sNAUEBIAF0QZ+AgARxRQ0BDAILIAIQKUUNAwwBCyACQaABRw0CC0EAQQAoAqgKIgNBAmoiATYCqAogA0EAKAKsCkkNAAsLIAILiAEBBH9BACgCqAohAUEAKAKsCiECAkACQANAIAEiA0ECaiEBIAMgAk8NASABLwEAIgQgAEYNAgJAIARB3ABGDQAgBEF2ag4EAgEBAgELIANBBGohASADLwEEQQ1HDQAgA0EGaiABIAMvAQZBCkYbIQEMAAsLQQAgATYCqAoQLQ8LQQAgATYCqAoLbAEBfwJAAkAgAEFfaiIBQQVLDQBBASABdEExcQ0BCyAAQUZqQf//A3FBBkkNACAAQSlHIABBWGpB//8DcUEHSXENAAJAIABBpX9qDgQBAAABAAsgAEH9AEcgAEGFf2pB//8DcUEESXEPC0EBCy4BAX9BASEBAkAgAEGcCUEFECUNACAAQZYIQQMQJQ0AIABBpglBAhAlIQELIAELygEBAn8CQAJAIAAvAQAiAUF3akEFSQ0AIAFBIEYNACABQSlGDQAgAUHdAEYNACABQaABRg0AQQAhAiABQf0ARw0BC0EAKALQCSECAkACQANAIAAvAQAhASAAIAJNDQECQCABQXdqQQVJDQAgAUEgRg0AIAFBoAFGDQACQCABQSlGDQAgAUHdAEYNACABQf0ARw0EC0EBDwsgAEF+aiEADAALC0EBIQIgAUEpRg0BIAFB3QBGDQEgAUH9AEYNAQsgARAvQQFzIQILIAILRgEDf0EAIQMCQCAAIAJBAXQiAmsiBEECaiIAQQAoAtAJIgVJDQAgACABIAIQNg0AAkAgACAFRw0AQQEPCyAEEC4hAwsgAwuDAQECf0EBIQECQAJAAkACQAJAAkAgAC8BACICQUVqDgQFBAQBAAsCQCACQZt/ag4EAwQEAgALIAJBKUYNBCACQfkARw0DIABBfmpBsglBBhAlDwsgAEF+ai8BAEE9Rg8LIABBfmpBqglBBBAlDwsgAEF+akG+CUEDECUPC0EAIQELIAELtAMBAn9BACEBAkACQAJAAkACQAJAAkACQAJAAkAgAC8BAEGcf2oOFAABAgkJCQkDCQkEBQkJBgkHCQkICQsCQAJAIABBfmovAQBBl39qDgQACgoBCgsgAEF8akHACEECECUPCyAAQXxqQcQIQQMQJQ8LAkACQAJAIABBfmovAQBBjX9qDgMAAQIKCwJAIABBfGovAQAiAkHhAEYNACACQewARw0KIABBempB5QAQMA8LIABBempB4wAQMA8LIABBfGpByghBBBAlDwsgAEF8akHSCEEGECUPCyAAQX5qLwEAQe8ARw0GIABBfGovAQBB5QBHDQYCQCAAQXpqLwEAIgJB8ABGDQAgAkHjAEcNByAAQXhqQd4IQQYQJQ8LIABBeGpB6ghBAhAlDwsgAEF+akHuCEEEECUPC0EBIQEgAEF+aiIAQekAEDANBCAAQfYIQQUQJQ8LIABBfmpB5AAQMA8LIABBfmpBgAlBBxAlDwsgAEF+akGOCUEEECUPCwJAIABBfmovAQAiAkHvAEYNACACQeUARw0BIABBfGpB7gAQMA8LIABBfGpBlglBAxAlIQELIAELNAEBf0EBIQECQCAAQXdqQf//A3FBBUkNACAAQYABckGgAUYNACAAQS5HIAAQL3EhAQsgAQswAQF/AkACQCAAQXdqIgFBF0sNAEEBIAF0QY2AgARxDQELIABBoAFGDQBBAA8LQQELTgECf0EAIQECQAJAIAAvAQAiAkHlAEYNACACQesARw0BIABBfmpB7ghBBBAlDwsgAEF+ai8BAEH1AEcNACAAQXxqQdIIQQYQJSEBCyABC94BAQR/QQAoAqgKIQBBACgCrAohAQJAAkACQANAIAAiAkECaiEAIAIgAU8NAQJAAkACQCAALwEAIgNBpH9qDgUCAwMDAQALIANBJEcNAiACLwEEQfsARw0CQQAgAkEEaiIANgKoCkEAQQAvAZIKIgJBAWo7AZIKQQAoApwKIAJBA3RqIgJBBDYCACACIAA2AgQPC0EAIAA2AqgKQQBBAC8BkgpBf2oiADsBkgpBACgCnAogAEH//wNxQQN0aigCAEEDRw0DDAQLIAJBBGohAAwACwtBACAANgKoCgsQLQsLcAECfwJAAkADQEEAQQAoAqgKIgBBAmoiATYCqAogAEEAKAKsCk8NAQJAAkACQCABLwEAIgFBpX9qDgIBAgALAkAgAUF2ag4EBAMDBAALIAFBL0cNAgwECxA1GgwBC0EAIABBBGo2AqgKDAALCxAtCws1AQF/QQBBAToA8AlBACgCqAohAEEAQQAoAqwKQQJqNgKoCkEAIABBACgC0AlrQQF1NgKECgtDAQJ/QQEhAQJAIAAvAQAiAkF3akH//wNxQQVJDQAgAkGAAXJBoAFGDQBBACEBIAIQL0UNACACQS5HIAAQMXIPCyABC2gBAn9BASEBAkACQCAAQV9qIgJBBUsNAEEBIAJ0QTFxDQELIABB+P8DcUEoRg0AIABBRmpB//8DcUEGSQ0AAkAgAEGlf2oiAkEDSw0AIAJBAUcNAQsgAEGFf2pB//8DcUEESSEBCyABCz0BAn9BACECAkBBACgC0AkiAyAASw0AIAAvAQAgAUcNAAJAIAMgAEcNAEEBDwsgAEF+ai8BABAoIQILIAILMQEBf0EAIQECQCAALwEAQS5HDQAgAEF+ai8BAEEuRw0AIABBfGovAQBBLkYhAQsgAQvbBAEFfwJAIAFBIkYNACABQSdGDQAQLQ8LQQAoAqgKIQMgARAhIAAgA0ECakEAKAKoCkEAKALECRABAkAgAkEBSA0AQQAoAuQJQQRBBiACQQFGGzYCHAtBAEEAKAKoCkECajYCqApBABAgIQJBACgCqAohAQJAAkAgAkH3AEcNACABLwECQekARw0AIAEvAQRB9ABHDQAgAS8BBkHoAEYNAQtBACABQX5qNgKoCg8LQQAgAUEIajYCqAoCQEEBECBB+wBGDQBBACABNgKoCg8LQQAoAqgKIgQhA0EAIQADQEEAIANBAmo2AqgKAkACQAJAAkBBARAgIgJBJ0cNAEEAKAKoCiEFQScQIUEAKAKoCkECaiEDDAELQQAoAqgKIQUgAkEiRw0BQSIQIUEAKAKoCkECaiEDC0EAIAM2AqgKQQEQICECDAELIAIQMyECQQAoAqgKIQMLAkAgAkE6Rg0AQQAgATYCqAoPC0EAQQAoAqgKQQJqNgKoCgJAQQEQICICQSJGDQAgAkEnRg0AQQAgATYCqAoPC0EAKAKoCiEGIAIQIUEAQQAoAvwJIgJBFGo2AvwJQQAoAqgKIQcgAiAFNgIAIAJBADYCECACIAY2AgggAiADNgIEIAIgB0ECajYCDEEAQQAoAqgKQQJqNgKoCiAAQRBqQQAoAuQJQSBqIAAbIAI2AgACQAJAQQEQICIAQSxGDQAgAEH9AEYNAUEAIAE2AqgKDwtBAEEAKAKoCkECaiIDNgKoCiACIQAMAQsLQQAoAuQJIgEgBDYCECABQQAoAqgKQQJqNgIMC20BAn8CQAJAA0ACQCAAQf//A3EiAUF3aiICQRdLDQBBASACdEGfgIAEcQ0CCyABQaABRg0BIAAhAiABEC8NAkEAIQJBAEEAKAKoCiIAQQJqNgKoCiAALwECIgANAAwCCwsgACECCyACQf//A3ELqwEBBH8CQAJAQQAoAqgKIgIvAQAiA0HhAEYNACABIQQgACEFDAELQQAgAkEEajYCqApBARAgIQJBACgCqAohBQJAAkAgAkEiRg0AIAJBJ0YNACACEDMaQQAoAqgKIQQMAQsgAhAhQQBBACgCqApBAmoiBDYCqAoLQQEQICEDQQAoAqgKIQILAkAgAiAFRg0AIAUgBEEAIAAgACABRiICG0EAIAEgAhsQAgsgAwtyAQR/QQAoAqgKIQBBACgCrAohAQJAAkADQCAAQQJqIQIgACABTw0BAkACQCACLwEAIgNBpH9qDgIBBAALIAIhACADQXZqDgQCAQECAQsgAEEEaiEADAALC0EAIAI2AqgKEC1BAA8LQQAgAjYCqApB3QALSQEDf0EAIQMCQCACRQ0AAkADQCAALQAAIgQgAS0AACIFRw0BIAFBAWohASAAQQFqIQAgAkF/aiICDQAMAgsLIAQgBWshAwsgAwsL4gECAEGACAvEAQAAeABwAG8AcgB0AG0AcABvAHIAdABmAG8AcgBlAHQAYQBvAHUAcgBjAGUAcgBvAG0AdQBuAGMAdABpAG8AbgB2AG8AeQBpAGUAZABlAGwAZQBjAG8AbgB0AGkAbgBpAG4AcwB0AGEAbgB0AHkAYgByAGUAYQByAGUAdAB1AHIAZABlAGIAdQBnAGcAZQBhAHcAYQBpAHQAaAByAHcAaABpAGwAZQBpAGYAYwBhAHQAYwBmAGkAbgBhAGwAbABlAGwAcwAAQcQJCxABAAAAAgAAAAAEAAAwOQAA", "undefined" != typeof Buffer ? Buffer.from(A, "base64") : Uint8Array.from(atob(A), ((A2) => A2.charCodeAt(0)));
  var A;
};
WebAssembly.compile(E()).then(WebAssembly.instantiate).then((({ exports: A }) => {
}));
const __vite_import_meta_env__ = { "ASSETS_PREFIX": void 0, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": void 0, "SSR": true };
function getActionContext(context) {
  const callerInfo = getCallerInfo(context);
  const actionResultAlreadySet = Boolean(context.locals._actionPayload);
  let action = void 0;
  if (callerInfo && context.request.method === "POST" && !actionResultAlreadySet) {
    action = {
      calledFrom: callerInfo.from,
      name: callerInfo.name,
      handler: async () => {
        const pipeline = Reflect.get(context, pipelineSymbol);
        const callerInfoName = shouldAppendForwardSlash(
          pipeline.manifest.trailingSlash,
          pipeline.manifest.buildFormat
        ) ? removeTrailingForwardSlash(callerInfo.name) : callerInfo.name;
        let baseAction;
        try {
          baseAction = await pipeline.getAction(callerInfoName);
        } catch (error2) {
          if (error2 instanceof Error && "name" in error2 && typeof error2.name === "string" && error2.name === ActionNotFoundError.name) {
            return { data: void 0, error: new ActionError({ code: "NOT_FOUND" }) };
          }
          throw error2;
        }
        const bodySizeLimit = pipeline.manifest.actionBodySizeLimit;
        let input;
        try {
          input = await parseRequestBody(context.request, bodySizeLimit);
        } catch (e) {
          if (e instanceof ActionError) {
            return { data: void 0, error: e };
          }
          if (e instanceof TypeError) {
            return { data: void 0, error: new ActionError({ code: "UNSUPPORTED_MEDIA_TYPE" }) };
          }
          throw e;
        }
        const omitKeys = ["props", "getActionResult", "callAction", "redirect"];
        const actionAPIContext = Object.create(
          Object.getPrototypeOf(context),
          Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(context)).filter(
              ([key]) => !omitKeys.includes(key)
            )
          )
        );
        Reflect.set(actionAPIContext, ACTION_API_CONTEXT_SYMBOL, true);
        const handler = baseAction.bind(actionAPIContext);
        return handler(input);
      }
    };
  }
  function setActionResult(actionName, actionResult) {
    context.locals._actionPayload = {
      actionResult,
      actionName
    };
  }
  return {
    action,
    setActionResult,
    serializeActionResult,
    deserializeActionResult
  };
}
function getCallerInfo(ctx) {
  if (ctx.routePattern === ACTION_RPC_ROUTE_PATTERN) {
    return { from: "rpc", name: ctx.url.pathname.replace(/^.*\/_actions\//, "") };
  }
  const queryParam = ctx.url.searchParams.get(ACTION_QUERY_PARAMS.actionName);
  if (queryParam) {
    return { from: "form", name: queryParam };
  }
  return void 0;
}
async function parseRequestBody(request, bodySizeLimit) {
  const contentType = request.headers.get("content-type");
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number.parseInt(contentLengthHeader, 10) : void 0;
  const hasContentLength = typeof contentLength === "number" && Number.isFinite(contentLength);
  if (!contentType) return void 0;
  if (hasContentLength && contentLength > bodySizeLimit) {
    throw new ActionError({
      code: "CONTENT_TOO_LARGE",
      message: `Request body exceeds ${bodySizeLimit} bytes`
    });
  }
  try {
    if (hasContentType(contentType, formContentTypes)) {
      if (!hasContentLength) {
        const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
        const formRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: toArrayBuffer(body)
        });
        return await formRequest.formData();
      }
      return await request.clone().formData();
    }
    if (hasContentType(contentType, ["application/json"])) {
      if (contentLength === 0) return void 0;
      if (!hasContentLength) {
        const body = await readBodyWithLimit(request.clone(), bodySizeLimit);
        if (body.byteLength === 0) return void 0;
        return JSON.parse(new TextDecoder().decode(body));
      }
      return await request.clone().json();
    }
  } catch (e) {
    if (e instanceof BodySizeLimitError) {
      throw new ActionError({
        code: "CONTENT_TOO_LARGE",
        message: `Request body exceeds ${bodySizeLimit} bytes`
      });
    }
    throw e;
  }
  throw new TypeError("Unsupported content type");
}
const ACTION_API_CONTEXT_SYMBOL = /* @__PURE__ */ Symbol.for("astro.actionAPIContext");
const formContentTypes = ["application/x-www-form-urlencoded", "multipart/form-data"];
function hasContentType(contentType, expected) {
  const type = contentType.split(";")[0].toLowerCase();
  return expected.some((t) => type === t);
}
function serializeActionResult(res) {
  if (res.error) {
    if (Object.assign(__vite_import_meta_env__, { _: "/opt/hostedtoolcache/node/22.23.1/x64/bin/npm" })?.DEV) {
      actionResultErrorStack.set(res.error.stack);
    }
    let body2;
    if (res.error instanceof ActionInputError) {
      body2 = {
        type: res.error.type,
        issues: res.error.issues,
        fields: res.error.fields
      };
    } else {
      body2 = {
        ...res.error,
        message: res.error.message
      };
    }
    return {
      type: "error",
      status: res.error.status,
      contentType: "application/json",
      body: JSON.stringify(body2)
    };
  }
  if (res.data === void 0) {
    return {
      type: "empty",
      status: 204
    };
  }
  let body;
  try {
    body = stringify$2(res.data, {
      // Add support for URL objects
      URL: (value) => value instanceof URL && value.href
    });
  } catch (e) {
    let hint = ActionsReturnedInvalidDataError.hint;
    if (res.data instanceof Response) {
      hint = REDIRECT_STATUS_CODES.includes(res.data.status) ? "If you need to redirect when the action succeeds, trigger a redirect where the action is called. See the Actions guide for server and client redirect examples: https://docs.astro.build/en/guides/actions." : "If you need to return a Response object, try using a server endpoint instead. See https://docs.astro.build/en/guides/endpoints/#server-endpoints-api-routes";
    }
    throw new AstroError({
      ...ActionsReturnedInvalidDataError,
      message: ActionsReturnedInvalidDataError.message(String(e)),
      hint
    });
  }
  return {
    type: "data",
    status: 200,
    contentType: "application/json+devalue",
    body
  };
}
function toArrayBuffer(buffer2) {
  const copy = new Uint8Array(buffer2.byteLength);
  copy.set(buffer2);
  return copy.buffer;
}
function hasActionPayload(locals) {
  return "_actionPayload" in locals;
}
function createGetActionResult(locals) {
  return (actionFn) => {
    if (!hasActionPayload(locals) || actionFn.toString() !== getActionQueryString(locals._actionPayload.actionName)) {
      return void 0;
    }
    return deserializeActionResult(locals._actionPayload.actionResult);
  };
}
function createCallAction(context) {
  return (baseAction, input) => {
    Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
    const action = baseAction.bind(context);
    return action(input);
  };
}
var dist = {};
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist;
  hasRequiredDist = 1;
  Object.defineProperty(dist, "__esModule", { value: true });
  dist.parseCookie = parseCookie;
  dist.parse = parseCookie;
  dist.stringifyCookie = stringifyCookie;
  dist.stringifySetCookie = stringifySetCookie;
  dist.serialize = stringifySetCookie;
  dist.parseSetCookie = parseSetCookie;
  dist.stringifySetCookie = stringifySetCookie;
  dist.serialize = stringifySetCookie;
  const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
  const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
  const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
  const pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
  const maxAgeRegExp = /^-?\d+$/;
  const __toString = Object.prototype.toString;
  const NullObject = /* @__PURE__ */ (() => {
    const C = function() {
    };
    C.prototype = /* @__PURE__ */ Object.create(null);
    return C;
  })();
  function parseCookie(str, options) {
    const obj = new NullObject();
    const len = str.length;
    if (len < 2)
      return obj;
    const dec = options?.decode || decode;
    let index = 0;
    do {
      const eqIdx = eqIndex(str, index, len);
      if (eqIdx === -1)
        break;
      const endIdx = endIndex(str, index, len);
      if (eqIdx > endIdx) {
        index = str.lastIndexOf(";", eqIdx - 1) + 1;
        continue;
      }
      const key = valueSlice(str, index, eqIdx);
      if (obj[key] === void 0) {
        obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
      }
      index = endIdx + 1;
    } while (index < len);
    return obj;
  }
  function stringifyCookie(cookie, options) {
    const enc = options?.encode || encodeURIComponent;
    const cookieStrings = [];
    for (const name of Object.keys(cookie)) {
      const val = cookie[name];
      if (val === void 0)
        continue;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`cookie name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`cookie val is invalid: ${val}`);
      }
      cookieStrings.push(`${name}=${value}`);
    }
    return cookieStrings.join("; ");
  }
  function stringifySetCookie(_name, _val, _opts) {
    const cookie = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
    const options = typeof _val === "object" ? _val : _opts;
    const enc = options?.encode || encodeURIComponent;
    if (!cookieNameRegExp.test(cookie.name)) {
      throw new TypeError(`argument name is invalid: ${cookie.name}`);
    }
    const value = cookie.value ? enc(cookie.value) : "";
    if (!cookieValueRegExp.test(value)) {
      throw new TypeError(`argument val is invalid: ${cookie.value}`);
    }
    let str = cookie.name + "=" + value;
    if (cookie.maxAge !== void 0) {
      if (!Number.isInteger(cookie.maxAge)) {
        throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
      }
      str += "; Max-Age=" + cookie.maxAge;
    }
    if (cookie.domain) {
      if (!domainValueRegExp.test(cookie.domain)) {
        throw new TypeError(`option domain is invalid: ${cookie.domain}`);
      }
      str += "; Domain=" + cookie.domain;
    }
    if (cookie.path) {
      if (!pathValueRegExp.test(cookie.path)) {
        throw new TypeError(`option path is invalid: ${cookie.path}`);
      }
      str += "; Path=" + cookie.path;
    }
    if (cookie.expires) {
      if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) {
        throw new TypeError(`option expires is invalid: ${cookie.expires}`);
      }
      str += "; Expires=" + cookie.expires.toUTCString();
    }
    if (cookie.httpOnly) {
      str += "; HttpOnly";
    }
    if (cookie.secure) {
      str += "; Secure";
    }
    if (cookie.partitioned) {
      str += "; Partitioned";
    }
    if (cookie.priority) {
      const priority = typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0;
      switch (priority) {
        case "low":
          str += "; Priority=Low";
          break;
        case "medium":
          str += "; Priority=Medium";
          break;
        case "high":
          str += "; Priority=High";
          break;
        default:
          throw new TypeError(`option priority is invalid: ${cookie.priority}`);
      }
    }
    if (cookie.sameSite) {
      const sameSite = typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite;
      switch (sameSite) {
        case true:
        case "strict":
          str += "; SameSite=Strict";
          break;
        case "lax":
          str += "; SameSite=Lax";
          break;
        case "none":
          str += "; SameSite=None";
          break;
        default:
          throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
      }
    }
    return str;
  }
  function parseSetCookie(str, options) {
    const dec = options?.decode || decode;
    const len = str.length;
    const endIdx = endIndex(str, 0, len);
    const eqIdx = eqIndex(str, 0, endIdx);
    const setCookie = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
      name: valueSlice(str, 0, eqIdx),
      value: dec(valueSlice(str, eqIdx + 1, endIdx))
    };
    let index = endIdx + 1;
    while (index < len) {
      const endIdx2 = endIndex(str, index, len);
      const eqIdx2 = eqIndex(str, index, endIdx2);
      const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
      const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
      switch (attr.toLowerCase()) {
        case "httponly":
          setCookie.httpOnly = true;
          break;
        case "secure":
          setCookie.secure = true;
          break;
        case "partitioned":
          setCookie.partitioned = true;
          break;
        case "domain":
          setCookie.domain = val;
          break;
        case "path":
          setCookie.path = val;
          break;
        case "max-age":
          if (val && maxAgeRegExp.test(val))
            setCookie.maxAge = Number(val);
          break;
        case "expires":
          if (!val)
            break;
          const date = new Date(val);
          if (Number.isFinite(date.valueOf()))
            setCookie.expires = date;
          break;
        case "priority":
          if (!val)
            break;
          const priority = val.toLowerCase();
          if (priority === "low" || priority === "medium" || priority === "high") {
            setCookie.priority = priority;
          }
          break;
        case "samesite":
          if (!val)
            break;
          const sameSite = val.toLowerCase();
          if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
            setCookie.sameSite = sameSite;
          }
          break;
      }
      index = endIdx2 + 1;
    }
    return setCookie;
  }
  function endIndex(str, min, len) {
    const index = str.indexOf(";", min);
    return index === -1 ? len : index;
  }
  function eqIndex(str, min, max) {
    const index = str.indexOf("=", min);
    return index < max ? index : -1;
  }
  function valueSlice(str, min, max) {
    let start = min;
    let end = max;
    do {
      const code = str.charCodeAt(start);
      if (code !== 32 && code !== 9)
        break;
    } while (++start < end);
    while (end > start) {
      const code = str.charCodeAt(end - 1);
      if (code !== 32 && code !== 9)
        break;
      end--;
    }
    return str.slice(start, end);
  }
  function decode(str) {
    if (str.indexOf("%") === -1)
      return str;
    try {
      return decodeURIComponent(str);
    } catch (e) {
      return str;
    }
  }
  function isDate(val) {
    return __toString.call(val) === "[object Date]";
  }
  return dist;
}
var distExports = /* @__PURE__ */ requireDist();
const DELETED_EXPIRATION = /* @__PURE__ */ new Date(0);
const DELETED_VALUE = "deleted";
const responseSentSymbol = /* @__PURE__ */ Symbol.for("astro.responseSent");
const identity = (value) => value;
class AstroCookie {
  value;
  constructor(value) {
    this.value = value;
  }
  json() {
    if (this.value === void 0) {
      throw new Error(`Cannot convert undefined to an object.`);
    }
    return JSON.parse(this.value);
  }
  number() {
    return Number(this.value);
  }
  boolean() {
    if (this.value === "false") return false;
    if (this.value === "0") return false;
    return Boolean(this.value);
  }
}
class AstroCookies {
  #request;
  #requestValues;
  #outgoing;
  #consumed;
  constructor(request) {
    this.#request = request;
    this.#requestValues = null;
    this.#outgoing = null;
    this.#consumed = false;
  }
  /**
   * Astro.cookies.delete(key) is used to delete a cookie. Using this method will result
   * in a Set-Cookie header added to the response.
   * @param key The cookie to delete
   * @param options Options related to this deletion, such as the path of the cookie.
   */
  delete(key, options) {
    const {
      // @ts-expect-error
      maxAge: _ignoredMaxAge,
      // @ts-expect-error
      expires: _ignoredExpires,
      ...sanitizedOptions
    } = options || {};
    const serializeOptions = {
      expires: DELETED_EXPIRATION,
      ...sanitizedOptions
    };
    this.#ensureOutgoingMap().set(key, [
      DELETED_VALUE,
      distExports.serialize(key, DELETED_VALUE, serializeOptions),
      false
    ]);
  }
  /**
   * Astro.cookies.get(key) is used to get a cookie value. The cookie value is read from the
   * request. If you have set a cookie via Astro.cookies.set(key, value), the value will be taken
   * from that set call, overriding any values already part of the request.
   * @param key The cookie to get.
   * @returns An object containing the cookie value as well as convenience methods for converting its value.
   */
  get(key, options = void 0) {
    if (this.#outgoing?.has(key)) {
      let [serializedValue, , isSetValue] = this.#outgoing.get(key);
      if (isSetValue) {
        return new AstroCookie(serializedValue);
      } else {
        return void 0;
      }
    }
    const decode = options?.decode ?? decodeURIComponent;
    const values = this.#ensureParsed();
    if (key in values) {
      const value = values[key];
      if (value) {
        let decodedValue;
        try {
          decodedValue = decode(value);
        } catch (_error) {
          decodedValue = value;
        }
        return new AstroCookie(decodedValue);
      }
    }
  }
  /**
   * Astro.cookies.has(key) returns a boolean indicating whether this cookie is either
   * part of the initial request or set via Astro.cookies.set(key)
   * @param key The cookie to check for.
   * @param _options This parameter is no longer used.
   * @returns
   */
  has(key, _options) {
    if (this.#outgoing?.has(key)) {
      let [, , isSetValue] = this.#outgoing.get(key);
      return isSetValue;
    }
    const values = this.#ensureParsed();
    return values[key] !== void 0;
  }
  /**
   * Astro.cookies.set(key, value) is used to set a cookie's value. If provided
   * an object it will be stringified via JSON.stringify(value). Additionally you
   * can provide options customizing how this cookie will be set, such as setting httpOnly
   * in order to prevent the cookie from being read in client-side JavaScript.
   * @param key The name of the cookie to set.
   * @param value A value, either a string or other primitive or an object.
   * @param options Options for the cookie, such as the path and security settings.
   */
  set(key, value, options) {
    if (this.#consumed) {
      const warning = new Error(
        "Astro.cookies.set() was called after the cookies had already been sent to the browser.\nThis may have happened if this method was called in an imported component.\nPlease make sure that Astro.cookies.set() is only called in the frontmatter of the main page."
      );
      warning.name = "Warning";
      console.warn(warning);
    }
    let serializedValue;
    if (typeof value === "string") {
      serializedValue = value;
    } else {
      let toStringValue = value.toString();
      if (toStringValue === Object.prototype.toString.call(value)) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = toStringValue;
      }
    }
    const serializeOptions = {};
    if (options) {
      Object.assign(serializeOptions, options);
    }
    this.#ensureOutgoingMap().set(key, [
      serializedValue,
      distExports.serialize(key, serializedValue, serializeOptions),
      true
    ]);
    if (this.#request[responseSentSymbol]) {
      throw new AstroError({
        ...ResponseSentError
      });
    }
  }
  /**
   * Merges a new AstroCookies instance into the current instance. Any new cookies
   * will be added to the current instance, overwriting any existing cookies with the same name.
   */
  merge(cookies) {
    const outgoing = cookies.#outgoing;
    if (outgoing) {
      for (const [key, value] of outgoing) {
        this.#ensureOutgoingMap().set(key, value);
      }
    }
  }
  /**
   * Astro.cookies.header() returns an iterator for the cookies that have previously
   * been set by either Astro.cookies.set() or Astro.cookies.delete().
   * This method is primarily used by adapters to set the header on outgoing responses.
   * @returns
   */
  *headers() {
    if (this.#outgoing == null) return;
    for (const [, value] of this.#outgoing) {
      yield value[1];
    }
  }
  /**
   * Marks the cookies as consumed and returns the header values.
   * After consumption, any subsequent `set()` calls will warn.
   */
  consume() {
    this.#consumed = true;
    return this.headers();
  }
  /**
   * @deprecated Use the instance method `cookies.consume()` instead.
   * Kept for backward compatibility with adapters.
   */
  static consume(cookies) {
    return cookies.consume();
  }
  #ensureParsed() {
    if (!this.#requestValues) {
      this.#parse();
    }
    if (!this.#requestValues) {
      this.#requestValues = /* @__PURE__ */ Object.create(null);
    }
    return this.#requestValues;
  }
  #ensureOutgoingMap() {
    if (!this.#outgoing) {
      this.#outgoing = /* @__PURE__ */ new Map();
    }
    return this.#outgoing;
  }
  #parse() {
    const raw = this.#request.headers.get("cookie");
    if (!raw) {
      return;
    }
    this.#requestValues = distExports.parse(raw, { decode: identity });
  }
}
const astroCookiesSymbol = /* @__PURE__ */ Symbol.for("astro.cookies");
function attachCookiesToResponse(response, cookies) {
  Reflect.set(response, astroCookiesSymbol, cookies);
}
function getCookiesFromResponse(response) {
  let cookies = Reflect.get(response, astroCookiesSymbol);
  if (cookies != null) {
    return cookies;
  } else {
    return void 0;
  }
}
function* getSetCookiesFromResponse(response) {
  const cookies = getCookiesFromResponse(response);
  if (!cookies) {
    return [];
  }
  for (const headerValue of cookies.consume()) {
    yield headerValue;
  }
  return [];
}
function deduplicateDirectiveValues(existingDirective, newDirective) {
  const [directiveName, ...existingValues] = existingDirective.split(/\s+/).filter(Boolean);
  const [newDirectiveName, ...newValues] = newDirective.split(/\s+/).filter(Boolean);
  if (directiveName !== newDirectiveName) {
    return void 0;
  }
  const finalDirectives = Array.from(/* @__PURE__ */ new Set([...existingValues, ...newValues]));
  return `${directiveName} ${finalDirectives.join(" ")}`;
}
function pushDirective(directives, newDirective) {
  if (directives.length === 0) {
    return [newDirective];
  }
  const finalDirectives = [];
  let matched = false;
  for (const directive of directives) {
    if (matched) {
      finalDirectives.push(directive);
      continue;
    }
    const result = deduplicateDirectiveValues(directive, newDirective);
    if (result) {
      finalDirectives.push(result);
      matched = true;
    } else {
      finalDirectives.push(directive);
    }
  }
  if (!matched) {
    finalDirectives.push(newDirective);
  }
  return finalDirectives;
}
function computeFallbackRoute(options) {
  const {
    pathname,
    responseStatus,
    fallback,
    fallbackType,
    locales,
    defaultLocale,
    strategy,
    base
  } = options;
  if (responseStatus !== 404) {
    return { type: "none" };
  }
  if (!fallback || Object.keys(fallback).length === 0) {
    return { type: "none" };
  }
  const segments = pathname.split("/");
  const urlLocale = segments.find((segment) => {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (locale === segment) {
          return true;
        }
      } else if (locale.path === segment) {
        return true;
      }
    }
    return false;
  });
  if (!urlLocale) {
    return { type: "none" };
  }
  const fallbackKeys = Object.keys(fallback);
  if (!fallbackKeys.includes(urlLocale)) {
    return { type: "none" };
  }
  const fallbackLocale = fallback[urlLocale];
  const pathFallbackLocale = getPathByLocale(fallbackLocale, locales);
  let newPathname;
  if (pathFallbackLocale === defaultLocale && strategy === "pathname-prefix-other-locales") {
    if (pathname.includes(`${base}`)) {
      newPathname = pathname.replace(`/${urlLocale}`, ``);
    } else {
      newPathname = pathname.replace(`/${urlLocale}`, `/`);
    }
  } else {
    newPathname = pathname.replace(`/${urlLocale}`, `/${pathFallbackLocale}`);
  }
  return {
    type: fallbackType,
    pathname: newPathname
  };
}
class I18nRouter {
  #strategy;
  #defaultLocale;
  #locales;
  #base;
  #domains;
  constructor(options) {
    this.#strategy = options.strategy;
    this.#defaultLocale = options.defaultLocale;
    this.#locales = options.locales;
    this.#base = options.base === "/" ? "/" : removeTrailingForwardSlash(options.base || "");
    this.#domains = options.domains;
  }
  /**
   * Evaluate routing strategy for a pathname.
   * Returns decision object (not HTTP Response).
   */
  match(pathname, context) {
    if (this.shouldSkipProcessing(pathname, context)) {
      return { type: "continue" };
    }
    switch (this.#strategy) {
      case "manual":
        return { type: "continue" };
      case "pathname-prefix-always":
        return this.matchPrefixAlways(pathname, context);
      case "domains-prefix-always":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) {
          return { type: "continue" };
        }
        return this.matchPrefixAlways(pathname, context);
      case "pathname-prefix-other-locales":
        return this.matchPrefixOtherLocales(pathname, context);
      case "domains-prefix-other-locales":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) {
          return { type: "continue" };
        }
        return this.matchPrefixOtherLocales(pathname, context);
      case "pathname-prefix-always-no-redirect":
        return this.matchPrefixAlwaysNoRedirect(pathname, context);
      case "domains-prefix-always-no-redirect":
        if (this.localeHasntDomain(context.currentLocale, context.currentDomain)) {
          return { type: "continue" };
        }
        return this.matchPrefixAlwaysNoRedirect(pathname, context);
      default:
        return { type: "continue" };
    }
  }
  /**
   * Check if i18n processing should be skipped for this request
   */
  shouldSkipProcessing(pathname, context) {
    if (pathname.includes("/404") || pathname.includes("/500")) {
      return true;
    }
    if (pathname.includes("/_server-islands/")) {
      return true;
    }
    if (context.isReroute) {
      return true;
    }
    if (context.routeType && context.routeType !== "page" && context.routeType !== "fallback") {
      return true;
    }
    return false;
  }
  /**
   * Strategy: pathname-prefix-always
   * All locales must have a prefix, including the default locale.
   */
  matchPrefixAlways(pathname, _context) {
    const isRoot = pathname === this.#base + "/" || pathname === this.#base;
    if (isRoot) {
      const basePrefix = this.#base === "/" ? "" : this.#base;
      return {
        type: "redirect",
        location: `${basePrefix}/${this.#defaultLocale}`
      };
    }
    if (!pathHasLocale(pathname, this.#locales)) {
      return { type: "notFound" };
    }
    return { type: "continue" };
  }
  /**
   * Strategy: pathname-prefix-other-locales
   * Default locale has no prefix, other locales must have a prefix.
   */
  matchPrefixOtherLocales(pathname, _context) {
    let pathnameContainsDefaultLocale = false;
    for (const segment of pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(this.#defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = pathname.replace(`/${this.#defaultLocale}`, "");
      return {
        type: "notFound",
        location: newLocation
      };
    }
    return { type: "continue" };
  }
  /**
   * Strategy: pathname-prefix-always-no-redirect
   * Like prefix-always but allows root to serve instead of redirecting
   */
  matchPrefixAlwaysNoRedirect(pathname, _context) {
    const isRoot = pathname === this.#base + "/" || pathname === this.#base;
    if (isRoot) {
      return { type: "continue" };
    }
    if (!pathHasLocale(pathname, this.#locales)) {
      return { type: "notFound" };
    }
    return { type: "continue" };
  }
  /**
   * Check if the current locale doesn't belong to the configured domain.
   * Used for domain-based routing strategies.
   */
  localeHasntDomain(currentLocale, currentDomain) {
    if (!this.#domains || !currentDomain) {
      return false;
    }
    if (!currentLocale) {
      return false;
    }
    const localesForDomain = this.#domains[currentDomain];
    if (!localesForDomain) {
      return true;
    }
    return !localesForDomain.includes(currentLocale);
  }
}
class I18n {
  #i18n;
  #base;
  #trailingSlash;
  #format;
  #router;
  constructor(i18n, base, trailingSlash, format) {
    this.#i18n = i18n;
    this.#base = base;
    this.#trailingSlash = trailingSlash;
    this.#format = format;
    this.#router = new I18nRouter({
      strategy: i18n.strategy,
      defaultLocale: i18n.defaultLocale,
      locales: i18n.locales,
      base,
      domains: i18n.domainLookupTable ? Object.keys(i18n.domainLookupTable).reduce(
        (acc, domain2) => {
          const locale = i18n.domainLookupTable[domain2];
          if (!acc[domain2]) {
            acc[domain2] = [];
          }
          acc[domain2].push(locale);
          return acc;
        },
        {}
      ) : void 0
    });
  }
  async finalize(state, response) {
    state.pipeline.usedFeatures |= PipelineFeatures.i18n;
    const i18n = this.#i18n;
    const typeHeader = response.headers.get(ROUTE_TYPE_HEADER);
    if (typeHeader) {
      response.headers.delete(ROUTE_TYPE_HEADER);
    }
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (typeHeader !== "page" && typeHeader !== "fallback") {
      return response;
    }
    const url = state.url;
    const currentLocale = state.computeCurrentLocale();
    const isPrerendered = state.routeData.prerender;
    const routerContext = {
      currentLocale,
      currentDomain: url.hostname,
      routeType: typeHeader,
      isReroute: isReroute === "yes"
    };
    const routeDecision = this.#router.match(url.pathname, routerContext);
    switch (routeDecision.type) {
      case "redirect": {
        let location = routeDecision.location;
        if (shouldAppendForwardSlash(this.#trailingSlash, this.#format)) {
          location = appendForwardSlash(location);
        }
        return new Response(null, {
          status: routeDecision.status ?? 302,
          headers: { Location: location }
        });
      }
      case "notFound": {
        if (isPrerendered) {
          const prerenderedRes = new Response(response.body, {
            status: 404,
            headers: response.headers
          });
          prerenderedRes.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
          if (routeDecision.location) {
            prerenderedRes.headers.set("Location", routeDecision.location);
          }
          return prerenderedRes;
        }
        const headers = new Headers();
        if (routeDecision.location) {
          headers.set("Location", routeDecision.location);
        }
        return new Response(null, { status: 404, headers });
      }
    }
    if (i18n.fallback && i18n.fallbackType) {
      const effectiveStatus = typeHeader === "fallback" ? 404 : response.status;
      const fallbackDecision = computeFallbackRoute({
        pathname: url.pathname,
        responseStatus: effectiveStatus,
        fallback: i18n.fallback,
        fallbackType: i18n.fallbackType,
        locales: i18n.locales,
        defaultLocale: i18n.defaultLocale,
        strategy: i18n.strategy,
        base: this.#base
      });
      switch (fallbackDecision.type) {
        case "redirect":
          return new Response(null, {
            status: 302,
            headers: { Location: fallbackDecision.pathname + url.search }
          });
        case "rewrite":
          return await state.rewrite(fallbackDecision.pathname + url.search);
      }
    }
    return response;
  }
}
function pathHasLocale(path, locales) {
  const segments = path.split("/").map(normalizeThePath);
  for (const segment of segments) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (normalizeTheLocale(segment) === normalizeTheLocale(locale)) {
          return true;
        }
      } else if (segment === locale.path) {
        return true;
      }
    }
  }
  return false;
}
function getPathByLocale(locale, locales) {
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      if (loopLocale === locale) {
        return loopLocale;
      }
    } else {
      for (const code of loopLocale.codes) {
        if (code === locale) {
          return loopLocale.path;
        }
      }
    }
  }
  throw new AstroError(i18nNoLocaleFoundInPath);
}
function normalizeTheLocale(locale) {
  return locale.replaceAll("_", "-").toLowerCase();
}
function normalizeThePath(path) {
  return path.endsWith(".html") ? path.slice(0, -5) : path;
}
function getAllCodes(locales) {
  const result = [];
  for (const loopLocale of locales) {
    if (typeof loopLocale === "string") {
      result.push(loopLocale);
    } else {
      result.push(...loopLocale.codes);
    }
  }
  return result;
}
function parseLocale(header) {
  if (header === "*") {
    return [{ locale: header, qualityValue: void 0 }];
  }
  const result = [];
  const localeValues = header.split(",").map((str) => str.trim());
  for (const localeValue of localeValues) {
    const split = localeValue.split(";").map((str) => str.trim());
    const localeName = split[0];
    const qualityValue = split[1];
    if (!split) {
      continue;
    }
    if (qualityValue && qualityValue.startsWith("q=")) {
      const qualityValueAsFloat = Number.parseFloat(qualityValue.slice("q=".length));
      if (Number.isNaN(qualityValueAsFloat) || qualityValueAsFloat > 1) {
        result.push({
          locale: localeName,
          qualityValue: void 0
        });
      } else {
        result.push({
          locale: localeName,
          qualityValue: qualityValueAsFloat
        });
      }
    } else {
      result.push({
        locale: localeName,
        qualityValue: void 0
      });
    }
  }
  return result;
}
function sortAndFilterLocales(browserLocaleList, locales) {
  const normalizedLocales = getAllCodes(locales).map(normalizeTheLocale);
  return browserLocaleList.filter((browserLocale) => {
    if (browserLocale.locale !== "*") {
      return normalizedLocales.includes(normalizeTheLocale(browserLocale.locale));
    }
    return true;
  }).sort((a, b) => {
    if (a.qualityValue && b.qualityValue) {
      return Math.sign(b.qualityValue - a.qualityValue);
    }
    return 0;
  });
}
function computePreferredLocale(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = void 0;
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    const firstResult = browserLocaleList.at(0);
    if (firstResult && firstResult.locale !== "*") {
      outer: for (const currentLocale of locales) {
        if (typeof currentLocale === "string") {
          if (normalizeTheLocale(currentLocale) === normalizeTheLocale(firstResult.locale)) {
            result = currentLocale;
            break;
          }
        } else {
          for (const currentCode of currentLocale.codes) {
            if (normalizeTheLocale(currentCode) === normalizeTheLocale(firstResult.locale)) {
              result = currentCode;
              break outer;
            }
          }
        }
      }
    }
  }
  return result;
}
function computePreferredLocaleList(request, locales) {
  const acceptHeader = request.headers.get("Accept-Language");
  let result = [];
  if (acceptHeader) {
    const browserLocaleList = sortAndFilterLocales(parseLocale(acceptHeader), locales);
    if (browserLocaleList.length === 1 && browserLocaleList.at(0).locale === "*") {
      return getAllCodes(locales);
    } else if (browserLocaleList.length > 0) {
      for (const browserLocale of browserLocaleList) {
        for (const loopLocale of locales) {
          if (typeof loopLocale === "string") {
            if (normalizeTheLocale(loopLocale) === normalizeTheLocale(browserLocale.locale)) {
              result.push(loopLocale);
            }
          } else {
            for (const code of loopLocale.codes) {
              if (code === browserLocale.locale) {
                result.push(code);
              }
            }
          }
        }
      }
    }
  }
  return result;
}
function computeCurrentLocale(pathname, locales, defaultLocale) {
  for (const segment of pathname.split("/").map(normalizeThePath)) {
    for (const locale of locales) {
      if (typeof locale === "string") {
        if (!segment.includes(locale)) continue;
        if (normalizeTheLocale(locale) === normalizeTheLocale(segment)) {
          return locale;
        }
      } else {
        if (locale.path === segment) {
          return locale.codes.at(0);
        } else {
          for (const code of locale.codes) {
            if (normalizeTheLocale(code) === normalizeTheLocale(segment)) {
              return code;
            }
          }
        }
      }
    }
  }
  for (const locale of locales) {
    if (typeof locale === "string") {
      if (locale === defaultLocale) {
        return locale;
      }
    } else {
      if (locale.path === defaultLocale) {
        return locale.codes.at(0);
      }
    }
  }
}
function computeCurrentLocaleFromParams(params, locales) {
  const byNormalizedCode = /* @__PURE__ */ new Map();
  const byPath = /* @__PURE__ */ new Map();
  for (const locale of locales) {
    if (typeof locale === "string") {
      byNormalizedCode.set(normalizeTheLocale(locale), locale);
    } else {
      byPath.set(locale.path, locale.codes[0]);
      for (const code of locale.codes) {
        byNormalizedCode.set(normalizeTheLocale(code), code);
      }
    }
  }
  for (const value of Object.values(params)) {
    if (!value) continue;
    const pathMatch = byPath.get(value);
    if (pathMatch) return pathMatch;
    const codeMatch = byNormalizedCode.get(normalizeTheLocale(value));
    if (codeMatch) return codeMatch;
  }
}
async function callMiddleware(onRequest, apiContext, responseFunction) {
  let nextCalled = false;
  let responseFunctionPromise = void 0;
  const next = async (payload) => {
    nextCalled = true;
    responseFunctionPromise = responseFunction(apiContext, payload);
    return responseFunctionPromise;
  };
  const middlewarePromise = onRequest(apiContext, next);
  return await Promise.resolve(middlewarePromise).then(async (value) => {
    if (nextCalled) {
      if (typeof value !== "undefined") {
        if (value instanceof Response === false) {
          throw new AstroError(MiddlewareNotAResponse);
        }
        return value;
      } else {
        if (responseFunctionPromise) {
          return responseFunctionPromise;
        } else {
          throw new AstroError(MiddlewareNotAResponse);
        }
      }
    } else if (typeof value === "undefined") {
      throw new AstroError(MiddlewareNoDataOrNextCalled);
    } else if (value instanceof Response === false) {
      throw new AstroError(MiddlewareNotAResponse);
    } else {
      return value;
    }
  });
}
const EMPTY_OPTIONS = Object.freeze({ tags: [] });
class NoopAstroCache {
  enabled = false;
  set() {
  }
  get tags() {
    return [];
  }
  get options() {
    return EMPTY_OPTIONS;
  }
  async invalidate() {
  }
}
let hasWarned = false;
class DisabledAstroCache {
  enabled = false;
  #logger;
  constructor(logger) {
    this.#logger = logger;
  }
  #warn() {
    if (!hasWarned) {
      hasWarned = true;
      this.#logger?.warn(
        "cache",
        "`cache.set()` was called but caching is not enabled. Configure a cache provider in your Astro config under `experimental.cache` to enable caching."
      );
    }
  }
  set() {
    this.#warn();
  }
  get tags() {
    return [];
  }
  get options() {
    return EMPTY_OPTIONS;
  }
  async invalidate() {
    throw new AstroError(CacheNotEnabled);
  }
}
class AstroMiddleware {
  #pipeline;
  constructor(pipeline) {
    this.#pipeline = pipeline;
  }
  async handle(state, renderRouteCallback) {
    state.pipeline.usedFeatures |= PipelineFeatures.middleware;
    const pipeline = this.#pipeline;
    await state.getProps();
    const apiContext = state.getAPIContext();
    state.counter++;
    if (state.counter === 4) {
      return new Response("Loop Detected", {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/508
        status: 508,
        statusText: "Astro detected a loop where you tried to call the rewriting logic more than four times."
      });
    }
    const next = async (ctx, payload) => {
      if (payload) {
        pipeline.logger.debug("router", "Called rewriting to:", payload);
        const result = await pipeline.tryRewrite(payload, state.request);
        applyRewriteToState(state, payload, result);
      }
      return renderRouteCallback(state, ctx);
    };
    let response;
    if (state.skipMiddleware) {
      response = await next(apiContext);
    } else {
      const pipelineMiddleware = await pipeline.getMiddleware();
      const composed = sequence(...pipeline.internalMiddleware, pipelineMiddleware);
      response = await callMiddleware(composed, apiContext, next);
    }
    response = this.#finalize(state, response);
    state.response = response;
    return response;
  }
  #finalize(state, response) {
    attachCookiesToResponse(response, state.cookies);
    return response;
  }
}
const EMPTY_SLOTS = Object.freeze({});
class PagesHandler {
  #pipeline;
  constructor(pipeline) {
    this.#pipeline = pipeline;
  }
  async handle(state, ctx) {
    const pipeline = this.#pipeline;
    const { logger, streaming } = pipeline;
    let response;
    const componentInstance = await state.loadComponentInstance();
    switch (state.routeData.type) {
      case "endpoint": {
        response = await renderEndpoint(
          componentInstance,
          ctx,
          state.routeData.prerender,
          logger
        );
        break;
      }
      case "page": {
        const props = await state.getProps();
        const actionApiContext = state.getActionAPIContext();
        const result = await state.createResult(componentInstance, actionApiContext);
        try {
          response = await renderPage(
            result,
            componentInstance?.default,
            props,
            state.slots ?? EMPTY_SLOTS,
            streaming,
            state.routeData
          );
        } catch (e) {
          result.cancelled = true;
          throw e;
        }
        response.headers.set(ROUTE_TYPE_HEADER, "page");
        if (state.routeData.route === "/404" || state.routeData.route === "/500") {
          response.headers.set(REROUTE_DIRECTIVE_HEADER, "no");
        }
        if (state.isRewriting) {
          response.headers.set(REWRITE_DIRECTIVE_HEADER_KEY, REWRITE_DIRECTIVE_HEADER_VALUE);
        }
        break;
      }
      case "redirect": {
        return new Response(null, { status: 404, headers: { [ASTRO_ERROR_HEADER]: "true" } });
      }
      case "fallback": {
        return new Response(null, { status: 500, headers: { [ROUTE_TYPE_HEADER]: "fallback" } });
      }
    }
    const responseCookies = getCookiesFromResponse(response);
    if (responseCookies) {
      state.cookies.merge(responseCookies);
    }
    state.response = response;
    return response;
  }
}
function createNormalizedUrl(requestUrl) {
  return normalizeUrl(new URL(requestUrl));
}
function normalizeUrl(url) {
  try {
    url.pathname = validateAndDecodePathname(url.pathname);
  } catch {
    try {
      url.pathname = decodeURI(url.pathname);
    } catch {
    }
  }
  url.pathname = collapseDuplicateSlashes(url.pathname);
  return url;
}
function applyRewriteToState(state, payload, { routeData, componentInstance, newUrl, pathname }, { mergeCookies = false } = {}) {
  const pipeline = state.pipeline;
  const oldPathname = state.pathname;
  const isI18nFallback = routeData.fallbackRoutes && routeData.fallbackRoutes.length > 0;
  if (pipeline.manifest.serverLike && !state.routeData.prerender && routeData.prerender && !isI18nFallback) {
    throw new AstroError({
      ...ForbiddenRewrite,
      message: ForbiddenRewrite.message(state.pathname, pathname, routeData.component),
      hint: ForbiddenRewrite.hint(routeData.component)
    });
  }
  state.routeData = routeData;
  state.componentInstance = componentInstance;
  if (payload instanceof Request) {
    state.request = payload;
  } else {
    state.request = copyRequest(
      newUrl,
      state.request,
      routeData.prerender,
      pipeline.logger,
      state.routeData.route
    );
  }
  state.url = createNormalizedUrl(state.request.url);
  if (mergeCookies) {
    const newCookies = new AstroCookies(state.request);
    if (state.cookies) {
      newCookies.merge(state.cookies);
    }
    state.cookies = newCookies;
  }
  state.params = getParams(routeData, pathname);
  state.pathname = pathname;
  state.isRewriting = true;
  state.status = 200;
  setOriginPathname(
    state.request,
    oldPathname,
    pipeline.manifest.trailingSlash,
    pipeline.manifest.buildFormat
  );
  state.invalidateContexts();
}
class Rewrites {
  async execute(state, payload) {
    const pipeline = state.pipeline;
    pipeline.logger.debug("router", "Calling rewrite: ", payload);
    const result = await pipeline.tryRewrite(payload, state.request);
    applyRewriteToState(state, payload, result, { mergeCookies: true });
    const middleware = new AstroMiddleware(pipeline);
    const pagesHandler = new PagesHandler(pipeline);
    return middleware.handle(state, pagesHandler.handle.bind(pagesHandler));
  }
}
function matchRoute(pathname, manifest2) {
  if (isRoute404(pathname)) {
    const errorRoute = manifest2.routes.find((route) => isRoute404(route.route));
    if (errorRoute) return errorRoute;
  }
  if (isRoute500(pathname)) {
    const errorRoute = manifest2.routes.find((route) => isRoute500(route.route));
    if (errorRoute) return errorRoute;
  }
  return manifest2.routes.find((route) => {
    return route.pattern.test(pathname) || route.fallbackRoutes.some((fallbackRoute) => fallbackRoute.pattern.test(pathname));
  });
}
function isRoute404or500(route) {
  return isRoute404(route.route) || isRoute500(route.route);
}
function isRouteServerIsland(route) {
  return route.component === SERVER_ISLAND_COMPONENT;
}
function computePathnameFromDomain(request, url, i18n, base, trailingSlash, logger) {
  let pathname = void 0;
  if (i18n && (i18n.strategy === "domains-prefix-always" || i18n.strategy === "domains-prefix-other-locales" || i18n.strategy === "domains-prefix-always-no-redirect")) {
    let host = request.headers.get("X-Forwarded-Host");
    let protocol = request.headers.get("X-Forwarded-Proto");
    if (protocol) {
      protocol = protocol + ":";
    } else {
      protocol = url.protocol;
    }
    if (!host) {
      host = request.headers.get("Host");
    }
    if (host && protocol) {
      host = host.split(":")[0];
      try {
        let locale;
        const hostAsUrl = new URL(`${protocol}//${host}`);
        for (const [domainKey, localeValue] of Object.entries(i18n.domainLookupTable)) {
          const domainKeyAsUrl = new URL(domainKey);
          if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
            locale = localeValue;
            break;
          }
        }
        if (locale) {
          pathname = prependForwardSlash(
            joinPaths(normalizeTheLocale(locale), removeBase(url.pathname, base))
          );
          if (trailingSlash === "always") {
            pathname = appendForwardSlash(pathname);
          } else if (trailingSlash === "never") {
            pathname = removeTrailingForwardSlash(pathname);
          } else if (url.pathname.endsWith("/")) {
            pathname = appendForwardSlash(pathname);
          }
        }
      } catch (e) {
        logger.error(
          "router",
          `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
        );
        logger.error("router", `Error: ${e}`);
      }
    }
  }
  return pathname;
}
function removeBase(pathname, base) {
  pathname = collapseDuplicateLeadingSlashes(pathname);
  if (pathname.startsWith(base)) {
    return pathname.slice(removeTrailingForwardSlash(base).length + 1);
  }
  return pathname;
}
const renderOptionsSymbol = /* @__PURE__ */ Symbol.for("astro.renderOptions");
function getRenderOptions(request) {
  return Reflect.get(request, renderOptionsSymbol);
}
function setRenderOptions(request, options) {
  Reflect.set(request, renderOptionsSymbol, options);
}
function matchPattern(url, remotePattern) {
  return matchProtocol(url, remotePattern.protocol) && matchHostname(url, remotePattern.hostname, true) && matchPort(url, remotePattern.port) && matchPathname(url, remotePattern.pathname, true);
}
function matchPort(url, port) {
  return !port || port === url.port;
}
function matchProtocol(url, protocol) {
  return !protocol || protocol === url.protocol.slice(0, -1);
}
function matchHostname(url, hostname, allowWildcard = false) {
  if (!hostname) {
    return true;
  } else if (!allowWildcard || !hostname.startsWith("*")) {
    return hostname === url.hostname;
  } else if (hostname.startsWith("**.")) {
    const slicedHostname = hostname.slice(2);
    return slicedHostname !== url.hostname && url.hostname.endsWith(slicedHostname);
  } else if (hostname.startsWith("*.")) {
    const slicedHostname = hostname.slice(1);
    if (!url.hostname.endsWith(slicedHostname)) {
      return false;
    }
    const subdomainWithDot = url.hostname.slice(0, -(slicedHostname.length - 1));
    return subdomainWithDot.endsWith(".") && !subdomainWithDot.slice(0, -1).includes(".");
  }
  return false;
}
function matchPathname(url, pathname, allowWildcard = false) {
  if (!pathname) {
    return true;
  } else if (!allowWildcard || !pathname.endsWith("*")) {
    return pathname === url.pathname;
  } else if (pathname.endsWith("/**")) {
    const slicedPathname = pathname.slice(0, -2);
    return slicedPathname !== url.pathname && url.pathname.startsWith(slicedPathname);
  } else if (pathname.endsWith("/*")) {
    const slicedPathname = pathname.slice(0, -1);
    if (!url.pathname.startsWith(slicedPathname)) {
      return false;
    }
    const additionalPathChunks = url.pathname.slice(slicedPathname.length).split("/").filter(Boolean);
    return additionalPathChunks.length === 1;
  }
  return false;
}
function isRemoteAllowed(src, {
  domains,
  remotePatterns
}) {
  if (!URL.canParse(src)) {
    return false;
  }
  const url = new URL(src);
  if (!["http:", "https:", "data:"].includes(url.protocol)) {
    return false;
  }
  return domains.some((domain2) => matchHostname(url, domain2)) || remotePatterns.some((remotePattern) => matchPattern(url, remotePattern));
}
function getFirstForwardedValue$1(multiValueHeader) {
  return multiValueHeader?.toString().split(",").map((e) => e.trim())[0];
}
function sanitizeHost(hostname) {
  if (!hostname) return void 0;
  if (/[/\\]/.test(hostname)) return void 0;
  return hostname;
}
function parseHost(host) {
  const parts = host.split(":");
  return {
    hostname: parts[0],
    port: parts[1]
  };
}
function matchesAllowedDomains(hostname, protocol, port, allowedDomains) {
  const hostWithPort = port ? `${hostname}:${port}` : hostname;
  const urlString = `${protocol}://${hostWithPort}`;
  if (!URL.canParse(urlString)) {
    return false;
  }
  const testUrl = new URL(urlString);
  return allowedDomains.some((pattern) => matchPattern(testUrl, pattern));
}
function validateHost(host, protocol, allowedDomains) {
  if (!host || host.length === 0) return void 0;
  if (!allowedDomains || allowedDomains.length === 0) return void 0;
  const sanitized = sanitizeHost(host);
  if (!sanitized) return void 0;
  const { hostname, port } = parseHost(sanitized);
  if (matchesAllowedDomains(hostname, protocol, port, allowedDomains)) {
    return sanitized;
  }
  return void 0;
}
function validateForwardedHeaders(forwardedProtocol, forwardedHost, forwardedPort, allowedDomains) {
  const result = {};
  if (forwardedProtocol) {
    if (allowedDomains && allowedDomains.length > 0) {
      const hasProtocolPatterns = allowedDomains.some((pattern) => pattern.protocol !== void 0);
      if (hasProtocolPatterns) {
        try {
          const testUrl = new URL(`${forwardedProtocol}://example.com`);
          const isAllowed = allowedDomains.some(
            (pattern) => matchPattern(testUrl, { protocol: pattern.protocol })
          );
          if (isAllowed) {
            result.protocol = forwardedProtocol;
          }
        } catch {
        }
      } else if (/^https?$/.test(forwardedProtocol)) {
        result.protocol = forwardedProtocol;
      }
    }
  }
  if (forwardedPort && allowedDomains && allowedDomains.length > 0) {
    const hasPortPatterns = allowedDomains.some((pattern) => pattern.port !== void 0);
    if (hasPortPatterns) {
      const isAllowed = allowedDomains.some((pattern) => pattern.port === forwardedPort);
      if (isAllowed) {
        result.port = forwardedPort;
      }
    }
  }
  if (forwardedHost && forwardedHost.length > 0 && allowedDomains && allowedDomains.length > 0) {
    const protoForValidation = result.protocol || "https";
    const sanitized = sanitizeHost(forwardedHost);
    if (sanitized) {
      const { hostname, port: portFromHost } = parseHost(sanitized);
      const portForValidation = result.port || portFromHost;
      if (matchesAllowedDomains(hostname, protoForValidation, portForValidation, allowedDomains)) {
        result.host = sanitized;
      }
    }
  }
  return result;
}
class FetchState {
  pipeline;
  /**
   * The request to render. Mutated during rewrites so subsequent renders
   * see the rewritten URL.
   */
  request;
  routeData;
  /**
   * The pathname to use for routing and rendering. Starts out as the raw,
   * base-stripped, decoded pathname from the request. May be further
   * normalized by `AstroHandler` after routeData is known (in dev, when
   * the matched route has no `.html` extension, `.html` / `/index.html`
   * suffixes are stripped).
   */
  pathname;
  /** Resolved render options (addCookieHeader, clientAddress, locals, etc.). */
  renderOptions;
  /** When the request started, used to log duration. */
  timeStart;
  /**
   * The route's loaded component module. Set before middleware runs; may
   * be swapped during in-flight rewrites from inside the middleware chain.
   */
  componentInstance;
  /**
   * Slot overrides supplied by the container API. `undefined` for HTTP
   * requests — `PagesHandler` coalesces to `{}` on read so we don't
   * allocate an empty object per request.
   */
  slots;
  /**
   * The `Response` produced by handlers, if any. Set after page
   * rendering or middleware completes.
   */
  response;
  /**
   * Default HTTP status for the rendered response. Callers override
   * before rendering runs (e.g. `AstroHandler` sets this from
   * `BaseApp.getDefaultStatusCode`; error handlers set `404` / `500`).
   */
  status = 200;
  /** Whether user middleware should be skipped for this request. */
  skipMiddleware = false;
  /**
   * Set to `true` when the request path was encoded too many times to fully
   * decode (see {@link validateAndDecodePathname}). These requests are
   * rejected with a `400` before middleware or routing run.
   */
  invalidEncoding = false;
  /** A flag that tells the render content if the rewriting was triggered. */
  isRewriting = false;
  /** A safety net in case of loops (rewrite counter). */
  counter = 0;
  /** Cookies for this request. Created lazily on first access. */
  cookies;
  /** Route params derived from routeData + pathname. Computed lazily. */
  #params;
  get params() {
    if (!this.#params && this.routeData) {
      this.#params = getParams(this.routeData, this.pathname);
    }
    return this.#params;
  }
  set params(value) {
    this.#params = value;
  }
  /** Normalized URL for this request. */
  url;
  /** Client address for this request. */
  clientAddress;
  /** Whether this is a partial render (container API). */
  partial;
  /** Whether to inject CSP meta tags. */
  shouldInjectCspMetaTags;
  /** Request-scoped locals object, shared with user middleware. */
  locals = {};
  /**
   * Memoized `props` (see `getProps`). `null` means "not yet computed"
   * — using `null` (rather than `undefined`) keeps the hidden class
   * stable and distinct from a valid-but-empty result.
   */
  props = null;
  /** Memoized `ActionAPIContext` (see `getActionAPIContext`). */
  actionApiContext = null;
  /** Memoized `APIContext` (see `getAPIContext`). */
  apiContext = null;
  /** Registered context providers keyed by name. Lazy-initialized on first provide(). */
  #providers;
  /** Cached values from resolved providers. Lazy-initialized on first resolve(). */
  #providersResolvedValues;
  /** Cached promise for lazy component instance loading. */
  #componentInstancePromise;
  /** SSR result for the current page render. */
  result;
  /** Initial props (from container/error handler). */
  initialProps = {};
  /** Rewrites handler instance. Lazy-initialized on first rewrite(). */
  #rewrites;
  /** Memoized Astro page partial. */
  #astroPagePartial;
  /**
   * Locale-prefixed pathname derived from the Host header for domain-based
   * i18n routing (e.g. `/en/boats/1/foo`), or `undefined` when the request
   * isn't served from a locale-mapped domain. When set, `this.pathname` is
   * derived from it so locale/param resolution match the route pattern.
   */
  #domainPathname;
  /** Memoized current locale. */
  #currentLocale;
  /** Memoized preferred locale. */
  #preferredLocale;
  /** Memoized preferred locale list. */
  #preferredLocaleList;
  constructor(pipeline, request, options) {
    this.pipeline = pipeline;
    this.request = request;
    options ??= getRenderOptions(request);
    this.routeData = options?.routeData;
    this.renderOptions = options ?? {
      addCookieHeader: false,
      clientAddress: void 0,
      locals: void 0,
      prerenderedErrorPageFetch: fetch,
      routeData: void 0,
      waitUntil: void 0
    };
    this.componentInstance = void 0;
    this.slots = void 0;
    const url = new URL(request.url);
    const domainPathname = computePathnameFromDomain(
      request,
      url,
      pipeline.manifest.i18n,
      pipeline.manifest.base,
      pipeline.manifest.trailingSlash,
      pipeline.logger
    );
    if (domainPathname) {
      this.#domainPathname = domainPathname;
      try {
        this.pathname = decodeURI(domainPathname);
      } catch {
        this.pathname = domainPathname;
      }
    } else {
      this.pathname = this.#computePathname(url);
    }
    this.timeStart = performance.now();
    this.clientAddress = options?.clientAddress;
    this.locals = options?.locals ?? {};
    this.url = normalizeUrl(url);
    this.cookies = new AstroCookies(request);
    if (pipeline.manifest.allowedDomains && pipeline.manifest.allowedDomains.length > 0) {
      this.#applyForwardedHeaders();
    }
    if (!Reflect.get(this.request, originPathnameSymbol)) {
      setOriginPathname(
        this.request,
        this.pathname,
        pipeline.manifest.trailingSlash,
        pipeline.manifest.buildFormat
      );
    }
    this.#resolveRouteData();
  }
  /**
   * Triggers a rewrite. Delegates to the Rewrites handler.
   */
  rewrite(payload) {
    return (this.#rewrites ??= new Rewrites()).execute(this, payload);
  }
  /**
   * Creates the SSR result for the current page render.
   */
  async createResult(mod, ctx) {
    const pipeline = this.pipeline;
    const { clientDirectives, inlinedScripts, compressHTML, manifest: manifest2, renderers: renderers2, resolve } = pipeline;
    const routeData = this.routeData;
    const { links, scripts, styles } = await pipeline.headElements(routeData);
    const extraStyleHashes = [];
    const extraScriptHashes = [];
    const shouldInjectCspMetaTags = this.shouldInjectCspMetaTags ?? manifest2.shouldInjectCspMetaTags;
    const cspAlgorithm = manifest2.csp?.algorithm ?? "SHA-256";
    if (shouldInjectCspMetaTags) {
      for (const style of styles) {
        extraStyleHashes.push(await generateCspDigest(style.children, cspAlgorithm));
      }
      for (const script of scripts) {
        extraScriptHashes.push(await generateCspDigest(script.children, cspAlgorithm));
      }
    }
    const componentMetadata = await pipeline.componentMetadata(routeData) ?? manifest2.componentMetadata;
    const headers = new Headers({ "Content-Type": "text/html" });
    const partial = typeof this.partial === "boolean" ? this.partial : Boolean(mod.partial);
    const actionResult = hasActionPayload(this.locals) ? deserializeActionResult(this.locals._actionPayload.actionResult) : void 0;
    const status = this.status;
    const response = {
      status: actionResult?.error ? actionResult?.error.status : status,
      statusText: actionResult?.error ? actionResult?.error.type : "OK",
      get headers() {
        return headers;
      },
      set headers(_) {
        throw new AstroError(AstroResponseHeadersReassigned);
      }
    };
    const state = this;
    const result = {
      base: manifest2.base,
      userAssetsBase: manifest2.userAssetsBase,
      cancelled: false,
      clientDirectives,
      inlinedScripts,
      componentMetadata,
      compressHTML,
      cookies: this.cookies,
      createAstro: (props, slots) => state.createAstro(result, props, slots, ctx),
      links,
      // SAFETY: createResult is only called after route resolution, so routeData
      // is always set and the params getter always returns a value.
      params: this.params,
      partial,
      pathname: this.pathname,
      renderers: renderers2,
      resolve,
      response,
      request: this.request,
      scripts,
      styles,
      actionResult,
      async getServerIslandNameMap() {
        const serverIslands = await pipeline.getServerIslands();
        return serverIslands.serverIslandNameMap ?? /* @__PURE__ */ new Map();
      },
      key: manifest2.key,
      trailingSlash: manifest2.trailingSlash,
      _experimentalQueuedRendering: {
        pool: pipeline.nodePool,
        htmlStringCache: pipeline.htmlStringCache,
        enabled: manifest2.experimentalQueuedRendering?.enabled,
        poolSize: manifest2.experimentalQueuedRendering?.poolSize,
        contentCache: manifest2.experimentalQueuedRendering?.contentCache
      },
      _metadata: {
        hasHydrationScript: false,
        rendererSpecificHydrationScripts: /* @__PURE__ */ new Set(),
        hasRenderedHead: false,
        renderedScripts: /* @__PURE__ */ new Set(),
        hasDirectives: /* @__PURE__ */ new Set(),
        hasRenderedServerIslandRuntime: false,
        headInTree: false,
        extraHead: [],
        extraStyleHashes,
        extraScriptHashes,
        propagators: /* @__PURE__ */ new Set(),
        templateDepth: 0
      },
      cspDestination: manifest2.csp?.cspDestination ?? (routeData.prerender ? "meta" : "header"),
      shouldInjectCspMetaTags,
      cspAlgorithm,
      scriptHashes: manifest2.csp?.scriptHashes ? [...manifest2.csp.scriptHashes] : [],
      scriptResources: manifest2.csp?.scriptResources ? [...manifest2.csp.scriptResources] : [],
      styleHashes: manifest2.csp?.styleHashes ? [...manifest2.csp.styleHashes] : [],
      styleResources: manifest2.csp?.styleResources ? [...manifest2.csp.styleResources] : [],
      directives: manifest2.csp?.directives ? [...manifest2.csp.directives] : [],
      isStrictDynamic: manifest2.csp?.isStrictDynamic ?? false,
      internalFetchHeaders: manifest2.internalFetchHeaders
    };
    this.result = result;
    return result;
  }
  /**
   * Creates the Astro global object for a component render.
   */
  createAstro(result, props, slotValues, apiContext) {
    let astroPagePartial;
    if (this.isRewriting) {
      this.#astroPagePartial = this.createAstroPagePartial(result, apiContext);
    }
    this.#astroPagePartial ??= this.createAstroPagePartial(result, apiContext);
    astroPagePartial = this.#astroPagePartial;
    const astroComponentPartial = { props, self: null };
    const Astro = Object.assign(
      Object.create(astroPagePartial),
      astroComponentPartial
    );
    let _slots;
    Object.defineProperty(Astro, "slots", {
      get: () => {
        if (!_slots) {
          _slots = new Slots(
            result,
            slotValues,
            this.pipeline.logger
          );
        }
        return _slots;
      }
    });
    return Astro;
  }
  /**
   * Creates the Astro page-level partial (prototype for Astro global).
   */
  createAstroPagePartial(result, apiContext) {
    const state = this;
    const { cookies, locals, params, pipeline, url } = this;
    const { response } = result;
    const redirect = (path, status = 302) => {
      if (state.request[responseSentSymbol$1]) {
        throw new AstroError({
          ...ResponseSentError
        });
      }
      return new Response(null, { status, headers: { Location: path } });
    };
    const rewrite = async (reroutePayload) => {
      return await state.rewrite(reroutePayload);
    };
    const callAction = createCallAction(apiContext);
    const partial = {
      generator: ASTRO_GENERATOR,
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      cookies,
      get clientAddress() {
        return state.getClientAddress();
      },
      get currentLocale() {
        return state.computeCurrentLocale();
      },
      params,
      get preferredLocale() {
        return state.computePreferredLocale();
      },
      get preferredLocaleList() {
        return state.computePreferredLocaleList();
      },
      locals,
      redirect,
      rewrite,
      request: this.request,
      response,
      site: pipeline.site,
      getActionResult: createGetActionResult(locals),
      get callAction() {
        return callAction;
      },
      url,
      get originPathname() {
        return getOriginPathname(state.request);
      },
      get csp() {
        return state.getCsp();
      },
      get logger() {
        return {
          info(msg) {
            pipeline.logger.info(null, msg);
          },
          warn(msg) {
            pipeline.logger.warn(null, msg);
          },
          error(msg) {
            pipeline.logger.error(null, msg);
          }
        };
      }
    };
    this.defineProviderGetters(partial);
    return partial;
  }
  getClientAddress() {
    const { pipeline, clientAddress } = this;
    const routeData = this.routeData;
    if (routeData.prerender) {
      throw new AstroError({
        ...PrerenderClientAddressNotAvailable,
        message: PrerenderClientAddressNotAvailable.message(routeData.component)
      });
    }
    if (clientAddress) {
      return clientAddress;
    }
    if (pipeline.adapterName) {
      throw new AstroError({
        ...ClientAddressNotAvailable,
        message: ClientAddressNotAvailable.message(pipeline.adapterName)
      });
    }
    throw new AstroError(StaticClientAddressNotAvailable);
  }
  getCookies() {
    return this.cookies;
  }
  getCsp() {
    const state = this;
    const { pipeline } = this;
    if (!pipeline.manifest.csp) {
      if (pipeline.runtimeMode === "production") {
        pipeline.logger.warn(
          "csp",
          `context.csp was used when rendering the route ${s.green(state.routeData.route)}, but CSP was not configured. For more information, see https://docs.astro.build/en/reference/configuration-reference/#securitycsp`
        );
      }
      return void 0;
    }
    return {
      insertDirective(payload) {
        if (state.result) {
          state.result.directives = pushDirective(state.result.directives, payload);
        }
      },
      insertScriptResource(resource) {
        state.result?.scriptResources.push(resource);
      },
      insertStyleResource(resource) {
        state.result?.styleResources.push(resource);
      },
      insertStyleHash(hash) {
        state.result?.styleHashes.push(hash);
      },
      insertScriptHash(hash) {
        state.result?.scriptHashes.push(hash);
      }
    };
  }
  computeCurrentLocale() {
    const {
      url,
      pipeline: { i18n },
      routeData
    } = this;
    if (!i18n || !routeData) return;
    const { defaultLocale, locales, strategy } = i18n;
    const fallbackTo = strategy === "pathname-prefix-other-locales" || strategy === "domains-prefix-other-locales" ? defaultLocale : void 0;
    if (this.#currentLocale) {
      return this.#currentLocale;
    }
    let computedLocale;
    if (isRouteServerIsland(routeData)) {
      let referer = this.request.headers.get("referer");
      if (referer) {
        if (URL.canParse(referer)) {
          referer = new URL(referer).pathname;
        }
        computedLocale = computeCurrentLocale(referer, locales, defaultLocale);
      }
    } else {
      let pathname = routeData.pathname;
      if (this.#domainPathname) {
        pathname = this.pathname;
      } else if (url && !routeData.pattern.test(url.pathname)) {
        for (const fallbackRoute of routeData.fallbackRoutes) {
          if (fallbackRoute.pattern.test(url.pathname)) {
            pathname = fallbackRoute.pathname;
            break;
          }
        }
      }
      pathname = pathname && !isRoute404or500(routeData) ? pathname : url.pathname ?? this.pathname;
      computedLocale = computeCurrentLocale(pathname, locales, defaultLocale);
      if (routeData.params.length > 0) {
        const localeFromParams = computeCurrentLocaleFromParams(this.params, locales);
        if (localeFromParams) {
          computedLocale = localeFromParams;
        }
      }
    }
    this.#currentLocale = computedLocale ?? fallbackTo;
    return this.#currentLocale;
  }
  computePreferredLocale() {
    const {
      pipeline: { i18n },
      request
    } = this;
    if (!i18n) return;
    return this.#preferredLocale ??= computePreferredLocale(request, i18n.locales);
  }
  computePreferredLocaleList() {
    const {
      pipeline: { i18n },
      request
    } = this;
    if (!i18n) return;
    return this.#preferredLocaleList ??= computePreferredLocaleList(request, i18n.locales);
  }
  /**
   * Lazily loads the route's component module. Returns the cached
   * instance if already loaded. The promise is cached so concurrent
   * callers share the same load.
   */
  async loadComponentInstance() {
    if (this.componentInstance) return this.componentInstance;
    if (this.#componentInstancePromise) return this.#componentInstancePromise;
    this.#componentInstancePromise = this.pipeline.getComponentByRoute(this.routeData).then((mod) => {
      this.componentInstance = mod;
      return mod;
    });
    return this.#componentInstancePromise;
  }
  /**
   * Registers a context provider under the given key. Handlers call
   * this to contribute values to the request context (e.g. sessions).
   * The `create` factory is called lazily on the first `resolve(key)`.
   */
  provide(key, provider) {
    (this.#providers ??= /* @__PURE__ */ new Map()).set(key, provider);
  }
  /**
   * Lazily resolves a provider registered under `key`. Calls
   * `provider.create()` on first access and caches the result.
   * Returns `undefined` if no provider was registered for the key.
   */
  resolve(key) {
    if (this.#providersResolvedValues?.has(key)) {
      return this.#providersResolvedValues.get(key);
    }
    const provider = this.#providers?.get(key);
    if (!provider) return void 0;
    const value = provider.create();
    (this.#providersResolvedValues ??= /* @__PURE__ */ new Map()).set(key, value);
    return value;
  }
  /**
   * Runs all registered `finalize` callbacks. Should be called after
   * the response is produced, typically in a `finally` block.
   *
   * Returns synchronously (no promise allocation) when nothing needs
   * finalizing — important for the hot path where sessions are not used.
   */
  finalizeAll() {
    if (!this.#providersResolvedValues || this.#providersResolvedValues.size === 0) return;
    let chain;
    for (const [key, provider] of this.#providers) {
      if (provider.finalize && this.#providersResolvedValues.has(key)) {
        const result = provider.finalize(this.#providersResolvedValues.get(key));
        if (result) {
          chain = chain ? chain.then(() => result) : result;
        }
      }
    }
    return chain;
  }
  /**
   * Adds lazy getters to `target` for each registered provider key.
   * Used by context creation (APIContext, Astro global) so that
   * provider values like `session` and `cache` appear as properties
   * without hard-coding the keys.
   */
  defineProviderGetters(target) {
    if (!this.#providers) return;
    const state = this;
    for (const key of this.#providers.keys()) {
      Object.defineProperty(target, key, {
        get: () => state.resolve(key),
        enumerable: true,
        configurable: true
      });
    }
  }
  /**
   * Resolves the route to use for this request and stores it on
   * `this.routeData`. If the adapter (or the dev server) provided a
   * `routeData` via render options it's already set and this is a
   * no-op. Otherwise we use the app's synchronous route matcher and
   * fall back to a `404.astro` route so middleware can still run.
   *
   * Called eagerly from the constructor so individual handlers
   * (actions, pages, middleware, etc.) always see a resolved route
   * without the caller needing an extra setup step.
   *
   * Once routeData is known, finalizes `this.pathname`: in dev, if the
   * matched route has no `.html` extension, strip `.html` / `/index.html`
   * suffixes so the rendering pipeline sees the canonical pathname.
   */
  /**
   * Strip `.html` / `/index.html` suffixes from the pathname so the
   * rendering pipeline sees the canonical route path. Only applies to
   * page routes where `.html` is framework-injected. Endpoint routes
   * preserve `.html` because any such suffix is user-provided (e.g.
   * from `getStaticPaths` params). Skipped when the matched route
   * itself has an `.html` extension in its definition.
   */
  #stripHtmlExtension() {
    if (this.routeData && this.routeData.type === "page" && !routeHasHtmlExtension(this.routeData)) {
      this.pathname = this.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    }
  }
  #resolveRouteData() {
    const pipeline = this.pipeline;
    if (this.routeData) {
      this.#stripHtmlExtension();
      return;
    }
    const matched = pipeline.matchRoute(this.pathname);
    if (matched && matched.prerender && pipeline.manifest.serverLike) {
      if (matched.params.length > 0) {
        const allMatches = pipeline.matchAllRoutes(this.pathname);
        this.routeData = allMatches.find((r) => !r.prerender);
      } else {
        this.routeData = void 0;
      }
    } else {
      this.routeData = matched;
    }
    pipeline.logger.debug("router", "Astro matched the following route for " + this.request.url);
    pipeline.logger.debug("router", "RouteData:\n" + this.routeData);
    if (!this.routeData) {
      const custom404 = getCustom404Route(pipeline.manifestData);
      if (custom404 && !custom404.prerender) {
        this.routeData = custom404;
      }
    }
    if (!this.routeData) {
      pipeline.logger.debug("router", "Astro hasn't found routes that match " + this.request.url);
      pipeline.logger.debug("router", "Here's the available routes:\n", pipeline.manifestData);
      return;
    }
    this.#stripHtmlExtension();
  }
  /**
   * Strips the pipeline's base from the request URL, prepends a forward
   * slash, and decodes the pathname. Falls back to the raw (not decoded)
   * pathname if `decodeURI` throws.
   *
   * Mirrors `BaseApp.removeBase`, including the
   * `collapseDuplicateLeadingSlashes` fix that prevents middleware
   * authorization bypass when the URL starts with `//`.
   */
  #computePathname(url) {
    let pathname = collapseDuplicateLeadingSlashes(url.pathname);
    const base = this.pipeline.manifest.base;
    if (pathname.startsWith(base)) {
      const baseWithoutTrailingSlash = removeTrailingForwardSlash(base);
      pathname = pathname.slice(baseWithoutTrailingSlash.length + 1);
    }
    pathname = prependForwardSlash(pathname);
    try {
      return validateAndDecodePathname(pathname);
    } catch (e) {
      if (e instanceof MultiLevelEncodingError) {
        this.invalidEncoding = true;
        return pathname;
      }
      this.pipeline.logger.error(null, e.toString());
      return pathname;
    }
  }
  /**
   * Reads X-Forwarded-Proto, X-Forwarded-Host, and X-Forwarded-Port
   * from the request headers, validates them against the manifest's
   * `allowedDomains`, and updates `this.url` accordingly. Also resolves
   * `clientAddress` from X-Forwarded-For when the host is trusted.
   *
   * Only called when `allowedDomains` is configured — without it,
   * forwarded headers are never trusted.
   */
  #applyForwardedHeaders() {
    const headers = this.request.headers;
    const allowedDomains = this.pipeline.manifest.allowedDomains;
    const validated = validateForwardedHeaders(
      getFirstForwardedValue$1(headers.get("x-forwarded-proto") ?? void 0),
      getFirstForwardedValue$1(headers.get("x-forwarded-host") ?? void 0),
      getFirstForwardedValue$1(headers.get("x-forwarded-port") ?? void 0),
      allowedDomains
    );
    if (!validated.protocol && !validated.host && !validated.port) return;
    if (validated.protocol) {
      this.url.protocol = validated.protocol + ":";
    }
    if (validated.host) {
      const colonIdx = validated.host.indexOf(":");
      if (colonIdx !== -1) {
        this.url.hostname = validated.host.slice(0, colonIdx);
        this.url.port = validated.host.slice(colonIdx + 1);
      } else {
        this.url.hostname = validated.host;
        this.url.port = "";
      }
    }
    if (validated.port) {
      this.url.port = validated.port;
    }
    const hostTrusted = validated.host !== void 0;
    if (hostTrusted && !this.clientAddress) {
      const forwardedFor = getFirstForwardedValue$1(
        this.request.headers.get("x-forwarded-for") ?? void 0
      );
      if (forwardedFor) {
        this.clientAddress = forwardedFor;
      }
    }
    const oldRequest = this.request;
    this.request = new Request(this.url, oldRequest);
    const app2 = Reflect.get(oldRequest, appSymbol);
    if (app2 !== void 0) {
      Reflect.set(this.request, appSymbol, app2);
    }
  }
  /**
   * Returns the resolved `props` for this render, computing them lazily
   * from the route + component module on first access. If the
   * `initialProps` already carries user-supplied props (e.g. the
   * container API) those are used verbatim.
   */
  async getProps() {
    if (this.props !== null) return this.props;
    if (Object.keys(this.initialProps).length > 0) {
      this.props = this.initialProps;
      return this.props;
    }
    const pipeline = this.pipeline;
    const mod = await this.loadComponentInstance();
    this.props = await getProps({
      mod,
      routeData: this.routeData,
      routeCache: pipeline.routeCache,
      pathname: this.pathname,
      logger: pipeline.logger,
      serverLike: pipeline.manifest.serverLike,
      base: pipeline.manifest.base,
      trailingSlash: pipeline.manifest.trailingSlash
    });
    return this.props;
  }
  /**
   * Returns the `ActionAPIContext` for this render, creating it lazily.
   * Used by middleware, actions, and page dispatch.
   */
  getActionAPIContext() {
    if (this.actionApiContext !== null) return this.actionApiContext;
    const state = this;
    const ctx = {
      get cookies() {
        return state.cookies;
      },
      routePattern: this.routeData.route,
      isPrerendered: this.routeData.prerender,
      get clientAddress() {
        return state.getClientAddress();
      },
      get currentLocale() {
        return state.computeCurrentLocale();
      },
      generator: ASTRO_GENERATOR,
      get locals() {
        return state.locals;
      },
      set locals(_) {
        throw new AstroError(LocalsReassigned);
      },
      // SAFETY: getActionAPIContext is only called after route resolution,
      // so routeData is always set and the params getter always returns a value.
      params: this.params,
      get preferredLocale() {
        return state.computePreferredLocale();
      },
      get preferredLocaleList() {
        return state.computePreferredLocaleList();
      },
      request: this.request,
      site: this.pipeline.site,
      url: this.url,
      get originPathname() {
        return getOriginPathname(state.request);
      },
      get csp() {
        return state.getCsp();
      },
      get logger() {
        if (!state.pipeline.manifest.experimentalLogger) {
          state.pipeline.logger.warn(
            null,
            "The Astro.logger is available only when experimental.logger is defined."
          );
          return void 0;
        }
        return {
          info(msg) {
            state.pipeline.logger.info(null, msg);
          },
          warn(msg) {
            state.pipeline.logger.warn(null, msg);
          },
          error(msg) {
            state.pipeline.logger.error(null, msg);
          }
        };
      }
    };
    this.defineProviderGetters(ctx);
    this.actionApiContext = ctx;
    return this.actionApiContext;
  }
  /**
   * Returns the `APIContext` for this render, creating it lazily from
   * the memoized props + action context.
   *
   * Callers must ensure `getProps()` has resolved at least once before
   * calling this.
   */
  getAPIContext() {
    if (this.apiContext !== null) return this.apiContext;
    const actionApiContext = this.getActionAPIContext();
    const state = this;
    const redirect = (path, status = 302) => new Response(null, { status, headers: { Location: path } });
    const rewrite = async (reroutePayload) => {
      return await state.rewrite(reroutePayload);
    };
    Reflect.set(actionApiContext, pipelineSymbol, this.pipeline);
    actionApiContext[fetchStateSymbol] = this;
    this.apiContext = Object.assign(actionApiContext, {
      props: this.props,
      redirect,
      rewrite,
      getActionResult: createGetActionResult(actionApiContext.locals),
      callAction: createCallAction(actionApiContext)
    });
    return this.apiContext;
  }
  /**
   * Invalidates the cached `APIContext` so the next `getAPIContext()`
   * call re-derives it from the (possibly mutated) state. Used
   * after an in-flight rewrite swaps the route / request / params.
   */
  invalidateContexts() {
    this.props = null;
    this.actionApiContext = null;
    this.apiContext = null;
  }
}
class ActionHandler {
  /**
   * Run action handling for the current request. Expects the APIContext
   * that is already being used by the render pipeline.
   *
   * Returns a `Response` when the action fully handles the request (RPC),
   * or `undefined` when the caller should continue processing the
   * request (form actions or non-action requests).
   */
  handle(apiContext, state) {
    state.pipeline.usedFeatures |= PipelineFeatures.actions;
    if (apiContext.isPrerendered) {
      return void 0;
    }
    const { action, setActionResult } = getActionContext(apiContext);
    if (!action) {
      return void 0;
    }
    return this.#executeAction(action, setActionResult);
  }
  async #executeAction(action, setActionResult) {
    const actionResult = await action.handler();
    const serialized = serializeActionResult(actionResult);
    if (action.calledFrom === "rpc") {
      if (serialized.type === "empty") {
        return new Response(null, {
          status: serialized.status
        });
      }
      return new Response(serialized.body, {
        status: serialized.status,
        headers: {
          "Content-Type": serialized.contentType
        }
      });
    }
    setActionResult(action.name, serialized);
    return void 0;
  }
}
function prepareResponse(response, { addCookieHeader }) {
  for (const headerName of INTERNAL_RESPONSE_HEADERS) {
    if (response.headers.has(headerName)) {
      response.headers.delete(headerName);
    }
  }
  if (addCookieHeader) {
    for (const setCookieHeaderValue of getSetCookiesFromResponse(response)) {
      response.headers.append("set-cookie", setCookieHeaderValue);
    }
  }
  Reflect.set(response, responseSentSymbol$1, true);
}
function redirectTemplate({
  status,
  absoluteLocation,
  relativeLocation,
  from
}) {
  const delay = status === 302 ? 2 : 0;
  const rel = escape(String(relativeLocation));
  const abs = escape(String(absoluteLocation));
  const fromHtml = from ? `from <code>${escape(from)}</code> ` : "";
  return `<!doctype html>
<title>Redirecting to: ${rel}</title>
<meta http-equiv="refresh" content="${delay};url=${rel}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${abs}">
<body>
	<a href="${rel}">Redirecting ${fromHtml}to <code>${rel}</code></a>
</body>`;
}
class TrailingSlashHandler {
  #app;
  constructor(app2) {
    this.#app = app2;
  }
  /**
   * Returns a redirect `Response` if the request pathname needs
   * normalization, or `undefined` if no redirect is required.
   */
  handle(state) {
    const url = new URL(state.request.url);
    const redirect = this.#redirectTrailingSlash(url.pathname);
    if (redirect === url.pathname) {
      return void 0;
    }
    const addCookieHeader = state.renderOptions.addCookieHeader;
    const status = state.request.method === "GET" ? 301 : 308;
    const response = new Response(
      redirectTemplate({
        status,
        relativeLocation: url.pathname,
        absoluteLocation: redirect,
        from: state.request.url
      }),
      {
        status,
        headers: {
          location: redirect + url.search
        }
      }
    );
    prepareResponse(response, { addCookieHeader });
    return response;
  }
  #redirectTrailingSlash(pathname) {
    const { trailingSlash } = this.#app.manifest;
    if (pathname === "/" || isInternalPath(pathname)) {
      return pathname;
    }
    const path = collapseDuplicateTrailingSlashes(pathname, trailingSlash !== "never");
    if (path !== pathname) {
      return path;
    }
    if (trailingSlash === "ignore") {
      return pathname;
    }
    if (trailingSlash === "always" && !hasFileExtension(pathname)) {
      return appendForwardSlash(pathname);
    }
    if (trailingSlash === "never") {
      return removeTrailingForwardSlash(pathname);
    }
    return pathname;
  }
}
function defaultSetHeaders(options) {
  const headers = new Headers();
  const directives = [];
  if (options.maxAge !== void 0) {
    directives.push(`max-age=${options.maxAge}`);
  }
  if (options.swr !== void 0) {
    directives.push(`stale-while-revalidate=${options.swr}`);
  }
  if (directives.length > 0) {
    headers.set("CDN-Cache-Control", directives.join(", "));
  }
  if (options.tags && options.tags.length > 0) {
    headers.set("Cache-Tag", options.tags.join(", "));
  }
  if (options.lastModified) {
    headers.set("Last-Modified", options.lastModified.toUTCString());
  }
  if (options.etag) {
    headers.set("ETag", options.etag);
  }
  return headers;
}
function isLiveDataEntry(value) {
  return value != null && typeof value === "object" && "id" in value && "data" in value && "cacheHint" in value;
}
const APPLY_HEADERS = /* @__PURE__ */ Symbol.for("astro:cache:apply");
const IS_ACTIVE = /* @__PURE__ */ Symbol.for("astro:cache:active");
class AstroCache {
  #options = {};
  #tags = /* @__PURE__ */ new Set();
  #disabled = false;
  #provider;
  enabled = true;
  constructor(provider) {
    this.#provider = provider;
  }
  set(input) {
    if (input === false) {
      this.#disabled = true;
      this.#tags.clear();
      this.#options = {};
      return;
    }
    this.#disabled = false;
    let options;
    if (isLiveDataEntry(input)) {
      if (!input.cacheHint) return;
      options = input.cacheHint;
    } else {
      options = input;
    }
    if ("maxAge" in options && options.maxAge !== void 0) this.#options.maxAge = options.maxAge;
    if ("swr" in options && options.swr !== void 0)
      this.#options.swr = options.swr;
    if ("etag" in options && options.etag !== void 0)
      this.#options.etag = options.etag;
    if (options.lastModified !== void 0) {
      if (!this.#options.lastModified || options.lastModified > this.#options.lastModified) {
        this.#options.lastModified = options.lastModified;
      }
    }
    if (options.tags) {
      for (const tag of options.tags) this.#tags.add(tag);
    }
  }
  get tags() {
    return [...this.#tags];
  }
  /**
   * Get the current cache options (read-only snapshot).
   * Includes all accumulated options: maxAge, swr, tags, etag, lastModified.
   */
  get options() {
    return {
      ...this.#options,
      tags: this.tags
    };
  }
  async invalidate(input) {
    if (!this.#provider) {
      throw new AstroError(CacheNotEnabled);
    }
    let options;
    if (isLiveDataEntry(input)) {
      options = { tags: input.cacheHint?.tags ?? [] };
    } else {
      options = input;
    }
    return this.#provider.invalidate(options);
  }
  /** @internal */
  [APPLY_HEADERS](response) {
    if (this.#disabled) return;
    const finalOptions = { ...this.#options, tags: this.tags };
    if (finalOptions.maxAge === void 0 && !finalOptions.tags?.length) return;
    const headers = this.#provider?.setHeaders?.(finalOptions) ?? defaultSetHeaders(finalOptions);
    for (const [key, value] of headers) {
      response.headers.set(key, value);
    }
  }
  /** @internal */
  get [IS_ACTIVE]() {
    return !this.#disabled && (this.#options.maxAge !== void 0 || this.#tags.size > 0);
  }
}
function applyCacheHeaders(cache, response) {
  if (APPLY_HEADERS in cache) {
    cache[APPLY_HEADERS](response);
  }
}
const ROUTE_DYNAMIC_SPLIT = /\[(.+?\(.+?\)|.+?)\]/;
const ROUTE_SPREAD = /^\.{3}.+$/;
function getParts(part, file) {
  const result = [];
  part.split(ROUTE_DYNAMIC_SPLIT).map((str, i) => {
    if (!str) return;
    const dynamic = i % 2 === 1;
    const [, content] = dynamic ? /([^(]+)$/.exec(str) || [null, null] : [null, str];
    if (!content || dynamic && !/^(?:\.\.\.)?[\w$]+$/.test(content)) {
      throw new Error(`Invalid route ${file} — parameter name must match /^[a-zA-Z0-9_$]+$/`);
    }
    result.push({
      content,
      dynamic,
      spread: dynamic && ROUTE_SPREAD.test(content)
    });
  });
  return result;
}
function compileCacheRoutes(routes, base, trailingSlash) {
  const compiled = Object.entries(routes).map(([path, options]) => {
    const segments = removeLeadingForwardSlash(path).split("/").filter(Boolean).map((s2) => getParts(s2, path));
    const pattern = getPattern(segments, base, trailingSlash);
    return { pattern, options, segments, route: path };
  });
  compiled.sort(
    (a, b) => routeComparator(
      { segments: a.segments, route: a.route, type: "page" },
      { segments: b.segments, route: b.route, type: "page" }
    )
  );
  return compiled;
}
function matchCacheRoute(pathname, compiledRoutes) {
  for (const route of compiledRoutes) {
    if (route.pattern.test(pathname)) return route.options;
  }
  return null;
}
const CACHE_KEY = "cache";
function provideCache(state) {
  const pipeline = state.pipeline;
  if (!pipeline.cacheConfig) {
    state.provide(CACHE_KEY, {
      create: () => new DisabledAstroCache(pipeline.logger)
    });
    return;
  }
  if (pipeline.runtimeMode === "development") {
    state.provide(CACHE_KEY, {
      create: () => new NoopAstroCache()
    });
    return;
  }
  return provideCacheAsync(state, pipeline);
}
async function provideCacheAsync(state, pipeline) {
  const cacheProvider = await pipeline.getCacheProvider();
  state.provide(CACHE_KEY, {
    create() {
      const cache = new AstroCache(cacheProvider);
      if (pipeline.cacheConfig?.routes) {
        if (!pipeline.compiledCacheRoutes) {
          pipeline.compiledCacheRoutes = compileCacheRoutes(
            pipeline.cacheConfig.routes,
            pipeline.manifest.base,
            pipeline.manifest.trailingSlash
          );
        }
        const matched = matchCacheRoute(state.pathname, pipeline.compiledCacheRoutes);
        if (matched) {
          cache.set(matched);
        }
      }
      return cache;
    }
  });
}
class CacheHandler {
  #app;
  constructor(app2) {
    this.#app = app2;
  }
  async handle(state, next) {
    this.#app.pipeline.usedFeatures |= PipelineFeatures.cache;
    if (!this.#app.pipeline.cacheProvider) {
      return next();
    }
    const cache = state.resolve(CACHE_KEY);
    const cacheProvider = await this.#app.pipeline.getCacheProvider();
    if (cacheProvider?.onRequest) {
      const response2 = await cacheProvider.onRequest(
        {
          request: state.request,
          url: new URL(state.request.url),
          waitUntil: state.renderOptions.waitUntil
        },
        async () => {
          const res = await next();
          applyCacheHeaders(cache, res);
          return res;
        }
      );
      response2.headers.delete("CDN-Cache-Control");
      response2.headers.delete("Cache-Tag");
      return response2;
    }
    const response = await next();
    applyCacheHeaders(cache, response);
    return response;
  }
}
function isExternalURL(url) {
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}
function redirectIsExternal(redirect) {
  if (typeof redirect === "string") {
    return isExternalURL(redirect);
  } else {
    return isExternalURL(redirect.destination);
  }
}
function computeRedirectStatus(method, redirect, redirectRoute) {
  return redirectRoute && typeof redirect === "object" ? redirect.status : method === "GET" ? 301 : 308;
}
function resolveRedirectTarget(params, redirect, redirectRoute, trailingSlash) {
  if (typeof redirectRoute !== "undefined") {
    const generate = getRouteGenerator(redirectRoute.segments, trailingSlash);
    return generate(params);
  } else if (typeof redirect === "string") {
    if (redirectIsExternal(redirect)) {
      return redirect;
    } else {
      let target = redirect;
      for (const param of Object.keys(params)) {
        const paramValue = params[param];
        target = target.replace(`[${param}]`, paramValue).replace(`[...${param}]`, paramValue);
      }
      return target;
    }
  } else if (typeof redirect === "undefined") {
    return "/";
  }
  return redirect.destination;
}
async function renderRedirect(state) {
  state.pipeline.usedFeatures |= PipelineFeatures.redirects;
  const routeData = state.routeData;
  const { redirect, redirectRoute } = routeData;
  const status = computeRedirectStatus(state.request.method, redirect, redirectRoute);
  const headers = {
    location: encodeURI(
      resolveRedirectTarget(
        state.params,
        redirect,
        redirectRoute,
        state.pipeline.manifest.trailingSlash
      )
    )
  };
  if (redirect && redirectIsExternal(redirect)) {
    if (typeof redirect === "string") {
      return Response.redirect(redirect, status);
    } else {
      return Response.redirect(redirect.destination, status);
    }
  }
  return new Response(null, { status, headers });
}
const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error2) {
    if (options.strict) {
      throw error2;
    }
    return value;
  }
}
function wrapToPromise(value) {
  if (!value || typeof value.then !== "function") {
    return Promise.resolve(value);
  }
  return value;
}
function asyncCall(function_, ...arguments_) {
  try {
    return wrapToPromise(function_(...arguments_));
  } catch (error2) {
    return Promise.reject(error2);
  }
}
function isPrimitive(value) {
  const type = typeof value;
  return value === null || type !== "object" && type !== "function";
}
function isPureObject(value) {
  const proto = Object.getPrototypeOf(value);
  return !proto || proto.isPrototypeOf(Object);
}
function stringify$1(value) {
  if (isPrimitive(value)) {
    return String(value);
  }
  if (isPureObject(value) || Array.isArray(value)) {
    return JSON.stringify(value);
  }
  if (typeof value.toJSON === "function") {
    return stringify$1(value.toJSON());
  }
  throw new Error("[unstorage] Cannot stringify value!");
}
const BASE64_PREFIX = "base64:";
function serializeRaw(value) {
  if (typeof value === "string") {
    return value;
  }
  return BASE64_PREFIX + base64Encode(value);
}
function deserializeRaw(value) {
  if (typeof value !== "string") {
    return value;
  }
  if (!value.startsWith(BASE64_PREFIX)) {
    return value;
  }
  return base64Decode(value.slice(BASE64_PREFIX.length));
}
function base64Decode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input, "base64");
  }
  return Uint8Array.from(
    globalThis.atob(input),
    (c) => c.codePointAt(0)
  );
}
function base64Encode(input) {
  if (globalThis.Buffer) {
    return Buffer.from(input).toString("base64");
  }
  return globalThis.btoa(String.fromCodePoint(...input));
}
function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.split("?")[0]?.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "") || "";
}
function joinKeys(...keys) {
  return normalizeKey(keys.join(":"));
}
function normalizeBaseKey(base) {
  base = normalizeKey(base);
  return base ? base + ":" : "";
}
function filterKeyByDepth(key, depth) {
  if (depth === void 0) {
    return true;
  }
  let substrCount = 0;
  let index = key.indexOf(":");
  while (index > -1) {
    substrCount++;
    index = key.indexOf(":", index + 1);
  }
  return substrCount <= depth;
}
function filterKeyByBase(key, base) {
  if (base) {
    return key.startsWith(base) && key[key.length - 1] !== "$";
  }
  return key[key.length - 1] !== "$";
}
function defineDriver(factory) {
  return factory;
}
const DRIVER_NAME = "memory";
const memory = defineDriver(() => {
  const data = /* @__PURE__ */ new Map();
  return {
    name: DRIVER_NAME,
    getInstance: () => data,
    hasItem(key) {
      return data.has(key);
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    getItemRaw(key) {
      return data.get(key) ?? null;
    },
    setItem(key, value) {
      data.set(key, value);
    },
    setItemRaw(key, value) {
      data.set(key, value);
    },
    removeItem(key) {
      data.delete(key);
    },
    getKeys() {
      return [...data.keys()];
    },
    clear() {
      data.clear();
    },
    dispose() {
      data.clear();
    }
  };
});
function createStorage(options = {}) {
  const context = {
    mounts: { "": options.driver || memory() },
    mountpoints: [""],
    watching: false,
    watchListeners: [],
    unwatch: {}
  };
  const getMount = (key) => {
    for (const base of context.mountpoints) {
      if (key.startsWith(base)) {
        return {
          base,
          relativeKey: key.slice(base.length),
          driver: context.mounts[base]
        };
      }
    }
    return {
      base: "",
      relativeKey: key,
      driver: context.mounts[""]
    };
  };
  const getMounts = (base, includeParent) => {
    return context.mountpoints.filter(
      (mountpoint) => mountpoint.startsWith(base) || includeParent && base.startsWith(mountpoint)
    ).map((mountpoint) => ({
      relativeBase: base.length > mountpoint.length ? base.slice(mountpoint.length) : void 0,
      mountpoint,
      driver: context.mounts[mountpoint]
    }));
  };
  const onChange = (event, key) => {
    if (!context.watching) {
      return;
    }
    key = normalizeKey(key);
    for (const listener of context.watchListeners) {
      listener(event, key);
    }
  };
  const startWatch = async () => {
    if (context.watching) {
      return;
    }
    context.watching = true;
    for (const mountpoint in context.mounts) {
      context.unwatch[mountpoint] = await watch(
        context.mounts[mountpoint],
        onChange,
        mountpoint
      );
    }
  };
  const stopWatch = async () => {
    if (!context.watching) {
      return;
    }
    for (const mountpoint in context.unwatch) {
      await context.unwatch[mountpoint]();
    }
    context.unwatch = {};
    context.watching = false;
  };
  const runBatch = (items, commonOptions, cb) => {
    const batches = /* @__PURE__ */ new Map();
    const getBatch = (mount) => {
      let batch = batches.get(mount.base);
      if (!batch) {
        batch = {
          driver: mount.driver,
          base: mount.base,
          items: []
        };
        batches.set(mount.base, batch);
      }
      return batch;
    };
    for (const item of items) {
      const isStringItem = typeof item === "string";
      const key = normalizeKey(isStringItem ? item : item.key);
      const value = isStringItem ? void 0 : item.value;
      const options2 = isStringItem || !item.options ? commonOptions : { ...commonOptions, ...item.options };
      const mount = getMount(key);
      getBatch(mount).items.push({
        key,
        value,
        relativeKey: mount.relativeKey,
        options: options2
      });
    }
    return Promise.all([...batches.values()].map((batch) => cb(batch))).then(
      (r) => r.flat()
    );
  };
  const storage = {
    // Item
    hasItem(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.hasItem, relativeKey, opts);
    },
    getItem(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => destr(value)
      );
    },
    getItems(items, commonOptions = {}) {
      return runBatch(items, commonOptions, (batch) => {
        if (batch.driver.getItems) {
          return asyncCall(
            batch.driver.getItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              options: item.options
            })),
            commonOptions
          ).then(
            (r) => r.map((item) => ({
              key: joinKeys(batch.base, item.key),
              value: destr(item.value)
            }))
          );
        }
        return Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.getItem,
              item.relativeKey,
              item.options
            ).then((value) => ({
              key: item.key,
              value: destr(value)
            }));
          })
        );
      });
    },
    getItemRaw(key, opts = {}) {
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.getItemRaw) {
        return asyncCall(driver.getItemRaw, relativeKey, opts);
      }
      return asyncCall(driver.getItem, relativeKey, opts).then(
        (value) => deserializeRaw(value)
      );
    },
    async setItem(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key);
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.setItem) {
        return;
      }
      await asyncCall(driver.setItem, relativeKey, stringify$1(value), opts);
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async setItems(items, commonOptions) {
      await runBatch(items, commonOptions, async (batch) => {
        if (batch.driver.setItems) {
          return asyncCall(
            batch.driver.setItems,
            batch.items.map((item) => ({
              key: item.relativeKey,
              value: stringify$1(item.value),
              options: item.options
            })),
            commonOptions
          );
        }
        if (!batch.driver.setItem) {
          return;
        }
        await Promise.all(
          batch.items.map((item) => {
            return asyncCall(
              batch.driver.setItem,
              item.relativeKey,
              stringify$1(item.value),
              item.options
            );
          })
        );
      });
    },
    async setItemRaw(key, value, opts = {}) {
      if (value === void 0) {
        return storage.removeItem(key, opts);
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (driver.setItemRaw) {
        await asyncCall(driver.setItemRaw, relativeKey, value, opts);
      } else if (driver.setItem) {
        await asyncCall(driver.setItem, relativeKey, serializeRaw(value), opts);
      } else {
        return;
      }
      if (!driver.watch) {
        onChange("update", key);
      }
    },
    async removeItem(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { removeMeta: opts };
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      if (!driver.removeItem) {
        return;
      }
      await asyncCall(driver.removeItem, relativeKey, opts);
      if (opts.removeMeta || opts.removeMata) {
        await asyncCall(driver.removeItem, relativeKey + "$", opts);
      }
      if (!driver.watch) {
        onChange("remove", key);
      }
    },
    // Meta
    async getMeta(key, opts = {}) {
      if (typeof opts === "boolean") {
        opts = { nativeOnly: opts };
      }
      key = normalizeKey(key);
      const { relativeKey, driver } = getMount(key);
      const meta = /* @__PURE__ */ Object.create(null);
      if (driver.getMeta) {
        Object.assign(meta, await asyncCall(driver.getMeta, relativeKey, opts));
      }
      if (!opts.nativeOnly) {
        const value = await asyncCall(
          driver.getItem,
          relativeKey + "$",
          opts
        ).then((value_) => destr(value_));
        if (value && typeof value === "object") {
          if (typeof value.atime === "string") {
            value.atime = new Date(value.atime);
          }
          if (typeof value.mtime === "string") {
            value.mtime = new Date(value.mtime);
          }
          Object.assign(meta, value);
        }
      }
      return meta;
    },
    setMeta(key, value, opts = {}) {
      return this.setItem(key + "$", value, opts);
    },
    removeMeta(key, opts = {}) {
      return this.removeItem(key + "$", opts);
    },
    // Keys
    async getKeys(base, opts = {}) {
      base = normalizeBaseKey(base);
      const mounts = getMounts(base, true);
      let maskedMounts = [];
      const allKeys = [];
      let allMountsSupportMaxDepth = true;
      for (const mount of mounts) {
        if (!mount.driver.flags?.maxDepth) {
          allMountsSupportMaxDepth = false;
        }
        const rawKeys = await asyncCall(
          mount.driver.getKeys,
          mount.relativeBase,
          opts
        );
        for (const key of rawKeys) {
          const fullKey = mount.mountpoint + normalizeKey(key);
          if (!maskedMounts.some((p) => fullKey.startsWith(p))) {
            allKeys.push(fullKey);
          }
        }
        maskedMounts = [
          mount.mountpoint,
          ...maskedMounts.filter((p) => !p.startsWith(mount.mountpoint))
        ];
      }
      const shouldFilterByDepth = opts.maxDepth !== void 0 && !allMountsSupportMaxDepth;
      return allKeys.filter(
        (key) => (!shouldFilterByDepth || filterKeyByDepth(key, opts.maxDepth)) && filterKeyByBase(key, base)
      );
    },
    // Utils
    async clear(base, opts = {}) {
      base = normalizeBaseKey(base);
      await Promise.all(
        getMounts(base, false).map(async (m) => {
          if (m.driver.clear) {
            return asyncCall(m.driver.clear, m.relativeBase, opts);
          }
          if (m.driver.removeItem) {
            const keys = await m.driver.getKeys(m.relativeBase || "", opts);
            return Promise.all(
              keys.map((key) => m.driver.removeItem(key, opts))
            );
          }
        })
      );
    },
    async dispose() {
      await Promise.all(
        Object.values(context.mounts).map((driver) => dispose(driver))
      );
    },
    async watch(callback) {
      await startWatch();
      context.watchListeners.push(callback);
      return async () => {
        context.watchListeners = context.watchListeners.filter(
          (listener) => listener !== callback
        );
        if (context.watchListeners.length === 0) {
          await stopWatch();
        }
      };
    },
    async unwatch() {
      context.watchListeners = [];
      await stopWatch();
    },
    // Mount
    mount(base, driver) {
      base = normalizeBaseKey(base);
      if (base && context.mounts[base]) {
        throw new Error(`already mounted at ${base}`);
      }
      if (base) {
        context.mountpoints.push(base);
        context.mountpoints.sort((a, b) => b.length - a.length);
      }
      context.mounts[base] = driver;
      if (context.watching) {
        Promise.resolve(watch(driver, onChange, base)).then((unwatcher) => {
          context.unwatch[base] = unwatcher;
        }).catch(console.error);
      }
      return storage;
    },
    async unmount(base, _dispose = true) {
      base = normalizeBaseKey(base);
      if (!base || !context.mounts[base]) {
        return;
      }
      if (context.watching && base in context.unwatch) {
        context.unwatch[base]?.();
        delete context.unwatch[base];
      }
      if (_dispose) {
        await dispose(context.mounts[base]);
      }
      context.mountpoints = context.mountpoints.filter((key) => key !== base);
      delete context.mounts[base];
    },
    getMount(key = "") {
      key = normalizeKey(key) + ":";
      const m = getMount(key);
      return {
        driver: m.driver,
        base: m.base
      };
    },
    getMounts(base = "", opts = {}) {
      base = normalizeKey(base);
      const mounts = getMounts(base, opts.parents);
      return mounts.map((m) => ({
        driver: m.driver,
        base: m.mountpoint
      }));
    },
    // Aliases
    keys: (base, opts = {}) => storage.getKeys(base, opts),
    get: (key, opts = {}) => storage.getItem(key, opts),
    set: (key, value, opts = {}) => storage.setItem(key, value, opts),
    has: (key, opts = {}) => storage.hasItem(key, opts),
    del: (key, opts = {}) => storage.removeItem(key, opts),
    remove: (key, opts = {}) => storage.removeItem(key, opts)
  };
  return storage;
}
function watch(driver, onChange, base) {
  return driver.watch ? driver.watch((event, key) => onChange(event, base + key)) : () => {
  };
}
async function dispose(driver) {
  if (typeof driver.dispose === "function") {
    await asyncCall(driver.dispose);
  }
}
const PERSIST_SYMBOL = /* @__PURE__ */ Symbol();
const DEFAULT_COOKIE_NAME = "astro-session";
const VALID_COOKIE_REGEX = /^[\w-]+$/;
const unflatten = (parsed, _) => {
  return unflatten$1(parsed, {
    URL: (href) => new URL(href)
  });
};
const stringify = (data, _) => {
  return stringify$2(data, {
    // Support URL objects
    URL: (val) => val instanceof URL && val.href
  });
};
class AstroSession {
  // The cookies object.
  #cookies;
  // The session configuration.
  #config;
  // The cookie config
  #cookieConfig;
  // The cookie name
  #cookieName;
  // The unstorage object for the session driver.
  #storage;
  #data;
  // The session ID. A v4 UUID.
  #sessionID;
  // Sessions to destroy. Needed because we won't have the old session ID after it's destroyed locally.
  #toDestroy = /* @__PURE__ */ new Set();
  // Session keys to delete. Used for partial data sets to avoid overwriting the deleted value.
  #toDelete = /* @__PURE__ */ new Set();
  // Whether the session is dirty and needs to be saved.
  #dirty = false;
  // Whether the session cookie has been set.
  #cookieSet = false;
  // Whether the session ID was sourced from a client cookie rather than freshly generated.
  #sessionIDFromCookie = false;
  // The local data is "partial" if it has not been loaded from storage yet and only
  // contains values that have been set or deleted in-memory locally.
  // We do this to avoid the need to block on loading data when it is only being set.
  // When we load the data from storage, we need to merge it with the local partial data,
  // preserving in-memory changes and deletions.
  #partial = true;
  // The driver factory function provided by the pipeline
  #driverFactory;
  static #sharedStorage = /* @__PURE__ */ new Map();
  constructor({
    cookies,
    config: config2,
    runtimeMode,
    driverFactory,
    mockStorage
  }) {
    if (!config2) {
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "No driver was defined in the session configuration and the adapter did not provide a default driver."
        )
      });
    }
    this.#cookies = cookies;
    this.#driverFactory = driverFactory;
    const { cookie: cookieConfig = DEFAULT_COOKIE_NAME, ...configRest } = config2;
    let cookieConfigObject;
    if (typeof cookieConfig === "object") {
      const { name = DEFAULT_COOKIE_NAME, ...rest } = cookieConfig;
      this.#cookieName = name;
      cookieConfigObject = rest;
    } else {
      this.#cookieName = cookieConfig || DEFAULT_COOKIE_NAME;
    }
    this.#cookieConfig = {
      sameSite: "lax",
      secure: runtimeMode === "production",
      path: "/",
      ...cookieConfigObject,
      httpOnly: true
    };
    this.#config = configRest;
    if (mockStorage) {
      this.#storage = mockStorage;
    }
  }
  /**
   * Gets a session value. Returns `undefined` if the session or value does not exist.
   */
  async get(key) {
    return (await this.#ensureData()).get(key)?.data;
  }
  /**
   * Checks if a session value exists.
   */
  async has(key) {
    return (await this.#ensureData()).has(key);
  }
  /**
   * Gets all session values.
   */
  async keys() {
    return (await this.#ensureData()).keys();
  }
  /**
   * Gets all session values.
   */
  async values() {
    return [...(await this.#ensureData()).values()].map((entry) => entry.data);
  }
  /**
   * Gets all session entries.
   */
  async entries() {
    return [...(await this.#ensureData()).entries()].map(([key, entry]) => [key, entry.data]);
  }
  /**
   * Deletes a session value.
   */
  delete(key) {
    this.#data ??= /* @__PURE__ */ new Map();
    this.#data.delete(key);
    if (this.#partial) {
      this.#toDelete.add(key);
    }
    this.#dirty = true;
  }
  /**
   * Sets a session value. The session is created if it does not exist.
   */
  set(key, value, { ttl } = {}) {
    if (!key) {
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "The session key was not provided."
      });
    }
    let cloned;
    try {
      cloned = unflatten(JSON.parse(stringify(value)));
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageSaveError,
          message: `The session data for ${key} could not be serialized.`,
          hint: "See the devalue library for all supported types: https://github.com/rich-harris/devalue"
        },
        { cause: err }
      );
    }
    if (!this.#cookieSet) {
      this.#setCookie();
      this.#cookieSet = true;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    const lifetime = ttl ?? this.#config.ttl;
    const expires = typeof lifetime === "number" ? Date.now() + lifetime * 1e3 : lifetime;
    this.#data.set(key, {
      data: cloned,
      expires
    });
    this.#dirty = true;
  }
  /**
   * Destroys the session, clearing the cookie and storage if it exists.
   */
  destroy() {
    const sessionId = this.#sessionID ?? this.#cookies.get(this.#cookieName)?.value;
    if (sessionId) {
      this.#toDestroy.add(sessionId);
    }
    this.#cookies.delete(this.#cookieName, this.#cookieConfig);
    this.#sessionID = void 0;
    this.#data = void 0;
    this.#dirty = true;
  }
  /**
   * Regenerates the session, creating a new session ID. The existing session data is preserved.
   */
  async regenerate() {
    let data = /* @__PURE__ */ new Map();
    try {
      data = await this.#ensureData();
    } catch (err) {
      console.error("Failed to load session data during regeneration:", err);
    }
    const oldSessionId = this.#sessionID;
    this.#sessionID = crypto.randomUUID();
    this.#sessionIDFromCookie = false;
    this.#data = data;
    this.#dirty = true;
    await this.#setCookie();
    if (oldSessionId && this.#storage) {
      this.#storage.removeItem(oldSessionId).catch((err) => {
        console.error("Failed to remove old session data:", err);
      });
    }
  }
  // Persists the session data to storage.
  // This is called automatically at the end of the request.
  // Uses a symbol to prevent users from calling it directly.
  async [PERSIST_SYMBOL]() {
    if (!this.#dirty && !this.#toDestroy.size) {
      return;
    }
    const storage = await this.#ensureStorage();
    if (this.#dirty && this.#data) {
      const data = await this.#ensureData();
      this.#toDelete.forEach((key2) => data.delete(key2));
      const key = this.#ensureSessionID();
      let serialized;
      try {
        serialized = stringify(data);
      } catch (err) {
        throw new AstroError(
          {
            ...SessionStorageSaveError,
            message: SessionStorageSaveError.message(
              "The session data could not be serialized.",
              this.#config.driver
            )
          },
          { cause: err }
        );
      }
      await storage.setItem(key, serialized);
      this.#dirty = false;
    }
    if (this.#toDestroy.size > 0) {
      const cleanupPromises = [...this.#toDestroy].map(
        (sessionId) => storage.removeItem(sessionId).catch((err) => {
          console.error("Failed to clean up session %s:", sessionId, err);
        })
      );
      await Promise.all(cleanupPromises);
      this.#toDestroy.clear();
    }
  }
  get sessionID() {
    return this.#sessionID;
  }
  /**
   * Loads a session from storage with the given ID, and replaces the current session.
   * Any changes made to the current session will be lost.
   * This is not normally needed, as the session is automatically loaded using the cookie.
   * However it can be used to restore a session where the ID has been recorded somewhere
   * else (e.g. in a database).
   */
  async load(sessionID) {
    this.#sessionID = sessionID;
    this.#data = void 0;
    await this.#setCookie();
    await this.#ensureData();
  }
  /**
   * Sets the session cookie.
   */
  async #setCookie() {
    if (!VALID_COOKIE_REGEX.test(this.#cookieName)) {
      throw new AstroError({
        ...SessionStorageSaveError,
        message: "Invalid cookie name. Cookie names can only contain letters, numbers, and dashes."
      });
    }
    const value = this.#ensureSessionID();
    this.#cookies.set(this.#cookieName, value, this.#cookieConfig);
  }
  /**
   * Attempts to load the session data from storage, or creates a new data object if none exists.
   * If there is existing partial data, it will be merged into the new data object.
   */
  async #ensureData() {
    if (this.#data && !this.#partial) {
      return this.#data;
    }
    this.#data ??= /* @__PURE__ */ new Map();
    if (!this.#sessionID && !this.#cookies.get(this.#cookieName)?.value) {
      this.#partial = false;
      return this.#data;
    }
    const storage = await this.#ensureStorage();
    const raw = await storage.get(this.#ensureSessionID());
    if (!raw) {
      if (this.#sessionIDFromCookie) {
        this.#sessionID = crypto.randomUUID();
        this.#sessionIDFromCookie = false;
        if (this.#cookieSet) {
          await this.#setCookie();
        }
      }
      return this.#data;
    }
    try {
      const storedMap = unflatten(raw);
      if (!(storedMap instanceof Map)) {
        await this.destroy();
        throw new AstroError({
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data was an invalid type.",
            this.#config.driver
          )
        });
      }
      const now = Date.now();
      for (const [key, value] of storedMap) {
        const expired = typeof value.expires === "number" && value.expires < now;
        if (!this.#data.has(key) && !this.#toDelete.has(key) && !expired) {
          this.#data.set(key, value);
        }
      }
      this.#partial = false;
      return this.#data;
    } catch (err) {
      await this.destroy();
      if (err instanceof AstroError) {
        throw err;
      }
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message(
            "The session data could not be parsed.",
            this.#config.driver
          )
        },
        { cause: err }
      );
    }
  }
  /**
   * Returns the session ID, generating a new one if it does not exist.
   */
  #ensureSessionID() {
    if (!this.#sessionID) {
      const cookieValue = this.#cookies.get(this.#cookieName)?.value;
      if (cookieValue) {
        this.#sessionID = cookieValue;
        this.#sessionIDFromCookie = true;
      } else {
        this.#sessionID = crypto.randomUUID();
      }
    }
    return this.#sessionID;
  }
  /**
   * Ensures the storage is initialized.
   * This is called automatically when a storage operation is needed.
   */
  async #ensureStorage() {
    if (this.#storage) {
      return this.#storage;
    }
    if (AstroSession.#sharedStorage.has(this.#config.driver)) {
      this.#storage = AstroSession.#sharedStorage.get(this.#config.driver);
      return this.#storage;
    }
    if (!this.#driverFactory) {
      throw new AstroError({
        ...SessionStorageInitError,
        message: SessionStorageInitError.message(
          "Astro could not load the driver correctly. Does it exist?",
          this.#config.driver
        )
      });
    }
    const driver = this.#driverFactory;
    try {
      this.#storage = createStorage({
        driver: {
          ...driver(this.#config.options),
          // Unused methods
          hasItem() {
            return false;
          },
          getKeys() {
            return [];
          }
        }
      });
      AstroSession.#sharedStorage.set(this.#config.driver, this.#storage);
      return this.#storage;
    } catch (err) {
      throw new AstroError(
        {
          ...SessionStorageInitError,
          message: SessionStorageInitError.message("Unknown error", this.#config.driver)
        },
        { cause: err }
      );
    }
  }
}
const SESSION_KEY = "session";
function provideSession(state) {
  state.pipeline.usedFeatures |= PipelineFeatures.sessions;
  const pipeline = state.pipeline;
  const config2 = pipeline.manifest.sessionConfig;
  if (!config2) return;
  return provideSessionAsync(state, config2);
}
async function provideSessionAsync(state, config2) {
  const pipeline = state.pipeline;
  const driverFactory = await pipeline.getSessionDriver();
  if (!driverFactory) return;
  state.provide(SESSION_KEY, {
    create() {
      const cookies = state.cookies;
      return new AstroSession({
        cookies,
        config: config2,
        runtimeMode: pipeline.runtimeMode,
        driverFactory,
        mockStorage: null
      });
    },
    finalize(session) {
      return session[PERSIST_SYMBOL]();
    }
  });
}
class AstroHandler {
  #app;
  #trailingSlashHandler;
  #actionHandler;
  #astroMiddleware;
  #pagesHandler;
  #cacheHandler;
  /** Bound callback for the middleware chain — created once, reused per request. */
  #renderRouteCallback;
  /**
   * i18n post-processor. Only set when the app has i18n configured and
   * the strategy is not `manual` — for the manual strategy users wire
   * `astro:i18n.middleware(...)` into their own `onRequest`.
   */
  #i18n;
  /** Whether sessions are configured on the manifest. */
  #hasSession;
  constructor(app2) {
    this.#app = app2;
    this.#trailingSlashHandler = new TrailingSlashHandler(app2);
    this.#actionHandler = new ActionHandler();
    this.#astroMiddleware = new AstroMiddleware(app2.pipeline);
    this.#pagesHandler = new PagesHandler(app2.pipeline);
    this.#cacheHandler = new CacheHandler(app2);
    this.#renderRouteCallback = this.#actionsAndPages.bind(this);
    this.#hasSession = !!app2.manifest.sessionConfig;
    const i18n = app2.manifest.i18n;
    if (i18n && i18n.strategy !== "manual") {
      this.#i18n = new I18n(
        i18n,
        app2.manifest.base,
        app2.manifest.trailingSlash,
        app2.manifest.buildFormat
      );
    }
  }
  /**
   * Runs actions then pages — the callback at the bottom of the
   * middleware chain. Bound once in the constructor to avoid
   * per-request closure allocation.
   */
  #actionsAndPages(state, ctx) {
    if (!state.skipMiddleware) {
      const actionResult = this.#actionHandler.handle(ctx, state);
      if (actionResult) {
        return actionResult.then((response) => response ?? this.#pagesHandler.handle(state, ctx));
      }
    }
    return this.#pagesHandler.handle(state, ctx);
  }
  async handle(state) {
    state.pipeline.usedFeatures |= ALL_PIPELINE_FEATURES;
    if (state.invalidEncoding) {
      return new Response(null, { status: 400, statusText: "Bad Request" });
    }
    const trailingSlashRedirect = this.#trailingSlashHandler.handle(state);
    if (trailingSlashRedirect) {
      return trailingSlashRedirect;
    }
    if (!state.routeData) {
      return this.#app.renderError(state.request, {
        ...state.renderOptions,
        status: 404,
        pathname: state.pathname
      });
    }
    return this.render(state);
  }
  /**
   * Renders a response for the given `FetchState`. Assumes
   * trailing-slash redirects and routeData resolution have already run.
   *
   * User-triggered rewrites (`Astro.rewrite` / `ctx.rewrite`) go through
   * `Rewrites.execute` on the current `FetchState` — they mutate the
   * existing state in place and re-run middleware + page dispatch.
   */
  async render(state) {
    const routeData = state.routeData;
    const pathname = state.pathname;
    const request = state.request;
    const { addCookieHeader } = state.renderOptions;
    const defaultStatus = this.#app.getDefaultStatusCode(routeData, pathname);
    state.status = defaultStatus;
    let response;
    try {
      const sessionP = this.#hasSession ? provideSession(state) : void 0;
      const cacheP = provideCache(state);
      if (sessionP || cacheP) await Promise.all([sessionP, cacheP]);
      state.pipeline.usedFeatures |= PipelineFeatures.sessions;
      if (routeData.type === "redirect") {
        const redirectResponse = await renderRedirect(state);
        this.#app.logThisRequest({
          pathname,
          method: request.method,
          statusCode: redirectResponse.status,
          isRewrite: false,
          timeStart: state.timeStart
        });
        prepareResponse(redirectResponse, { addCookieHeader });
        this.#app.pipeline.logger.flush();
        return redirectResponse;
      }
      if (!this.#app.pipeline.cacheProvider) {
        this.#app.pipeline.usedFeatures |= PipelineFeatures.cache;
        response = await this.#astroMiddleware.handle(state, this.#renderRouteCallback);
        if (this.#i18n) {
          response = await this.#i18n.finalize(state, response);
        }
      } else {
        const runPipeline = async () => {
          let res = await this.#astroMiddleware.handle(state, this.#renderRouteCallback);
          if (this.#i18n) {
            res = await this.#i18n.finalize(state, res);
          }
          return res;
        };
        response = await this.#cacheHandler.handle(state, runPipeline);
      }
      const isRewrite = response.headers.has(REWRITE_DIRECTIVE_HEADER_KEY);
      this.#app.logThisRequest({
        pathname,
        method: request.method,
        statusCode: response.status,
        isRewrite,
        timeStart: state.timeStart
      });
    } catch (err) {
      this.#app.logger.error(null, err.stack || err.message || String(err));
      return this.#app.renderError(request, {
        ...state.renderOptions,
        status: 500,
        error: err,
        pathname: state.pathname
      });
    } finally {
      const finalize = state.finalizeAll();
      if (finalize) await finalize;
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && // If the body isn't null, that means the user sets the 404 status
    // but uses the current route to handle the 404
    response.body === null && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return this.#app.renderError(request, {
        ...state.renderOptions,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : void 0,
        pathname: state.pathname
      });
    }
    prepareResponse(response, { addCookieHeader });
    this.#app.pipeline.logger.flush();
    return response;
  }
}
class DefaultFetchHandler {
  #app;
  #handler;
  constructor(app2) {
    this.#app = app2 ?? null;
    this.#handler = app2 ? new AstroHandler(app2) : null;
  }
  /**
   * Fast path: called directly by `BaseApp.render()` with pre-resolved
   * options, avoiding the `Reflect.set/get` round-trip through the request.
   */
  renderWithOptions(request, options) {
    if (!this.#app) {
      const app2 = Reflect.get(request, appSymbol);
      if (!app2) {
        throw new Error("No fetch handler provided.");
      }
      this.#app = app2;
      this.#handler = new AstroHandler(app2);
    }
    const state = new FetchState(this.#app.pipeline, request, options);
    return this.#handler.handle(state);
  }
  fetch = (request) => {
    if (!this.#app) {
      const app2 = Reflect.get(request, appSymbol);
      if (!app2) {
        throw new Error("No fetch handler provided.");
      }
      this.#app = app2;
      this.#handler = new AstroHandler(app2);
    }
    const state = new FetchState(this.#app.pipeline, request);
    if (!this.#handler) {
      throw new Error("No fetch handler provided.");
    }
    return this.#handler.handle(state);
  };
}
const fetchable = new DefaultFetchHandler();
class DefaultErrorHandler {
  #app;
  #astroMiddleware;
  #pagesHandler;
  constructor(app2) {
    this.#app = app2;
    this.#astroMiddleware = new AstroMiddleware(app2.pipeline);
    this.#pagesHandler = new PagesHandler(app2.pipeline);
  }
  async renderError(request, {
    status,
    response: originalResponse,
    skipMiddleware = false,
    error: error2,
    pathname,
    ...resolvedRenderOptions
  }) {
    const app2 = this.#app;
    const resolvedPathname = pathname ?? new FetchState(app2.pipeline, request).pathname;
    const errorRoutePath = `/${status}${app2.manifest.trailingSlash === "always" ? "/" : ""}`;
    const errorRouteData = matchRoute(errorRoutePath, app2.manifestData);
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
        const allowedDomains = app2.manifest.allowedDomains;
        const validatedHost = validateHost(url.host, url.protocol.replace(":", ""), allowedDomains);
        const safeOrigin = validatedHost ? url.origin : `${url.protocol}//localhost`;
        const statusURL = new URL(
          `${app2.baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
          safeOrigin
        );
        if (statusURL.toString() !== request.url && resolvedRenderOptions.prerenderedErrorPageFetch) {
          try {
            const response2 = await resolvedRenderOptions.prerenderedErrorPageFetch(
              statusURL.toString()
            );
            const override = { status, removeContentEncodingHeaders: true };
            const newResponse = mergeResponses(response2, originalResponse, override);
            prepareResponse(newResponse, resolvedRenderOptions);
            return newResponse;
          } catch {
            const response2 = mergeResponses(new Response(null, { status }), originalResponse);
            prepareResponse(response2, resolvedRenderOptions);
            return response2;
          }
        }
      }
      const mod = await app2.pipeline.getComponentByRoute(errorRouteData);
      const errorState = new FetchState(app2.pipeline, request);
      errorState.skipMiddleware = skipMiddleware;
      errorState.clientAddress = resolvedRenderOptions.clientAddress;
      errorState.routeData = errorRouteData;
      errorState.pathname = resolvedPathname;
      errorState.status = status;
      errorState.componentInstance = mod;
      errorState.locals = resolvedRenderOptions.locals ?? {};
      errorState.initialProps = { error: error2 };
      try {
        await provideSession(errorState);
        const response2 = await this.#astroMiddleware.handle(
          errorState,
          this.#pagesHandler.handle.bind(this.#pagesHandler)
        );
        const newResponse = mergeResponses(response2, originalResponse);
        prepareResponse(newResponse, resolvedRenderOptions);
        return newResponse;
      } catch {
        if (skipMiddleware === false) {
          return this.renderError(request, {
            ...resolvedRenderOptions,
            status,
            response: originalResponse,
            skipMiddleware: true,
            pathname: resolvedPathname
          });
        }
      } finally {
        await errorState.finalizeAll();
      }
    }
    const response = mergeResponses(new Response(null, { status }), originalResponse);
    prepareResponse(response, resolvedRenderOptions);
    return response;
  }
}
function mergeResponses(newResponse, originalResponse, override) {
  let newResponseHeaders = newResponse.headers;
  if (override?.removeContentEncodingHeaders) {
    newResponseHeaders = new Headers(newResponseHeaders);
    newResponseHeaders.delete("Content-Encoding");
    newResponseHeaders.delete("Content-Length");
  }
  if (!originalResponse) {
    if (override !== void 0) {
      return new Response(newResponse.body, {
        status: override.status,
        statusText: newResponse.statusText,
        headers: newResponseHeaders
      });
    }
    return newResponse;
  }
  const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
  try {
    originalResponse.headers.delete("Content-type");
    originalResponse.headers.delete("Content-Length");
    originalResponse.headers.delete("Transfer-Encoding");
  } catch {
  }
  const newHeaders = new Headers();
  const seen = /* @__PURE__ */ new Set();
  for (const [name, value] of originalResponse.headers) {
    newHeaders.append(name, value);
    seen.add(name.toLowerCase());
  }
  for (const [name, value] of newResponseHeaders) {
    if (!seen.has(name.toLowerCase())) {
      newHeaders.append(name, value);
    }
  }
  const mergedResponse = new Response(newResponse.body, {
    status,
    statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
    // If you're looking at here for possible bugs, it means that it's not a bug.
    // With the middleware, users can meddle with headers, and we should pass to the 404/500.
    // If users see something weird, it's because they are setting some headers they should not.
    //
    // Although, we don't want it to replace the content-type, because the error page must return `text/html`
    headers: newHeaders
  });
  const originalCookies = getCookiesFromResponse(originalResponse);
  const newCookies = getCookiesFromResponse(newResponse);
  if (originalCookies) {
    if (newCookies) {
      for (const cookieValue of newCookies.consume()) {
        originalResponse.headers.append("set-cookie", cookieValue);
      }
    }
    attachCookiesToResponse(mergedResponse, originalCookies);
  } else if (newCookies) {
    attachCookiesToResponse(mergedResponse, newCookies);
  }
  return mergedResponse;
}
class BaseApp {
  manifest;
  manifestData;
  pipeline;
  #adapterLogger;
  baseWithoutTrailingSlash;
  /**
   * The handler that turns incoming `Request` objects into `Response`s.
   * Defaults to a `DefaultFetchHandler` pinned to this app and can be
   * overridden via `setFetchHandler` — typically by the bundled
   * entrypoint after importing `virtual:astro:fetchable`.
   */
  #fetchHandler;
  #errorHandler;
  /**
   * Whether a custom fetch handler (from `src/app.ts`) has been set
   * via `setFetchHandler`. When false, the `DefaultFetchHandler` is
   * in use and all features are implicitly active.
   */
  #hasCustomFetchHandler = false;
  /**
   * Whether the missing-feature check has already run. We only want
   * to warn once — after the first request in dev, or at build end.
   */
  #featureCheckDone = false;
  get logger() {
    return this.pipeline.logger;
  }
  get adapterLogger() {
    const currentOptions = this.logger.options;
    if (!this.#adapterLogger || this.#adapterLogger.options !== currentOptions) {
      this.#adapterLogger = new AstroIntegrationLogger(currentOptions, this.manifest.adapterName);
    }
    return this.#adapterLogger;
  }
  constructor(manifest2, streaming = true, ...args) {
    this.manifest = manifest2;
    this.baseWithoutTrailingSlash = removeTrailingForwardSlash(manifest2.base);
    this.pipeline = this.createPipeline(streaming, manifest2, ...args);
    this.manifestData = this.pipeline.manifestData;
    this.#fetchHandler = new DefaultFetchHandler(this);
    this.#errorHandler = this.createErrorHandler();
  }
  /**
   * Override the fetch handler used to dispatch requests. Entrypoints
   * call this with the default export of `virtual:astro:fetchable` to
   * plug in a user-authored handler from `src/app.ts`.
   */
  setFetchHandler(handler) {
    this.#fetchHandler = handler;
    this.#hasCustomFetchHandler = !(handler instanceof DefaultFetchHandler);
  }
  /**
   * Returns the error handler strategy used by this app. Override to
   * provide environment-specific behavior (dev overlay, build-time throws, etc.).
   */
  createErrorHandler() {
    return new DefaultErrorHandler(this);
  }
  /**
   * Resets the cached adapter logger so it picks up a new logger instance.
   * Used by BuildApp when the logger is replaced via setOptions().
   */
  resetAdapterLogger() {
    this.#adapterLogger = void 0;
  }
  getAllowedDomains() {
    return this.manifest.allowedDomains;
  }
  matchesAllowedDomains(forwardedHost, protocol) {
    return BaseApp.validateForwardedHost(forwardedHost, this.manifest.allowedDomains, protocol);
  }
  static validateForwardedHost(forwardedHost, allowedDomains, protocol) {
    if (!allowedDomains || allowedDomains.length === 0) {
      return false;
    }
    try {
      const testUrl = new URL(`${protocol || "https"}://${forwardedHost}`);
      return allowedDomains.some((pattern) => {
        return matchPattern(testUrl, pattern);
      });
    } catch {
      return false;
    }
  }
  set setManifestData(newManifestData) {
    this.manifestData = newManifestData;
    this.pipeline.manifestData = newManifestData;
    this.pipeline.rebuildRouter();
  }
  removeBase(pathname) {
    pathname = collapseDuplicateLeadingSlashes(pathname);
    if (pathname.startsWith(this.manifest.base)) {
      return pathname.slice(this.baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  /**
   * Decodes a pathname with `decodeURI`, falling back to the raw pathname when it
   * contains an invalid percent-sequence (e.g. `%C0%AF`, an overlong-UTF-8 encoding of
   * `/` commonly sent by path-traversal scanners). A raw `decodeURI()` would throw
   * `URIError: URI malformed`, and because `match()` runs before `render()` that error
   * escapes the adapter's request handler as an uncaught exception (HTTP 500) that user
   * middleware can't catch.
   */
  safeDecodeURI(pathname) {
    try {
      return decodeURI(pathname);
    } catch (e) {
      this.adapterLogger.debug(e.toString());
      return pathname;
    }
  }
  /**
   * Extracts the base-stripped, decoded pathname from a request.
   * Used by adapters to compute the pathname for dev-mode route matching.
   */
  getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    return this.safeDecodeURI(pathname);
  }
  /**
   * Given a `Request`, it returns the `RouteData` that matches its `pathname`. By default, prerendered
   * routes aren't returned, even if they are matched.
   *
   * When `allowPrerenderedRoutes` is `true`, the function returns matched prerendered routes too.
   * @param request
   * @param allowPrerenderedRoutes
   */
  match(request, allowPrerenderedRoutes = false) {
    const url = new URL(request.url);
    if (this.manifest.assets.has(url.pathname)) return void 0;
    let pathname = this.computePathnameFromDomain(request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    const routeData = this.pipeline.matchRoute(this.safeDecodeURI(pathname));
    if (!routeData) return void 0;
    if (allowPrerenderedRoutes) {
      return routeData;
    }
    if (routeData.prerender) {
      if (routeData.params.length > 0) {
        const allMatches = this.pipeline.matchAllRoutes(this.safeDecodeURI(pathname));
        return allMatches.find((r) => !r.prerender);
      }
      return void 0;
    }
    return routeData;
  }
  /**
   * A matching route function to use in the development server.
   * Contrary to the `.match` function, this function resolves props and params, returning the correct
   * route based on the priority, segments. It also returns the correct, resolved pathname.
   * @param pathname
   */
  devMatch(pathname) {
    return void 0;
  }
  computePathnameFromDomain(request) {
    return computePathnameFromDomain(
      request,
      new URL(request.url),
      this.manifest.i18n,
      this.manifest.base,
      this.manifest.trailingSlash,
      this.logger
    );
  }
  async render(request, {
    addCookieHeader = false,
    clientAddress = Reflect.get(request, clientAddressSymbol),
    locals,
    prerenderedErrorPageFetch = fetch,
    routeData,
    waitUntil
  } = {}) {
    await this.pipeline.getLogger();
    if (routeData) {
      this.logger.debug(
        "router",
        "The adapter " + this.manifest.adapterName + " provided a custom RouteData for ",
        request.url
      );
      this.logger.debug("router", "RouteData");
      this.logger.debug("router", routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error2 = new AstroError(LocalsNotAnObject);
        this.logger.error(null, error2.stack);
        return this.renderError(request, {
          addCookieHeader,
          clientAddress,
          prerenderedErrorPageFetch,
          // If locals are invalid, we don't want to include them when
          // rendering the error page
          locals: void 0,
          routeData,
          waitUntil,
          status: 500,
          error: error2
        });
      }
    }
    if (!routeData) {
      const domainPathname = this.computePathnameFromDomain(request);
      if (domainPathname) {
        routeData = this.pipeline.matchRoute(this.safeDecodeURI(domainPathname));
      }
    }
    const resolvedOptions = {
      addCookieHeader,
      clientAddress,
      prerenderedErrorPageFetch,
      locals,
      routeData,
      waitUntil
    };
    let response;
    if (this.#fetchHandler instanceof DefaultFetchHandler) {
      Reflect.set(request, appSymbol, this);
      response = await this.#fetchHandler.renderWithOptions(request, resolvedOptions);
    } else {
      setRenderOptions(request, resolvedOptions);
      Reflect.set(request, appSymbol, this);
      response = await this.#fetchHandler.fetch(request);
    }
    this.#warnMissingFeatures();
    if (response.headers.get(ASTRO_ERROR_HEADER)) {
      response.headers.delete(ASTRO_ERROR_HEADER);
      return this.renderError(request, {
        addCookieHeader,
        clientAddress,
        prerenderedErrorPageFetch,
        locals,
        routeData,
        waitUntil,
        response,
        status: response.status,
        error: response.status === 500 ? null : void 0
      });
    }
    return response;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
   * For example,
   * ```ts
   * for (const cookie_ of App.getSetCookieFromResponse(response)) {
   *     const cookie: string = cookie_
   * }
   * ```
   * @param response The response to read cookies from.
   * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
   */
  static getSetCookieFromResponse = getSetCookiesFromResponse;
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes.
   *
   * Delegates to the app's configured `ErrorHandler`. To customize behavior
   * for a specific environment, override `createErrorHandler()` rather than
   * this method.
   */
  async renderError(request, options) {
    return this.#errorHandler.renderError(request, options);
  }
  /**
   * One-shot check: after the first request with a custom `src/app.ts`,
   * compare `usedFeatures` against the manifest and warn about any
   * configured features the user's pipeline doesn't call.
   */
  #warnMissingFeatures() {
    if (this.#featureCheckDone || !this.#hasCustomFetchHandler) return;
    this.#featureCheckDone = true;
    const manifest2 = this.manifest;
    const missing = [];
    const used = this.pipeline.usedFeatures;
    if (manifest2.routes.some((r) => r.routeData.type === "redirect") && !(used & PipelineFeatures.redirects)) {
      missing.push("redirects");
    }
    if (manifest2.sessionConfig && !(used & PipelineFeatures.sessions)) {
      missing.push("sessions");
    }
    if (manifest2.actions && !(used & PipelineFeatures.actions)) {
      missing.push("actions");
    }
    if (manifest2.middleware && !(used & PipelineFeatures.middleware)) {
      missing.push("middleware");
    }
    if (manifest2.i18n && manifest2.i18n.strategy !== "manual" && !(used & PipelineFeatures.i18n)) {
      missing.push("i18n");
    }
    if (manifest2.cacheConfig && !(used & PipelineFeatures.cache)) {
      missing.push("cache");
    }
    for (const feature of missing) {
      this.logger.warn(
        "router",
        `Your project uses ${feature}, but your custom src/app.ts does not call the ${feature}() handler. This feature will not work unless you add it to your app.ts pipeline.`
      );
    }
  }
  getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.test(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes) {
        if (fallbackRoute.pattern.test(pathname)) {
          return 302;
        }
      }
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404")) return 404;
    if (route.endsWith("/500")) return 500;
    return 200;
  }
  getManifest() {
    return this.pipeline.manifest;
  }
  logThisRequest({
    pathname,
    method,
    statusCode,
    isRewrite,
    timeStart
  }) {
    const timeEnd = performance.now();
    this.logRequest({
      pathname,
      method,
      statusCode,
      isRewrite,
      reqTime: timeEnd - timeStart
    });
  }
}
function getAssetsPrefix(fileExtension2, assetsPrefix) {
  let prefix = "";
  if (!assetsPrefix) {
    prefix = "";
  } else if (typeof assetsPrefix === "string") {
    prefix = assetsPrefix;
  } else {
    const dotLessFileExtension = fileExtension2.slice(1);
    prefix = assetsPrefix[dotLessFileExtension] || assetsPrefix.fallback;
  }
  return prefix;
}
const URL_PARSE_BASE = "https://astro.build";
function splitAssetPath(path) {
  const parsed = new URL(path, URL_PARSE_BASE);
  const isAbsolute = URL.canParse(path);
  const pathname = !isAbsolute && !path.startsWith("/") ? parsed.pathname.slice(1) : parsed.pathname;
  return {
    pathname,
    suffix: `${parsed.search}${parsed.hash}`
  };
}
function createAssetLink(href, base, assetsPrefix, queryParams) {
  const { pathname, suffix } = splitAssetPath(href);
  let url = "";
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(pathname), assetsPrefix);
    url = joinPaths(pf, slash(pathname)) + suffix;
  } else if (base) {
    url = prependForwardSlash(joinPaths(base, slash(pathname))) + suffix;
  } else {
    url = href;
  }
  return url;
}
function createStylesheetElement(stylesheet, base, assetsPrefix, queryParams) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix, queryParams) {
  return new Set(
    stylesheets.map((s2) => createStylesheetElement(s2, base, assetsPrefix))
  );
}
function createModuleScriptElement(script, base, assetsPrefix, queryParams) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix, queryParams) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}
class AppPipeline extends Pipeline {
  getName() {
    return "AppPipeline";
  }
  static create({ manifest: manifest2, streaming }) {
    const resolve = async function resolve2(specifier) {
      if (!(specifier in manifest2.entryModules)) {
        throw new Error(`Unable to resolve [${specifier}]`);
      }
      const bundlePath = manifest2.entryModules[specifier];
      if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
        return bundlePath;
      } else {
        return createAssetLink(bundlePath, manifest2.base, manifest2.assetsPrefix);
      }
    };
    const logger = createConsoleLogger({ level: manifest2.logLevel });
    const pipeline = new AppPipeline(
      logger,
      manifest2,
      "production",
      manifest2.renderers,
      resolve,
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0
    );
    return pipeline;
  }
  async headElements(routeData) {
    const { assetsPrefix, base } = this.manifest;
    const routeInfo = this.manifest.routes.find(
      (route) => route.routeData.route === routeData.route
    );
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? [], base, assetsPrefix);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script, base, assetsPrefix));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance)
        };
      }
    }
    let routeToProcess = route;
    if (routeIsRedirect(route)) {
      if (route.redirectRoute) {
        routeToProcess = route.redirectRoute;
      } else {
        return RedirectSinglePageBuiltModule;
      }
    } else if (routeIsFallback(route)) {
      routeToProcess = getFallbackRoute(route, this.manifest.routes);
    }
    if (this.manifest.pageMap) {
      const importComponentInstance = this.manifest.pageMap.get(routeToProcess.component);
      if (!importComponentInstance) {
        throw new Error(
          `Unexpectedly unable to find a component instance for route ${route.route}`
        );
      }
      return await importComponentInstance();
    } else if (this.manifest.pageModule) {
      return this.manifest.pageModule;
    }
    throw new Error(
      "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
    );
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base,
      outDir: this.manifest?.serverLike ? this.manifest.buildClientDir : this.manifest.outDir
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
}
class App extends BaseApp {
  createPipeline(streaming) {
    return AppPipeline.create({
      manifest: this.manifest,
      streaming
    });
  }
  isDev() {
    return false;
  }
  // Should we log something for our users?
  logRequest(_options) {
  }
}
const renderers = [];
const serializedData = [{ "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "type": "page", "component": "_server-islands.astro", "params": ["name"], "segments": [[{ "content": "_server-islands", "dynamic": false, "spread": false }], [{ "content": "name", "dynamic": true, "spread": false }]], "pattern": "^\\/_server-islands\\/([^/]+?)\\/?$", "prerender": false, "isIndex": false, "fallbackRoutes": [], "route": "/_server-islands/[name]", "origin": "internal", "distURL": [], "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/_image", "component": "node_modules/@astrojs/cloudflare/dist/entrypoints/image-passthrough-endpoint.js", "params": [], "pathname": "/_image", "pattern": "^\\/_image\\/?$", "segments": [[{ "content": "_image", "dynamic": false, "spread": false }]], "type": "endpoint", "prerender": false, "fallbackRoutes": [], "distURL": [], "isIndex": false, "origin": "internal", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/.well-known/jwks.json", "isIndex": false, "type": "endpoint", "pattern": "^\\/\\.well-known\\/jwks\\.json$", "segments": [[{ "content": ".well-known", "dynamic": false, "spread": false }], [{ "content": "jwks.json", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/.well-known/jwks.json.ts", "pathname": "/.well-known/jwks.json", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/.well-known/openid-configuration", "isIndex": false, "type": "endpoint", "pattern": "^\\/\\.well-known\\/openid-configuration\\/?$", "segments": [[{ "content": ".well-known", "dynamic": false, "spread": false }], [{ "content": "openid-configuration", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/.well-known/openid-configuration.ts", "pathname": "/.well-known/openid-configuration", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/404", "isIndex": false, "type": "page", "pattern": "^\\/404\\/?$", "segments": [[{ "content": "404", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/404.astro", "pathname": "/404", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/account", "isIndex": false, "type": "page", "pattern": "^\\/account\\/?$", "segments": [[{ "content": "account", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/account.astro", "pathname": "/account", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/accounting/export.csv", "isIndex": false, "type": "endpoint", "pattern": "^\\/accounting\\/export\\.csv$", "segments": [[{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "export.csv", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/accounting/export.csv.ts", "pathname": "/accounting/export.csv", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/accounting/yayoi.csv", "isIndex": false, "type": "endpoint", "pattern": "^\\/accounting\\/yayoi\\.csv$", "segments": [[{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "yayoi.csv", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/accounting/yayoi.csv.ts", "pathname": "/accounting/yayoi.csv", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/accounting", "isIndex": true, "type": "page", "pattern": "^\\/accounting\\/?$", "segments": [[{ "content": "accounting", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/accounting/index.astro", "pathname": "/accounting", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/activate", "isIndex": false, "type": "page", "pattern": "^\\/activate\\/?$", "segments": [[{ "content": "activate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/activate.astro", "pathname": "/activate", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/admin/data", "isIndex": false, "type": "page", "pattern": "^\\/admin\\/data\\/?$", "segments": [[{ "content": "admin", "dynamic": false, "spread": false }], [{ "content": "data", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/admin/data.astro", "pathname": "/admin/data", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/a2a/inbound", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/a2a\\/inbound\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "a2a", "dynamic": false, "spread": false }], [{ "content": "inbound", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/a2a/inbound.ts", "pathname": "/api/a2a/inbound", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/a2a/manage", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/a2a\\/manage\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "a2a", "dynamic": false, "spread": false }], [{ "content": "manage", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/a2a/manage.ts", "pathname": "/api/a2a/manage", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/accounting/asset", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/accounting\\/asset\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "asset", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/accounting/asset.ts", "pathname": "/api/accounting/asset", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/accounting/closure", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/accounting\\/closure\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "closure", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/accounting/closure.ts", "pathname": "/api/accounting/closure", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/accounting/import-csv", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/accounting\\/import-csv\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "import-csv", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/accounting/import-csv.ts", "pathname": "/api/accounting/import-csv", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/accounting/journal", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/accounting\\/journal\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "journal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/accounting/journal.ts", "pathname": "/api/accounting/journal", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/accounting/suggest-account", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/accounting\\/suggest-account\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "suggest-account", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/accounting/suggest-account.ts", "pathname": "/api/accounting/suggest-account", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/accounting/wallet", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/accounting\\/wallet\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "accounting", "dynamic": false, "spread": false }], [{ "content": "wallet", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/accounting/wallet.ts", "pathname": "/api/accounting/wallet", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/activity", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/activity\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "activity", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/activity.ts", "pathname": "/api/activity", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/agent-actions", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/agent-actions\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "agent-actions", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/agent-actions.ts", "pathname": "/api/agent-actions", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-ask", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-ask\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-ask", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-ask.ts", "pathname": "/api/app-ask", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-audit", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-audit\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-audit", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-audit.ts", "pathname": "/api/app-audit", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-drafts", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-drafts\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-drafts", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-drafts.ts", "pathname": "/api/app-drafts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-edit", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-edit\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-edit", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-edit.ts", "pathname": "/api/app-edit", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-export", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-export\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-export", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-export.ts", "pathname": "/api/app-export", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-from-csv", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-from-csv\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-from-csv", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-from-csv.ts", "pathname": "/api/app-from-csv", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/app-run", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/app-run\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "app-run", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/app-run.ts", "pathname": "/api/app-run", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/auth/google/relay", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/auth\\/google\\/relay\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "auth", "dynamic": false, "spread": false }], [{ "content": "google", "dynamic": false, "spread": false }], [{ "content": "relay", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/auth/google/relay.ts", "pathname": "/api/auth/google/relay", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/auth/[provider]/callback", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/auth\\/([^/]+?)\\/callback\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "auth", "dynamic": false, "spread": false }], [{ "content": "provider", "dynamic": true, "spread": false }], [{ "content": "callback", "dynamic": false, "spread": false }]], "params": ["provider"], "component": "src/pages/api/auth/[provider]/callback.ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/auth/[provider]/start", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/auth\\/([^/]+?)\\/start\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "auth", "dynamic": false, "spread": false }], [{ "content": "provider", "dynamic": true, "spread": false }], [{ "content": "start", "dynamic": false, "spread": false }]], "params": ["provider"], "component": "src/pages/api/auth/[provider]/start.ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/autopilot", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/autopilot\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "autopilot", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/autopilot.ts", "pathname": "/api/autopilot", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/backup", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/backup\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "backup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/backup.ts", "pathname": "/api/backup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/billing/start", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/billing\\/start\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "billing", "dynamic": false, "spread": false }], [{ "content": "start", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/billing/start.ts", "pathname": "/api/billing/start", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/capabilities", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/capabilities\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "capabilities", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/capabilities.ts", "pathname": "/api/capabilities", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/chat/stream", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/chat\\/stream\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "chat", "dynamic": false, "spread": false }], [{ "content": "stream", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/chat/stream.ts", "pathname": "/api/chat/stream", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/chat", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/chat\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "chat", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/chat.ts", "pathname": "/api/chat", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/chat-sessions", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/chat-sessions\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "chat-sessions", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/chat-sessions.ts", "pathname": "/api/chat-sessions", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/connectors", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/connectors\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "connectors", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/connectors.ts", "pathname": "/api/connectors", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/consent", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/consent\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "consent", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/consent.ts", "pathname": "/api/consent", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/contact", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/contact\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "contact", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/contact.ts", "pathname": "/api/contact", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/cron/drain", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/cron\\/drain\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "cron", "dynamic": false, "spread": false }], [{ "content": "drain", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/cron/drain.ts", "pathname": "/api/cron/drain", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/data", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/data\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "data", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/data.ts", "pathname": "/api/data", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/directory", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/directory\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "directory", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/directory.ts", "pathname": "/api/directory", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/discord/link/callback", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/discord\\/link\\/callback\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "discord", "dynamic": false, "spread": false }], [{ "content": "link", "dynamic": false, "spread": false }], [{ "content": "callback", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/discord/link/callback.ts", "pathname": "/api/discord/link/callback", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/discord/link/start", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/discord\\/link\\/start\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "discord", "dynamic": false, "spread": false }], [{ "content": "link", "dynamic": false, "spread": false }], [{ "content": "start", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/discord/link/start.ts", "pathname": "/api/discord/link/start", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/discord/panel", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/discord\\/panel\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "discord", "dynamic": false, "spread": false }], [{ "content": "panel", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/discord/panel.ts", "pathname": "/api/discord/panel", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/discord/register", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/discord\\/register\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "discord", "dynamic": false, "spread": false }], [{ "content": "register", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/discord/register.ts", "pathname": "/api/discord/register", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/discord/setup", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/discord\\/setup\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "discord", "dynamic": false, "spread": false }], [{ "content": "setup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/discord/setup.ts", "pathname": "/api/discord/setup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/docs", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/docs\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "docs", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/docs.ts", "pathname": "/api/docs", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/drive/callback", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/drive\\/callback\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "drive", "dynamic": false, "spread": false }], [{ "content": "callback", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/drive/callback.ts", "pathname": "/api/drive/callback", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/drive/start", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/drive\\/start\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "drive", "dynamic": false, "spread": false }], [{ "content": "start", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/drive/start.ts", "pathname": "/api/drive/start", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/drive", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/drive\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "drive", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/drive.ts", "pathname": "/api/drive", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/event/apply", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/event\\/apply\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "event", "dynamic": false, "spread": false }], [{ "content": "apply", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/event/apply.ts", "pathname": "/api/event/apply", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/event/pay", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/event\\/pay\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "event", "dynamic": false, "spread": false }], [{ "content": "pay", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/event/pay.ts", "pathname": "/api/event/pay", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/event", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/event\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "event", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/event.ts", "pathname": "/api/event", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/ext/[appId]", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/ext\\/([^/]+?)\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "ext", "dynamic": false, "spread": false }], [{ "content": "appId", "dynamic": true, "spread": false }]], "params": ["appId"], "component": "src/pages/api/ext/[appId].ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/ext-token", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/ext-token\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "ext-token", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/ext-token.ts", "pathname": "/api/ext-token", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/feedback", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/feedback\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "feedback", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/feedback.ts", "pathname": "/api/feedback", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/files", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/files\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "files", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/files.ts", "pathname": "/api/files", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/google/callback", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/google\\/callback\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "google", "dynamic": false, "spread": false }], [{ "content": "callback", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/google/callback.ts", "pathname": "/api/google/callback", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/google/start", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/google\\/start\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "google", "dynamic": false, "spread": false }], [{ "content": "start", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/google/start.ts", "pathname": "/api/google/start", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/google/wif-handoff", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/google\\/wif-handoff\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "google", "dynamic": false, "spread": false }], [{ "content": "wif-handoff", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/google/wif-handoff.ts", "pathname": "/api/google/wif-handoff", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/google", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/google\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "google", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/google.ts", "pathname": "/api/google", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/import", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/import\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "import", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/import.ts", "pathname": "/api/import", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/inbound/[connector]", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/inbound\\/([^/]+?)\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "inbound", "dynamic": false, "spread": false }], [{ "content": "connector", "dynamic": true, "spread": false }]], "params": ["connector"], "component": "src/pages/api/inbound/[connector].ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/invoices", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/invoices\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "invoices", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/invoices.ts", "pathname": "/api/invoices", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/join", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/join\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "join", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/join.ts", "pathname": "/api/join", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/keys", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/keys\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "keys", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/keys.ts", "pathname": "/api/keys", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/line/setup", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/line\\/setup\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "line", "dynamic": false, "spread": false }], [{ "content": "setup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/line/setup.ts", "pathname": "/api/line/setup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/login", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/login\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "login", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/login.ts", "pathname": "/api/login", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/logo", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/logo\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "logo", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/logo.ts", "pathname": "/api/logo", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/mascot", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/mascot\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "mascot", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/mascot.ts", "pathname": "/api/mascot", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/me/leave-request", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/me\\/leave-request\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "me", "dynamic": false, "spread": false }], [{ "content": "leave-request", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/me/leave-request.ts", "pathname": "/api/me/leave-request", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/me/profile", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/me\\/profile\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "me", "dynamic": false, "spread": false }], [{ "content": "profile", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/me/profile.ts", "pathname": "/api/me/profile", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/members", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/members\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "members", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/members.ts", "pathname": "/api/members", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/membership", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/membership\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "membership", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/membership.ts", "pathname": "/api/membership", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/nav", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/nav\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "nav", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/nav.ts", "pathname": "/api/nav", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/news", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/news\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "news", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/news.ts", "pathname": "/api/news", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/notifications", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/notifications\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "notifications", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/notifications.ts", "pathname": "/api/notifications", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/notion/oauth/callback", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/notion\\/oauth\\/callback\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "notion", "dynamic": false, "spread": false }], [{ "content": "oauth", "dynamic": false, "spread": false }], [{ "content": "callback", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/notion/oauth/callback.ts", "pathname": "/api/notion/oauth/callback", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/notion/oauth/start", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/notion\\/oauth\\/start\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "notion", "dynamic": false, "spread": false }], [{ "content": "oauth", "dynamic": false, "spread": false }], [{ "content": "start", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/notion/oauth/start.ts", "pathname": "/api/notion/oauth/start", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/p/[slug]", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/p\\/([^/]+?)\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "p", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/api/p/[slug].ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/personal", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/personal\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "personal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/personal.ts", "pathname": "/api/personal", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/plan-request", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/plan-request\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "plan-request", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/plan-request.ts", "pathname": "/api/plan-request", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/precheck", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/precheck\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "precheck", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/precheck.ts", "pathname": "/api/precheck", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/projects", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/projects\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "projects", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/projects.ts", "pathname": "/api/projects", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/public/manage", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/public\\/manage\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "public", "dynamic": false, "spread": false }], [{ "content": "manage", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/public/manage.ts", "pathname": "/api/public/manage", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/push", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/push\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "push", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/push.ts", "pathname": "/api/push", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/pv", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/pv\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "pv", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/pv.ts", "pathname": "/api/pv", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/report", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/report\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "report", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/report.ts", "pathname": "/api/report", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/reports/kpi", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/reports\\/kpi\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "reports", "dynamic": false, "spread": false }], [{ "content": "kpi", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/reports/kpi.ts", "pathname": "/api/reports/kpi", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/review", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/review\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "review", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/review.ts", "pathname": "/api/review", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/schedule-sync", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/schedule-sync\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "schedule-sync", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/schedule-sync.ts", "pathname": "/api/schedule-sync", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/scheduled-tasks", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/scheduled-tasks\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "scheduled-tasks", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/scheduled-tasks.ts", "pathname": "/api/scheduled-tasks", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/self-check", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/self-check\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "self-check", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/self-check.ts", "pathname": "/api/self-check", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/settings", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/settings\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "settings", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/settings.ts", "pathname": "/api/settings", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/site/join", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/site\\/join\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "site", "dynamic": false, "spread": false }], [{ "content": "join", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/site/join.ts", "pathname": "/api/site/join", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/site/stripe-webhook", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/site\\/stripe-webhook\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "site", "dynamic": false, "spread": false }], [{ "content": "stripe-webhook", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/site/stripe-webhook.ts", "pathname": "/api/site/stripe-webhook", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/site", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/site\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "site", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/site.ts", "pathname": "/api/site", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/site-media/[id]", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/site-media\\/([^/]+?)\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "site-media", "dynamic": false, "spread": false }], [{ "content": "id", "dynamic": true, "spread": false }]], "params": ["id"], "component": "src/pages/api/site-media/[id].ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/site-media", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/site-media\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "site-media", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/site-media.ts", "pathname": "/api/site-media", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/site-unlock", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/site-unlock\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "site-unlock", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/site-unlock.ts", "pathname": "/api/site-unlock", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/skills", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/skills\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "skills", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/skills.ts", "pathname": "/api/skills", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/slack/setup", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/slack\\/setup\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "slack", "dynamic": false, "spread": false }], [{ "content": "setup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/slack/setup.ts", "pathname": "/api/slack/setup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/store", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/store\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "store", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/store.ts", "pathname": "/api/store", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/translate", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/translate\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "translate", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/translate.ts", "pathname": "/api/translate", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/tts", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/tts\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "tts", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/tts.ts", "pathname": "/api/tts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/tx", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/tx\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "tx", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/tx.ts", "pathname": "/api/tx", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/update", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/update\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "update", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/update.ts", "pathname": "/api/update", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/usage", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/usage\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "usage", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/usage.ts", "pathname": "/api/usage", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/api/usage-report", "isIndex": false, "type": "endpoint", "pattern": "^\\/api\\/usage-report\\/?$", "segments": [[{ "content": "api", "dynamic": false, "spread": false }], [{ "content": "usage-report", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/api/usage-report.ts", "pathname": "/api/usage-report", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/app/[id]", "isIndex": false, "type": "page", "pattern": "^\\/app\\/([^/]+?)\\/?$", "segments": [[{ "content": "app", "dynamic": false, "spread": false }], [{ "content": "id", "dynamic": true, "spread": false }]], "params": ["id"], "component": "src/pages/app/[id].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/approvals", "isIndex": false, "type": "page", "pattern": "^\\/approvals\\/?$", "segments": [[{ "content": "approvals", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/approvals.astro", "pathname": "/approvals", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/apps", "isIndex": false, "type": "page", "pattern": "^\\/apps\\/?$", "segments": [[{ "content": "apps", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/apps.astro", "pathname": "/apps", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/backup", "isIndex": false, "type": "page", "pattern": "^\\/backup\\/?$", "segments": [[{ "content": "backup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/backup.astro", "pathname": "/backup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/billing", "isIndex": false, "type": "page", "pattern": "^\\/billing\\/?$", "segments": [[{ "content": "billing", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/billing.astro", "pathname": "/billing", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/calendar", "isIndex": false, "type": "page", "pattern": "^\\/calendar\\/?$", "segments": [[{ "content": "calendar", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/calendar.astro", "pathname": "/calendar", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/chat", "isIndex": false, "type": "page", "pattern": "^\\/chat\\/?$", "segments": [[{ "content": "chat", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/chat.astro", "pathname": "/chat", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/consent", "isIndex": false, "type": "page", "pattern": "^\\/consent\\/?$", "segments": [[{ "content": "consent", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/consent.astro", "pathname": "/consent", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/dashboard", "isIndex": false, "type": "page", "pattern": "^\\/dashboard\\/?$", "segments": [[{ "content": "dashboard", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/dashboard.astro", "pathname": "/dashboard", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/diagnostics", "isIndex": false, "type": "page", "pattern": "^\\/diagnostics\\/?$", "segments": [[{ "content": "diagnostics", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/diagnostics.astro", "pathname": "/diagnostics", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/directory", "isIndex": false, "type": "page", "pattern": "^\\/directory\\/?$", "segments": [[{ "content": "directory", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/directory.astro", "pathname": "/directory", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/drive", "isIndex": false, "type": "page", "pattern": "^\\/drive\\/?$", "segments": [[{ "content": "drive", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/drive.astro", "pathname": "/drive", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/embed/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/embed\\/([^/]+?)\\/?$", "segments": [[{ "content": "embed", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/embed/[slug].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/event/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/event\\/([^/]+?)\\/?$", "segments": [[{ "content": "event", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/event/[slug].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/events", "isIndex": false, "type": "page", "pattern": "^\\/events\\/?$", "segments": [[{ "content": "events", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/events.astro", "pathname": "/events", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/favicon.ico", "isIndex": false, "type": "endpoint", "pattern": "^\\/favicon\\.ico$", "segments": [[{ "content": "favicon.ico", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/favicon.ico.ts", "pathname": "/favicon.ico", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/files/[id]", "isIndex": false, "type": "endpoint", "pattern": "^\\/files\\/([^/]+?)\\/?$", "segments": [[{ "content": "files", "dynamic": false, "spread": false }], [{ "content": "id", "dynamic": true, "spread": false }]], "params": ["id"], "component": "src/pages/files/[id].ts", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/files", "isIndex": true, "type": "page", "pattern": "^\\/files\\/?$", "segments": [[{ "content": "files", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/files/index.astro", "pathname": "/files", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/forbidden", "isIndex": false, "type": "page", "pattern": "^\\/forbidden\\/?$", "segments": [[{ "content": "forbidden", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/forbidden.astro", "pathname": "/forbidden", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/gmail", "isIndex": false, "type": "page", "pattern": "^\\/gmail\\/?$", "segments": [[{ "content": "gmail", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/gmail.astro", "pathname": "/gmail", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/hub/[id]", "isIndex": false, "type": "page", "pattern": "^\\/hub\\/([^/]+?)\\/?$", "segments": [[{ "content": "hub", "dynamic": false, "spread": false }], [{ "content": "id", "dynamic": true, "spread": false }]], "params": ["id"], "component": "src/pages/hub/[id].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/import", "isIndex": false, "type": "page", "pattern": "^\\/import\\/?$", "segments": [[{ "content": "import", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/import.astro", "pathname": "/import", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/invoices", "isIndex": false, "type": "page", "pattern": "^\\/invoices\\/?$", "segments": [[{ "content": "invoices", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/invoices.astro", "pathname": "/invoices", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/join", "isIndex": false, "type": "page", "pattern": "^\\/join\\/?$", "segments": [[{ "content": "join", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/join.astro", "pathname": "/join", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/legal", "isIndex": false, "type": "page", "pattern": "^\\/legal\\/?$", "segments": [[{ "content": "legal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/legal.astro", "pathname": "/legal", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/login", "isIndex": false, "type": "page", "pattern": "^\\/login\\/?$", "segments": [[{ "content": "login", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/login.astro", "pathname": "/login", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/lp/craft-career", "isIndex": false, "type": "page", "pattern": "^\\/lp\\/craft-career\\/?$", "segments": [[{ "content": "lp", "dynamic": false, "spread": false }], [{ "content": "craft-career", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/lp/craft-career.astro", "pathname": "/lp/craft-career", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/lp/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/lp\\/([^/]+?)\\/?$", "segments": [[{ "content": "lp", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/lp/[slug].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/meet", "isIndex": false, "type": "page", "pattern": "^\\/meet\\/?$", "segments": [[{ "content": "meet", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/meet.astro", "pathname": "/meet", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/membership", "isIndex": false, "type": "page", "pattern": "^\\/membership\\/?$", "segments": [[{ "content": "membership", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/membership.astro", "pathname": "/membership", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/minutes", "isIndex": false, "type": "page", "pattern": "^\\/minutes\\/?$", "segments": [[{ "content": "minutes", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/minutes.astro", "pathname": "/minutes", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/my-events", "isIndex": false, "type": "page", "pattern": "^\\/my-events\\/?$", "segments": [[{ "content": "my-events", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/my-events.astro", "pathname": "/my-events", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/news/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/news\\/([^/]+?)\\/?$", "segments": [[{ "content": "news", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/news/[slug].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/news", "isIndex": false, "type": "page", "pattern": "^\\/news\\/?$", "segments": [[{ "content": "news", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/news.astro", "pathname": "/news", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/p/[slug]", "isIndex": false, "type": "page", "pattern": "^\\/p\\/([^/]+?)\\/?$", "segments": [[{ "content": "p", "dynamic": false, "spread": false }], [{ "content": "slug", "dynamic": true, "spread": false }]], "params": ["slug"], "component": "src/pages/p/[slug].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/personal", "isIndex": false, "type": "page", "pattern": "^\\/personal\\/?$", "segments": [[{ "content": "personal", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/personal.astro", "pathname": "/personal", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/project/[id]", "isIndex": false, "type": "page", "pattern": "^\\/project\\/([^/]+?)\\/?$", "segments": [[{ "content": "project", "dynamic": false, "spread": false }], [{ "content": "id", "dynamic": true, "spread": false }]], "params": ["id"], "component": "src/pages/project/[id].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/projects", "isIndex": false, "type": "page", "pattern": "^\\/projects\\/?$", "segments": [[{ "content": "projects", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/projects.astro", "pathname": "/projects", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/reports", "isIndex": false, "type": "page", "pattern": "^\\/reports\\/?$", "segments": [[{ "content": "reports", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/reports.astro", "pathname": "/reports", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/review", "isIndex": false, "type": "page", "pattern": "^\\/review\\/?$", "segments": [[{ "content": "review", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/review.astro", "pathname": "/review", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/robots.txt", "isIndex": false, "type": "endpoint", "pattern": "^\\/robots\\.txt$", "segments": [[{ "content": "robots.txt", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/robots.txt.ts", "pathname": "/robots.txt", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/schedule", "isIndex": false, "type": "page", "pattern": "^\\/schedule\\/?$", "segments": [[{ "content": "schedule", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/schedule.astro", "pathname": "/schedule", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/a2a", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/a2a\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "a2a", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/a2a.astro", "pathname": "/settings/a2a", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/advanced", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/advanced\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "advanced", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/advanced.astro", "pathname": "/settings/advanced", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/agent", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/agent\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "agent", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/agent.astro", "pathname": "/settings/agent", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/analytics", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/analytics\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "analytics", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/analytics.astro", "pathname": "/settings/analytics", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/connectors", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/connectors\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "connectors", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/connectors.astro", "pathname": "/settings/connectors", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/directory", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/directory\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "directory", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/directory.astro", "pathname": "/settings/directory", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/display", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/display\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "display", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/display.astro", "pathname": "/settings/display", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/domain", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/domain\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "domain", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/domain.astro", "pathname": "/settings/domain", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/events", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/events\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "events", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/events.astro", "pathname": "/settings/events", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/google-setup", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/google-setup\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "google-setup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/google-setup.astro", "pathname": "/settings/google-setup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/inbox", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/inbox\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "inbox", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/inbox.astro", "pathname": "/settings/inbox", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/integrations", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/integrations\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "integrations", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/integrations.astro", "pathname": "/settings/integrations", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/keys", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/keys\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "keys", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/keys.astro", "pathname": "/settings/keys", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/media", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/media\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "media", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/media.astro", "pathname": "/settings/media", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/members", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/members\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "members", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/members.astro", "pathname": "/settings/members", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/messaging", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/messaging\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "messaging", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/messaging.astro", "pathname": "/settings/messaging", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/nav", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/nav\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "nav", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/nav.astro", "pathname": "/settings/nav", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/news", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/news\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "news", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/news.astro", "pathname": "/settings/news", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/ops", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/ops\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "ops", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/ops.astro", "pathname": "/settings/ops", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/org", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/org\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "org", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/org.astro", "pathname": "/settings/org", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/public", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/public\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "public", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/public.astro", "pathname": "/settings/public", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/site/builder", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/site\\/builder\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "site", "dynamic": false, "spread": false }], [{ "content": "builder", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/site/builder.astro", "pathname": "/settings/site/builder", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/site", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/site\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "site", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/site.astro", "pathname": "/settings/site", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/social", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/social\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "social", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/social.astro", "pathname": "/settings/social", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/theme", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/theme\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "theme", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/theme.astro", "pathname": "/settings/theme", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/update", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/update\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "update", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/update.astro", "pathname": "/settings/update", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings/web", "isIndex": false, "type": "page", "pattern": "^\\/settings\\/web\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }], [{ "content": "web", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/web.astro", "pathname": "/settings/web", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/settings", "isIndex": true, "type": "page", "pattern": "^\\/settings\\/?$", "segments": [[{ "content": "settings", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/settings/index.astro", "pathname": "/settings", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/setup", "isIndex": false, "type": "page", "pattern": "^\\/setup\\/?$", "segments": [[{ "content": "setup", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/setup.astro", "pathname": "/setup", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/site", "isIndex": false, "type": "page", "pattern": "^\\/site\\/?$", "segments": [[{ "content": "site", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/site.astro", "pathname": "/site", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/sitemap.xml", "isIndex": false, "type": "endpoint", "pattern": "^\\/sitemap\\.xml$", "segments": [[{ "content": "sitemap.xml", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/sitemap.xml.ts", "pathname": "/sitemap.xml", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/usage", "isIndex": false, "type": "page", "pattern": "^\\/usage\\/?$", "segments": [[{ "content": "usage", "dynamic": false, "spread": false }]], "params": [], "component": "src/pages/usage.astro", "pathname": "/usage", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/[sitepage]", "isIndex": false, "type": "page", "pattern": "^\\/([^/]+?)\\/?$", "segments": [[{ "content": "sitepage", "dynamic": true, "spread": false }]], "params": ["sitepage"], "component": "src/pages/[sitepage].astro", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }, { "file": "", "links": [], "scripts": [], "styles": [], "routeData": { "route": "/", "isIndex": true, "type": "page", "pattern": "^\\/$", "segments": [], "params": [], "component": "src/pages/index.astro", "pathname": "/", "prerender": false, "fallbackRoutes": [], "distURL": [], "origin": "project", "_meta": { "trailingSlash": "ignore" } } }];
serializedData.map(deserializeRouteInfo);
const _page0 = () => import("./image-passthrough-endpoint_DqBf-fGq.mjs").then((n) => n.i);
const _page1 = () => import("./jwks_CsiS37L0.mjs");
const _page2 = () => import("./openid-configuration_D2KRfFkx.mjs");
const _page3 = () => import("./404_CdtlpKor.mjs");
const _page4 = () => import("./account_CZYO80Z3.mjs");
const _page5 = () => import("./export_DhYMBBBF.mjs");
const _page6 = () => import("./yayoi_Do_7-xzO.mjs");
const _page7 = () => import("./index_DWkzmmrj.mjs");
const _page8 = () => import("./activate_BIr1iWVb.mjs");
const _page9 = () => import("./data_RW7rPozP.mjs");
const _page10 = () => import("./inbound_D8OdjjQX.mjs");
const _page11 = () => import("./manage_BZ9T9MRc.mjs");
const _page12 = () => import("./asset_qp3aflJm.mjs");
const _page13 = () => import("./closure_D7GQv1nu.mjs");
const _page14 = () => import("./import-csv_9M_3AcD2.mjs");
const _page15 = () => import("./journal_BIVIK669.mjs");
const _page16 = () => import("./suggest-account_B6ODq2zF.mjs");
const _page17 = () => import("./wallet_iGeoVnNd.mjs");
const _page18 = () => import("./activity_DRTgP70B.mjs");
const _page19 = () => import("./agent-actions_CTATwLl9.mjs");
const _page20 = () => import("./app-ask_BMNCj5zs.mjs");
const _page21 = () => import("./app-audit_B-Vv-fD2.mjs");
const _page22 = () => import("./app-drafts_BopBBcJk.mjs");
const _page23 = () => import("./app-edit_BjPFuSQ_.mjs");
const _page24 = () => import("./app-export_C3csFgos.mjs");
const _page25 = () => import("./app-from-csv_B_tBfFum.mjs");
const _page26 = () => import("./app-run_-UPliDj9.mjs");
const _page27 = () => import("./relay_CxhOqFAf.mjs");
const _page28 = () => import("./callback_DpedW5tD.mjs");
const _page29 = () => import("./start_D-lvWP5e.mjs");
const _page30 = () => import("./autopilot_D3TD452_.mjs");
const _page31 = () => import("./backup_CgKPIxoF.mjs");
const _page32 = () => import("./start_C2x8fgIB.mjs");
const _page33 = () => import("./capabilities_DVtvl0yu.mjs");
const _page34 = () => import("./stream_BPvRaCLC.mjs");
const _page35 = () => import("./chat_BirWhDop.mjs");
const _page36 = () => import("./chat-sessions_DvMKuFfu.mjs");
const _page37 = () => import("./connectors_DCZpf05V.mjs");
const _page38 = () => import("./consent_B25LKNHa.mjs");
const _page39 = () => import("./contact_D12UwxHu.mjs");
const _page40 = () => import("./drain_xD4nBjF9.mjs");
const _page41 = () => import("./data_BwSfQOwj.mjs");
const _page42 = () => import("./directory_Ck_EAAYN.mjs");
const _page43 = () => import("./callback_BUtf94SN.mjs");
const _page44 = () => import("./start_ClHEzLou.mjs");
const _page45 = () => import("./panel_BhpSlbEx.mjs");
const _page46 = () => import("./register_Qw3cy7Z9.mjs");
const _page47 = () => import("./setup_D3RL6TNP.mjs");
const _page48 = () => import("./docs_DOtpg0iD.mjs");
const _page49 = () => import("./callback_Bmfc8sOl.mjs");
const _page50 = () => import("./start_Ds1nKbQb.mjs");
const _page51 = () => import("./drive_YcFmcLRv.mjs");
const _page52 = () => import("./apply_DBRgxaZk.mjs");
const _page53 = () => import("./pay_CO4iitbK.mjs");
const _page54 = () => import("./event_BkeJHqow.mjs");
const _page55 = () => import("./_appId__B26EzPOg.mjs");
const _page56 = () => import("./ext-token_ByiK7ilS.mjs");
const _page57 = () => import("./feedback_CpHhzVpv.mjs");
const _page58 = () => import("./files_C-pKBMdW.mjs");
const _page59 = () => import("./callback_CVyXijPZ.mjs");
const _page60 = () => import("./start_w2r_F4Md.mjs");
const _page61 = () => import("./wif-handoff_BoL9a7j0.mjs");
const _page62 = () => import("./google_Xt3x1jns.mjs");
const _page63 = () => import("./import_CZ7l3z9n.mjs");
const _page64 = () => import("./_connector__DoLh4eHl.mjs");
const _page65 = () => import("./invoices_CLFZSGfs.mjs");
const _page66 = () => import("./join_O5UKR3_t.mjs");
const _page67 = () => import("./keys_BgpJhF8Q.mjs");
const _page68 = () => import("./setup_56rvIvYc.mjs");
const _page69 = () => import("./login_Dw8MVy9o.mjs");
const _page70 = () => import("./logo_PmNbp4ae.mjs");
const _page71 = () => import("./mascot_B_nQ6xBw.mjs");
const _page72 = () => import("./leave-request_THTu3Wmq.mjs");
const _page73 = () => import("./profile_BsXA9GVu.mjs");
const _page74 = () => import("./members_OtIRhj5S.mjs");
const _page75 = () => import("./membership_DUVItBZo.mjs");
const _page76 = () => import("./nav_BNqpVx56.mjs");
const _page77 = () => import("./news_CsO4lCUS.mjs");
const _page78 = () => import("./notifications_DiC7Kknj.mjs");
const _page79 = () => import("./callback_CReYBCLr.mjs");
const _page80 = () => import("./start_vWiYStTL.mjs");
const _page81 = () => import("./_slug__BnL5vl3G.mjs");
const _page82 = () => import("./personal_C7kOkFC9.mjs");
const _page83 = () => import("./plan-request_DoG7SebL.mjs");
const _page84 = () => import("./precheck_BsyTppac.mjs");
const _page85 = () => import("./projects_yYQYevrY.mjs");
const _page86 = () => import("./manage_CPalVKPe.mjs");
const _page87 = () => import("./push_BXQqf4Gm.mjs");
const _page88 = () => import("./pv_BfPjq1KF.mjs");
const _page89 = () => import("./report_CEJSGNiW.mjs");
const _page90 = () => import("./kpi_DokKoWTU.mjs");
const _page91 = () => import("./review_fKvzgzHh.mjs");
const _page92 = () => import("./schedule-sync_BIWleL4u.mjs");
const _page93 = () => import("./scheduled-tasks_BnfVELZh.mjs");
const _page94 = () => import("./self-check_Bzu9x6BF.mjs");
const _page95 = () => import("./settings_Dj0owle_.mjs");
const _page96 = () => import("./join_CjwoQYl2.mjs");
const _page97 = () => import("./stripe-webhook_Chhyp1RJ.mjs");
const _page98 = () => import("./site_BCazqZ-d.mjs");
const _page99 = () => import("./_id__BYOxSJJm.mjs");
const _page100 = () => import("./site-media_CavC8HSS.mjs");
const _page101 = () => import("./site-unlock_oK1YVI0Y.mjs");
const _page102 = () => import("./skills_qjKiY_wC.mjs");
const _page103 = () => import("./setup_gfMxpIWg.mjs");
const _page104 = () => import("./store_CouvoScR.mjs");
const _page105 = () => import("./translate_Dd1OFe7o.mjs");
const _page106 = () => import("./tts_Db2cH1GN.mjs");
const _page107 = () => import("./tx_CishHCPP.mjs");
const _page108 = () => import("./update_BvA_Ky4n.mjs");
const _page109 = () => import("./usage_B0fwUy9k.mjs");
const _page110 = () => import("./usage-report_CRJRRc1f.mjs");
const _page111 = () => import("./_id__Bh14KCkH.mjs");
const _page112 = () => import("./approvals_DjgmB438.mjs");
const _page113 = () => import("./apps_lPoCwOeI.mjs");
const _page114 = () => import("./backup_CA2rjV0w.mjs");
const _page115 = () => import("./billing_Dja0L9Cw.mjs");
const _page116 = () => import("./calendar_CtlIXkDQ.mjs");
const _page117 = () => import("./chat_BreP2uKn.mjs");
const _page118 = () => import("./consent_BW1SoCHu.mjs");
const _page119 = () => import("./dashboard_CdcVuC36.mjs");
const _page120 = () => import("./diagnostics_CXH5RJRo.mjs");
const _page121 = () => import("./directory_BKnDDhaP.mjs");
const _page122 = () => import("./drive_MRHr3c5s.mjs");
const _page123 = () => import("./_slug__ChfDlqwT.mjs");
const _page124 = () => import("./_slug__DgW_Trzy.mjs");
const _page125 = () => import("./events_C-sCuq75.mjs");
const _page126 = () => import("./favicon_CO8aEwKh.mjs");
const _page127 = () => import("./_id__DSOX6G9E.mjs");
const _page128 = () => import("./index_BP1RQrVt.mjs");
const _page129 = () => import("./forbidden_I7PAahIg.mjs");
const _page130 = () => import("./gmail_jLL_MVzB.mjs");
const _page131 = () => import("./_id__CIYlyR_5.mjs");
const _page132 = () => import("./import_DIsOMSiI.mjs");
const _page133 = () => import("./invoices_xlXW4HLG.mjs");
const _page134 = () => import("./join_DiVRcoTi.mjs");
const _page135 = () => import("./legal_DByx-JA_.mjs");
const _page136 = () => import("./login_DO2HCfDo.mjs");
const _page137 = () => import("./craft-career_CdAxS53l.mjs");
const _page138 = () => import("./_slug__BEjhZCsT.mjs");
const _page139 = () => import("./meet_DoN_0rwb.mjs");
const _page140 = () => import("./membership_Bj0Hwkc7.mjs");
const _page141 = () => import("./minutes_ClYC3rSj.mjs");
const _page142 = () => import("./my-events_NafSdGgl.mjs");
const _page143 = () => import("./_slug__BqDikAY6.mjs");
const _page144 = () => import("./news_C09jt2aH.mjs");
const _page145 = () => import("./_slug__BNAg91lz.mjs");
const _page146 = () => import("./personal_Cc5VF-UZ.mjs");
const _page147 = () => import("./_id__4enW4kWY.mjs");
const _page148 = () => import("./projects_Cskoou9Q.mjs");
const _page149 = () => import("./reports_MsXsVsXs.mjs");
const _page150 = () => import("./review_DSl3Bvxy.mjs");
const _page151 = () => import("./robots_m-h_0FAd.mjs");
const _page152 = () => import("./schedule_BwFtXamt.mjs");
const _page153 = () => import("./a2a_SObwu-Og.mjs");
const _page154 = () => import("./advanced_DkqIoV8t.mjs");
const _page155 = () => import("./agent_DMokHQiI.mjs");
const _page156 = () => import("./analytics_BVEpTNbm.mjs");
const _page157 = () => import("./connectors_DNH3uZf9.mjs");
const _page158 = () => import("./directory_Du-_OTVr.mjs");
const _page159 = () => import("./display_DAh2pgTY.mjs");
const _page160 = () => import("./domain_C4yrIOYg.mjs");
const _page161 = () => import("./events_CBBtS9Xp.mjs");
const _page162 = () => import("./google-setup_D5fSYCqe.mjs");
const _page163 = () => import("./inbox_BagChmH7.mjs");
const _page164 = () => import("./integrations_BcJXjI2K.mjs");
const _page165 = () => import("./keys_C8Bh-3dX.mjs");
const _page166 = () => import("./media_BEUaKyO_.mjs");
const _page167 = () => import("./members_BpJBodrH.mjs");
const _page168 = () => import("./messaging_U1IMpxfa.mjs");
const _page169 = () => import("./nav_1_0syb4v.mjs");
const _page170 = () => import("./news_CFn3tkzP.mjs");
const _page171 = () => import("./ops_rqQjBUPy.mjs");
const _page172 = () => import("./org_BTOivk5I.mjs");
const _page173 = () => import("./public_PdQzzk06.mjs");
const _page174 = () => import("./builder_XL09nYHK.mjs");
const _page175 = () => import("./site_KUxgnNoo.mjs");
const _page176 = () => import("./social_Dv9oMgt4.mjs");
const _page177 = () => import("./theme_BNMb-hA1.mjs");
const _page178 = () => import("./update_BixDP8Gj.mjs");
const _page179 = () => import("./web_Ci_n075i.mjs");
const _page180 = () => import("./index_Jy2ZVUka.mjs");
const _page181 = () => import("./setup_CTclNWQR.mjs");
const _page182 = () => import("./site_CtIhngP_.mjs");
const _page183 = () => import("./sitemap_B8fIvc3H.mjs");
const _page184 = () => import("./usage_DJoPSoGY.mjs");
const _page185 = () => import("./_sitepage__cMyBef-L.mjs");
const _page186 = () => import("./index_BOzQeePR.mjs");
const pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-passthrough-endpoint.js", _page0],
  ["src/pages/.well-known/jwks.json.ts", _page1],
  ["src/pages/.well-known/openid-configuration.ts", _page2],
  ["src/pages/404.astro", _page3],
  ["src/pages/account.astro", _page4],
  ["src/pages/accounting/export.csv.ts", _page5],
  ["src/pages/accounting/yayoi.csv.ts", _page6],
  ["src/pages/accounting/index.astro", _page7],
  ["src/pages/activate.astro", _page8],
  ["src/pages/admin/data.astro", _page9],
  ["src/pages/api/a2a/inbound.ts", _page10],
  ["src/pages/api/a2a/manage.ts", _page11],
  ["src/pages/api/accounting/asset.ts", _page12],
  ["src/pages/api/accounting/closure.ts", _page13],
  ["src/pages/api/accounting/import-csv.ts", _page14],
  ["src/pages/api/accounting/journal.ts", _page15],
  ["src/pages/api/accounting/suggest-account.ts", _page16],
  ["src/pages/api/accounting/wallet.ts", _page17],
  ["src/pages/api/activity.ts", _page18],
  ["src/pages/api/agent-actions.ts", _page19],
  ["src/pages/api/app-ask.ts", _page20],
  ["src/pages/api/app-audit.ts", _page21],
  ["src/pages/api/app-drafts.ts", _page22],
  ["src/pages/api/app-edit.ts", _page23],
  ["src/pages/api/app-export.ts", _page24],
  ["src/pages/api/app-from-csv.ts", _page25],
  ["src/pages/api/app-run.ts", _page26],
  ["src/pages/api/auth/google/relay.ts", _page27],
  ["src/pages/api/auth/[provider]/callback.ts", _page28],
  ["src/pages/api/auth/[provider]/start.ts", _page29],
  ["src/pages/api/autopilot.ts", _page30],
  ["src/pages/api/backup.ts", _page31],
  ["src/pages/api/billing/start.ts", _page32],
  ["src/pages/api/capabilities.ts", _page33],
  ["src/pages/api/chat/stream.ts", _page34],
  ["src/pages/api/chat.ts", _page35],
  ["src/pages/api/chat-sessions.ts", _page36],
  ["src/pages/api/connectors.ts", _page37],
  ["src/pages/api/consent.ts", _page38],
  ["src/pages/api/contact.ts", _page39],
  ["src/pages/api/cron/drain.ts", _page40],
  ["src/pages/api/data.ts", _page41],
  ["src/pages/api/directory.ts", _page42],
  ["src/pages/api/discord/link/callback.ts", _page43],
  ["src/pages/api/discord/link/start.ts", _page44],
  ["src/pages/api/discord/panel.ts", _page45],
  ["src/pages/api/discord/register.ts", _page46],
  ["src/pages/api/discord/setup.ts", _page47],
  ["src/pages/api/docs.ts", _page48],
  ["src/pages/api/drive/callback.ts", _page49],
  ["src/pages/api/drive/start.ts", _page50],
  ["src/pages/api/drive.ts", _page51],
  ["src/pages/api/event/apply.ts", _page52],
  ["src/pages/api/event/pay.ts", _page53],
  ["src/pages/api/event.ts", _page54],
  ["src/pages/api/ext/[appId].ts", _page55],
  ["src/pages/api/ext-token.ts", _page56],
  ["src/pages/api/feedback.ts", _page57],
  ["src/pages/api/files.ts", _page58],
  ["src/pages/api/google/callback.ts", _page59],
  ["src/pages/api/google/start.ts", _page60],
  ["src/pages/api/google/wif-handoff.ts", _page61],
  ["src/pages/api/google.ts", _page62],
  ["src/pages/api/import.ts", _page63],
  ["src/pages/api/inbound/[connector].ts", _page64],
  ["src/pages/api/invoices.ts", _page65],
  ["src/pages/api/join.ts", _page66],
  ["src/pages/api/keys.ts", _page67],
  ["src/pages/api/line/setup.ts", _page68],
  ["src/pages/api/login.ts", _page69],
  ["src/pages/api/logo.ts", _page70],
  ["src/pages/api/mascot.ts", _page71],
  ["src/pages/api/me/leave-request.ts", _page72],
  ["src/pages/api/me/profile.ts", _page73],
  ["src/pages/api/members.ts", _page74],
  ["src/pages/api/membership.ts", _page75],
  ["src/pages/api/nav.ts", _page76],
  ["src/pages/api/news.ts", _page77],
  ["src/pages/api/notifications.ts", _page78],
  ["src/pages/api/notion/oauth/callback.ts", _page79],
  ["src/pages/api/notion/oauth/start.ts", _page80],
  ["src/pages/api/p/[slug].ts", _page81],
  ["src/pages/api/personal.ts", _page82],
  ["src/pages/api/plan-request.ts", _page83],
  ["src/pages/api/precheck.ts", _page84],
  ["src/pages/api/projects.ts", _page85],
  ["src/pages/api/public/manage.ts", _page86],
  ["src/pages/api/push.ts", _page87],
  ["src/pages/api/pv.ts", _page88],
  ["src/pages/api/report.ts", _page89],
  ["src/pages/api/reports/kpi.ts", _page90],
  ["src/pages/api/review.ts", _page91],
  ["src/pages/api/schedule-sync.ts", _page92],
  ["src/pages/api/scheduled-tasks.ts", _page93],
  ["src/pages/api/self-check.ts", _page94],
  ["src/pages/api/settings.ts", _page95],
  ["src/pages/api/site/join.ts", _page96],
  ["src/pages/api/site/stripe-webhook.ts", _page97],
  ["src/pages/api/site.ts", _page98],
  ["src/pages/api/site-media/[id].ts", _page99],
  ["src/pages/api/site-media.ts", _page100],
  ["src/pages/api/site-unlock.ts", _page101],
  ["src/pages/api/skills.ts", _page102],
  ["src/pages/api/slack/setup.ts", _page103],
  ["src/pages/api/store.ts", _page104],
  ["src/pages/api/translate.ts", _page105],
  ["src/pages/api/tts.ts", _page106],
  ["src/pages/api/tx.ts", _page107],
  ["src/pages/api/update.ts", _page108],
  ["src/pages/api/usage.ts", _page109],
  ["src/pages/api/usage-report.ts", _page110],
  ["src/pages/app/[id].astro", _page111],
  ["src/pages/approvals.astro", _page112],
  ["src/pages/apps.astro", _page113],
  ["src/pages/backup.astro", _page114],
  ["src/pages/billing.astro", _page115],
  ["src/pages/calendar.astro", _page116],
  ["src/pages/chat.astro", _page117],
  ["src/pages/consent.astro", _page118],
  ["src/pages/dashboard.astro", _page119],
  ["src/pages/diagnostics.astro", _page120],
  ["src/pages/directory.astro", _page121],
  ["src/pages/drive.astro", _page122],
  ["src/pages/embed/[slug].astro", _page123],
  ["src/pages/event/[slug].astro", _page124],
  ["src/pages/events.astro", _page125],
  ["src/pages/favicon.ico.ts", _page126],
  ["src/pages/files/[id].ts", _page127],
  ["src/pages/files/index.astro", _page128],
  ["src/pages/forbidden.astro", _page129],
  ["src/pages/gmail.astro", _page130],
  ["src/pages/hub/[id].astro", _page131],
  ["src/pages/import.astro", _page132],
  ["src/pages/invoices.astro", _page133],
  ["src/pages/join.astro", _page134],
  ["src/pages/legal.astro", _page135],
  ["src/pages/login.astro", _page136],
  ["src/pages/lp/craft-career.astro", _page137],
  ["src/pages/lp/[slug].astro", _page138],
  ["src/pages/meet.astro", _page139],
  ["src/pages/membership.astro", _page140],
  ["src/pages/minutes.astro", _page141],
  ["src/pages/my-events.astro", _page142],
  ["src/pages/news/[slug].astro", _page143],
  ["src/pages/news.astro", _page144],
  ["src/pages/p/[slug].astro", _page145],
  ["src/pages/personal.astro", _page146],
  ["src/pages/project/[id].astro", _page147],
  ["src/pages/projects.astro", _page148],
  ["src/pages/reports.astro", _page149],
  ["src/pages/review.astro", _page150],
  ["src/pages/robots.txt.ts", _page151],
  ["src/pages/schedule.astro", _page152],
  ["src/pages/settings/a2a.astro", _page153],
  ["src/pages/settings/advanced.astro", _page154],
  ["src/pages/settings/agent.astro", _page155],
  ["src/pages/settings/analytics.astro", _page156],
  ["src/pages/settings/connectors.astro", _page157],
  ["src/pages/settings/directory.astro", _page158],
  ["src/pages/settings/display.astro", _page159],
  ["src/pages/settings/domain.astro", _page160],
  ["src/pages/settings/events.astro", _page161],
  ["src/pages/settings/google-setup.astro", _page162],
  ["src/pages/settings/inbox.astro", _page163],
  ["src/pages/settings/integrations.astro", _page164],
  ["src/pages/settings/keys.astro", _page165],
  ["src/pages/settings/media.astro", _page166],
  ["src/pages/settings/members.astro", _page167],
  ["src/pages/settings/messaging.astro", _page168],
  ["src/pages/settings/nav.astro", _page169],
  ["src/pages/settings/news.astro", _page170],
  ["src/pages/settings/ops.astro", _page171],
  ["src/pages/settings/org.astro", _page172],
  ["src/pages/settings/public.astro", _page173],
  ["src/pages/settings/site/builder.astro", _page174],
  ["src/pages/settings/site.astro", _page175],
  ["src/pages/settings/social.astro", _page176],
  ["src/pages/settings/theme.astro", _page177],
  ["src/pages/settings/update.astro", _page178],
  ["src/pages/settings/web.astro", _page179],
  ["src/pages/settings/index.astro", _page180],
  ["src/pages/setup.astro", _page181],
  ["src/pages/site.astro", _page182],
  ["src/pages/sitemap.xml.ts", _page183],
  ["src/pages/usage.astro", _page184],
  ["src/pages/[sitepage].astro", _page185],
  ["src/pages/index.astro", _page186]
]);
const _manifest = deserializeManifest({"rootDir":"file:///home/runner/work/baku-office/baku-office/apps/client/","cacheDir":"file:///home/runner/work/baku-office/baku-office/apps/client/node_modules/.astro/","outDir":"file:///home/runner/work/baku-office/baku-office/apps/client/dist/","srcDir":"file:///home/runner/work/baku-office/baku-office/apps/client/src/","publicDir":"file:///home/runner/work/baku-office/baku-office/apps/client/public/","buildClientDir":"file:///home/runner/work/baku-office/baku-office/apps/client/dist/client/","buildServerDir":"file:///home/runner/work/baku-office/baku-office/apps/client/dist/server/","adapterName":"@astrojs/cloudflare","assetsDir":"_astro","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","distURL":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/_image","component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-passthrough-endpoint.js","params":[],"pathname":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"type":"endpoint","prerender":false,"fallbackRoutes":[],"distURL":[],"isIndex":false,"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/.well-known/jwks.json","isIndex":false,"type":"endpoint","pattern":"^\\/\\.well-known\\/jwks\\.json$","segments":[[{"content":".well-known","dynamic":false,"spread":false}],[{"content":"jwks.json","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/.well-known/jwks.json.ts","pathname":"/.well-known/jwks.json","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/.well-known/openid-configuration","isIndex":false,"type":"endpoint","pattern":"^\\/\\.well-known\\/openid-configuration\\/?$","segments":[[{"content":".well-known","dynamic":false,"spread":false}],[{"content":"openid-configuration","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/.well-known/openid-configuration.ts","pathname":"/.well-known/openid-configuration","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":":root{color-scheme:dark}html,body{margin:0;height:100%}body{display:grid;place-items:center;min-height:100dvh;padding:24px;background:#1b1d22;color:#f2f1f4;font-family:-apple-system,Hiragino Sans,Noto Sans JP,system-ui,sans-serif}.card[data-astro-cid-zetdm5md]{text-align:center;max-width:420px}.code[data-astro-cid-zetdm5md]{font-size:3rem;font-weight:800;color:#c9a86a;margin:0 0 .2em}h1[data-astro-cid-zetdm5md]{font-size:1.25rem;margin:0 0 .6em}p[data-astro-cid-zetdm5md]{color:#9a9ca3;line-height:1.7;margin:0 0 1.4em}.btn[data-astro-cid-zetdm5md]{display:inline-block;padding:12px 22px;border-radius:12px;font-weight:700;background:#c9a86a;color:#1b1d22;text-decoration:none}.btn[data-astro-cid-zetdm5md].ghost{background:transparent;color:#c9a86a;border:1px solid #C9A86A;margin-left:8px}\n"}],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404\\/?$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/account","isIndex":false,"type":"page","pattern":"^\\/account\\/?$","segments":[[{"content":"account","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/account.astro","pathname":"/account","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/accounting/export.csv","isIndex":false,"type":"endpoint","pattern":"^\\/accounting\\/export\\.csv$","segments":[[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"export.csv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/accounting/export.csv.ts","pathname":"/accounting/export.csv","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/accounting/yayoi.csv","isIndex":false,"type":"endpoint","pattern":"^\\/accounting\\/yayoi\\.csv$","segments":[[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"yayoi.csv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/accounting/yayoi.csv.ts","pathname":"/accounting/yayoi.csv","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".section-tabs[data-astro-cid-2ypbjnip]{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 1rem;flex-wrap:wrap}.section-tab[data-astro-cid-2ypbjnip]{padding:9px 16px;font-size:.9rem;font-weight:600;color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.section-tab[data-astro-cid-2ypbjnip]:hover{color:var(--ink-2)}.section-tab[data-astro-cid-2ypbjnip].on{color:var(--brand-strong);border-bottom-color:var(--brand)}\n.bal-row[data-astro-cid-cmolzfmm]{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:12px;margin:1rem 0 .4rem}.bal-card[data-astro-cid-cmolzfmm]{background:var(--surface);border:1px solid var(--line-strong);border-radius:var(--r-md);padding:16px 18px;box-shadow:var(--shadow-sm)}.bal-name[data-astro-cid-cmolzfmm]{color:var(--muted);font-size:.95rem;font-weight:600}.bal-amt[data-astro-cid-cmolzfmm]{font-size:1.7rem;font-weight:800;letter-spacing:-.02em;margin-top:2px;font-feature-settings:\"tnum\" 1}.rec-modes[data-astro-cid-cmolzfmm]{display:grid;grid-template-columns:1fr 1fr;gap:12px}.rec-mode[data-astro-cid-cmolzfmm]{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:76px;border:2px solid var(--line-strong);border-radius:var(--r-md);background:var(--surface);color:var(--ink);font-size:1.15rem;font-weight:800;cursor:pointer;transition:transform .1s,border-color .15s,background .15s}.rec-mode[data-astro-cid-cmolzfmm] small[data-astro-cid-cmolzfmm]{font-size:.8rem;font-weight:500;color:var(--muted)}.rec-mode[data-astro-cid-cmolzfmm] .rm-sign[data-astro-cid-cmolzfmm]{font-size:1.4rem;line-height:1}.rec-mode[data-astro-cid-cmolzfmm]:hover{transform:translateY(-2px)}.rec-mode[data-astro-cid-cmolzfmm].income:hover,.rec-mode[data-astro-cid-cmolzfmm].income[aria-pressed=true]{border-color:var(--ok);background:var(--ok-soft)}.rec-mode[data-astro-cid-cmolzfmm].expense:hover,.rec-mode[data-astro-cid-cmolzfmm].expense[aria-pressed=true]{border-color:var(--danger);background:var(--danger-soft)}.rec-label[data-astro-cid-cmolzfmm]{font-weight:700;font-size:1.05rem;margin:0 0 .6rem;padding:.5rem .8rem;border-radius:var(--r-sm);background:var(--surface-2)}.rec-transfer[data-astro-cid-cmolzfmm]{background:var(--surface-2);border:1px dashed var(--line-strong)}.rec-transfer[data-astro-cid-cmolzfmm]>summary[data-astro-cid-cmolzfmm]{color:var(--muted)}@media(max-width:420px){.rec-mode[data-astro-cid-cmolzfmm]{min-height:68px;font-size:1.05rem}}.book-mode[data-astro-cid-cmolzfmm]{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:.2rem 0 1rem}.bm-opt[data-astro-cid-cmolzfmm]{min-height:40px;padding:0 .9rem;border:1px solid var(--line-strong);background:var(--surface);color:var(--ink);border-radius:var(--r-pill);font-weight:700;cursor:pointer}.bm-opt[data-astro-cid-cmolzfmm].on{background:var(--brand);color:var(--on-brand);border-color:var(--brand-strong)}.u-warn[data-astro-cid-cmolzfmm]{color:var(--warn);font-weight:700}\n"}],"routeData":{"route":"/accounting","isIndex":true,"type":"page","pattern":"^\\/accounting\\/?$","segments":[[{"content":"accounting","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/accounting/index.astro","pathname":"/accounting","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/activate","isIndex":false,"type":"page","pattern":"^\\/activate\\/?$","segments":[[{"content":"activate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/activate.astro","pathname":"/activate","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":"body{font-family:system-ui,sans-serif;max-width:920px;margin:0 auto;color:#1c2530}header[data-astro-cid-jgkmvpmt]{background:#0f172a;color:#fff;padding:.8rem 1.25rem}header[data-astro-cid-jgkmvpmt] a[data-astro-cid-jgkmvpmt]{color:#cbd5e1;text-decoration:none;margin-right:1rem;font-size:.9rem}main[data-astro-cid-jgkmvpmt]{padding:1.25rem}h2[data-astro-cid-jgkmvpmt]{border-bottom:2px solid #e2e8f0;padding-bottom:.3rem;margin-top:1.8rem}table[data-astro-cid-jgkmvpmt]{border-collapse:collapse;width:100%;font-size:.88rem}th[data-astro-cid-jgkmvpmt],td[data-astro-cid-jgkmvpmt]{border:1px solid #e2e8f0;padding:.35rem .5rem}th[data-astro-cid-jgkmvpmt]{background:#f8fafc}button[data-astro-cid-jgkmvpmt]{padding:.25rem .55rem;border:0;border-radius:6px;cursor:pointer}.muted[data-astro-cid-jgkmvpmt]{color:#64748b}\n"}],"routeData":{"route":"/admin/data","isIndex":false,"type":"page","pattern":"^\\/admin\\/data\\/?$","segments":[[{"content":"admin","dynamic":false,"spread":false}],[{"content":"data","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/admin/data.astro","pathname":"/admin/data","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/a2a/inbound","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/a2a\\/inbound\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"a2a","dynamic":false,"spread":false}],[{"content":"inbound","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/a2a/inbound.ts","pathname":"/api/a2a/inbound","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/a2a/manage","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/a2a\\/manage\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"a2a","dynamic":false,"spread":false}],[{"content":"manage","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/a2a/manage.ts","pathname":"/api/a2a/manage","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/accounting/asset","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/accounting\\/asset\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"asset","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/accounting/asset.ts","pathname":"/api/accounting/asset","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/accounting/closure","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/accounting\\/closure\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"closure","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/accounting/closure.ts","pathname":"/api/accounting/closure","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/accounting/import-csv","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/accounting\\/import-csv\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"import-csv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/accounting/import-csv.ts","pathname":"/api/accounting/import-csv","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/accounting/journal","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/accounting\\/journal\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"journal","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/accounting/journal.ts","pathname":"/api/accounting/journal","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/accounting/suggest-account","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/accounting\\/suggest-account\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"suggest-account","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/accounting/suggest-account.ts","pathname":"/api/accounting/suggest-account","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/accounting/wallet","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/accounting\\/wallet\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"accounting","dynamic":false,"spread":false}],[{"content":"wallet","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/accounting/wallet.ts","pathname":"/api/accounting/wallet","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/activity","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/activity\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"activity","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/activity.ts","pathname":"/api/activity","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/agent-actions","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/agent-actions\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"agent-actions","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/agent-actions.ts","pathname":"/api/agent-actions","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-ask","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-ask\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-ask","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-ask.ts","pathname":"/api/app-ask","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-audit","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-audit\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-audit","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-audit.ts","pathname":"/api/app-audit","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-drafts","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-drafts\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-drafts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-drafts.ts","pathname":"/api/app-drafts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-edit","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-edit\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-edit","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-edit.ts","pathname":"/api/app-edit","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-export","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-export\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-export","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-export.ts","pathname":"/api/app-export","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-from-csv","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-from-csv\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-from-csv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-from-csv.ts","pathname":"/api/app-from-csv","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/app-run","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/app-run\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"app-run","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/app-run.ts","pathname":"/api/app-run","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/auth/google/relay","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/google\\/relay\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"google","dynamic":false,"spread":false}],[{"content":"relay","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/google/relay.ts","pathname":"/api/auth/google/relay","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/auth/[provider]/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/([^/]+?)\\/callback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"provider","dynamic":true,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":["provider"],"component":"src/pages/api/auth/[provider]/callback.ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/auth/[provider]/start","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/([^/]+?)\\/start\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"provider","dynamic":true,"spread":false}],[{"content":"start","dynamic":false,"spread":false}]],"params":["provider"],"component":"src/pages/api/auth/[provider]/start.ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/autopilot","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/autopilot\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"autopilot","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/autopilot.ts","pathname":"/api/autopilot","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/backup","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/backup\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"backup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/backup.ts","pathname":"/api/backup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/billing/start","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/billing\\/start\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"billing","dynamic":false,"spread":false}],[{"content":"start","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/billing/start.ts","pathname":"/api/billing/start","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/capabilities","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/capabilities\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"capabilities","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/capabilities.ts","pathname":"/api/capabilities","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/chat/stream","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/chat\\/stream\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"chat","dynamic":false,"spread":false}],[{"content":"stream","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/chat/stream.ts","pathname":"/api/chat/stream","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/chat","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/chat\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/chat.ts","pathname":"/api/chat","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/chat-sessions","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/chat-sessions\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"chat-sessions","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/chat-sessions.ts","pathname":"/api/chat-sessions","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/connectors","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/connectors\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"connectors","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/connectors.ts","pathname":"/api/connectors","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/consent","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/consent\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"consent","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/consent.ts","pathname":"/api/consent","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/contact","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/contact\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/contact.ts","pathname":"/api/contact","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/cron/drain","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/cron\\/drain\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"cron","dynamic":false,"spread":false}],[{"content":"drain","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/cron/drain.ts","pathname":"/api/cron/drain","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/data","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/data\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"data","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/data.ts","pathname":"/api/data","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/directory","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/directory\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"directory","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/directory.ts","pathname":"/api/directory","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/discord/link/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/discord\\/link\\/callback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"discord","dynamic":false,"spread":false}],[{"content":"link","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/discord/link/callback.ts","pathname":"/api/discord/link/callback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/discord/link/start","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/discord\\/link\\/start\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"discord","dynamic":false,"spread":false}],[{"content":"link","dynamic":false,"spread":false}],[{"content":"start","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/discord/link/start.ts","pathname":"/api/discord/link/start","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/discord/panel","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/discord\\/panel\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"discord","dynamic":false,"spread":false}],[{"content":"panel","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/discord/panel.ts","pathname":"/api/discord/panel","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/discord/register","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/discord\\/register\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"discord","dynamic":false,"spread":false}],[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/discord/register.ts","pathname":"/api/discord/register","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/discord/setup","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/discord\\/setup\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"discord","dynamic":false,"spread":false}],[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/discord/setup.ts","pathname":"/api/discord/setup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/docs","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/docs\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"docs","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/docs.ts","pathname":"/api/docs","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/drive/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/drive\\/callback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"drive","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/drive/callback.ts","pathname":"/api/drive/callback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/drive/start","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/drive\\/start\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"drive","dynamic":false,"spread":false}],[{"content":"start","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/drive/start.ts","pathname":"/api/drive/start","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/drive","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/drive\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"drive","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/drive.ts","pathname":"/api/drive","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/event/apply","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/event\\/apply\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"event","dynamic":false,"spread":false}],[{"content":"apply","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/event/apply.ts","pathname":"/api/event/apply","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/event/pay","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/event\\/pay\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"event","dynamic":false,"spread":false}],[{"content":"pay","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/event/pay.ts","pathname":"/api/event/pay","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/event","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/event\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"event","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/event.ts","pathname":"/api/event","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/ext/[appId]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ext\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ext","dynamic":false,"spread":false}],[{"content":"appId","dynamic":true,"spread":false}]],"params":["appId"],"component":"src/pages/api/ext/[appId].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/ext-token","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/ext-token\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"ext-token","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/ext-token.ts","pathname":"/api/ext-token","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/feedback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/feedback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"feedback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/feedback.ts","pathname":"/api/feedback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/files","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/files\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"files","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/files.ts","pathname":"/api/files","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/google/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/google\\/callback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"google","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/google/callback.ts","pathname":"/api/google/callback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/google/start","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/google\\/start\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"google","dynamic":false,"spread":false}],[{"content":"start","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/google/start.ts","pathname":"/api/google/start","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/google/wif-handoff","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/google\\/wif-handoff\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"google","dynamic":false,"spread":false}],[{"content":"wif-handoff","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/google/wif-handoff.ts","pathname":"/api/google/wif-handoff","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/google","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/google\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"google","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/google.ts","pathname":"/api/google","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/import","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/import\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"import","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/import.ts","pathname":"/api/import","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/inbound/[connector]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/inbound\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"inbound","dynamic":false,"spread":false}],[{"content":"connector","dynamic":true,"spread":false}]],"params":["connector"],"component":"src/pages/api/inbound/[connector].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/invoices","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/invoices\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"invoices","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/invoices.ts","pathname":"/api/invoices","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/join","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/join\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"join","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/join.ts","pathname":"/api/join","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/keys","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/keys\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"keys","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/keys.ts","pathname":"/api/keys","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/line/setup","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/line\\/setup\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"line","dynamic":false,"spread":false}],[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/line/setup.ts","pathname":"/api/line/setup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/login.ts","pathname":"/api/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/logo","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/logo\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"logo","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/logo.ts","pathname":"/api/logo","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/mascot","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/mascot\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"mascot","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/mascot.ts","pathname":"/api/mascot","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/me/leave-request","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/me\\/leave-request\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"me","dynamic":false,"spread":false}],[{"content":"leave-request","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/me/leave-request.ts","pathname":"/api/me/leave-request","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/me/profile","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/me\\/profile\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"me","dynamic":false,"spread":false}],[{"content":"profile","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/me/profile.ts","pathname":"/api/me/profile","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/members","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/members\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"members","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/members.ts","pathname":"/api/members","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/membership","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/membership\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"membership","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/membership.ts","pathname":"/api/membership","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/nav","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/nav\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"nav","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/nav.ts","pathname":"/api/nav","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/news","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/news\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"news","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/news.ts","pathname":"/api/news","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/notifications","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/notifications\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"notifications","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/notifications.ts","pathname":"/api/notifications","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/notion/oauth/callback","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/notion\\/oauth\\/callback\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"notion","dynamic":false,"spread":false}],[{"content":"oauth","dynamic":false,"spread":false}],[{"content":"callback","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/notion/oauth/callback.ts","pathname":"/api/notion/oauth/callback","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/notion/oauth/start","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/notion\\/oauth\\/start\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"notion","dynamic":false,"spread":false}],[{"content":"oauth","dynamic":false,"spread":false}],[{"content":"start","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/notion/oauth/start.ts","pathname":"/api/notion/oauth/start","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/p/[slug]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/p\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"p","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/api/p/[slug].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/personal","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/personal\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"personal","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/personal.ts","pathname":"/api/personal","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/plan-request","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/plan-request\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"plan-request","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/plan-request.ts","pathname":"/api/plan-request","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/precheck","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/precheck\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"precheck","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/precheck.ts","pathname":"/api/precheck","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/projects","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/projects\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/projects.ts","pathname":"/api/projects","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/public/manage","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/public\\/manage\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"public","dynamic":false,"spread":false}],[{"content":"manage","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/public/manage.ts","pathname":"/api/public/manage","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/push","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/push\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"push","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/push.ts","pathname":"/api/push","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/pv","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/pv\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"pv","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/pv.ts","pathname":"/api/pv","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/report","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/report\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"report","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/report.ts","pathname":"/api/report","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/reports/kpi","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/reports\\/kpi\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"reports","dynamic":false,"spread":false}],[{"content":"kpi","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/reports/kpi.ts","pathname":"/api/reports/kpi","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/review","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/review\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"review","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/review.ts","pathname":"/api/review","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/schedule-sync","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/schedule-sync\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"schedule-sync","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/schedule-sync.ts","pathname":"/api/schedule-sync","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/scheduled-tasks","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/scheduled-tasks\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"scheduled-tasks","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/scheduled-tasks.ts","pathname":"/api/scheduled-tasks","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/self-check","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/self-check\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"self-check","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/self-check.ts","pathname":"/api/self-check","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/settings","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/settings\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"settings","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/settings.ts","pathname":"/api/settings","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/site/join","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/site\\/join\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"site","dynamic":false,"spread":false}],[{"content":"join","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/site/join.ts","pathname":"/api/site/join","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/site/stripe-webhook","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/site\\/stripe-webhook\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"site","dynamic":false,"spread":false}],[{"content":"stripe-webhook","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/site/stripe-webhook.ts","pathname":"/api/site/stripe-webhook","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/site","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/site\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"site","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/site.ts","pathname":"/api/site","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/site-media/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/site-media\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"site-media","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/site-media/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/site-media","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/site-media\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"site-media","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/site-media.ts","pathname":"/api/site-media","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/site-unlock","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/site-unlock\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"site-unlock","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/site-unlock.ts","pathname":"/api/site-unlock","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/skills","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/skills\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"skills","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/skills.ts","pathname":"/api/skills","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/slack/setup","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/slack\\/setup\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"slack","dynamic":false,"spread":false}],[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/slack/setup.ts","pathname":"/api/slack/setup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/store","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/store\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"store","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/store.ts","pathname":"/api/store","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/translate","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/translate\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"translate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/translate.ts","pathname":"/api/translate","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/tts","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/tts\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tts","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/tts.ts","pathname":"/api/tts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/tx","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/tx\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"tx","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/tx.ts","pathname":"/api/tx","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/update","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/update\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"update","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/update.ts","pathname":"/api/update","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/usage","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/usage\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"usage","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/usage.ts","pathname":"/api/usage","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/api/usage-report","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/usage-report\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"usage-report","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/usage-report.ts","pathname":"/api/usage-report","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".opt-group[data-astro-cid-zhn2mnrv]{display:flex;flex-direction:column;gap:6px}.opt-group[data-astro-cid-zhn2mnrv].opt-scale{flex-direction:row;flex-wrap:wrap;gap:14px;align-items:center}.opt[data-astro-cid-zhn2mnrv]{display:flex;align-items:center;gap:8px;font-size:.92rem;cursor:pointer}.opt[data-astro-cid-zhn2mnrv] input[data-astro-cid-zhn2mnrv]{width:auto;margin:0;flex:0 0 auto}.opt-scale[data-astro-cid-zhn2mnrv] .opt-s[data-astro-cid-zhn2mnrv]{flex-direction:column;gap:4px;text-align:center}.app-stage[data-astro-cid-zhn2mnrv]{display:block}#app-frame[data-astro-cid-zhn2mnrv]{width:100%;border:0;display:block;height:calc(100dvh - 200px);min-height:70vh;background:#fff}@media(max-width:640px){#app-frame[data-astro-cid-zhn2mnrv]{height:calc(100dvh - 230px)}}#app-dev-panel[data-astro-cid-zhn2mnrv]{position:fixed;left:var(--sbw, 0px);right:0;bottom:0;z-index:50;background:var(--surface);border-top:1px solid var(--line);box-shadow:0 -6px 20px #14161e1a;transition:left .18s ease}.app-dev-inner[data-astro-cid-zhn2mnrv]{max-width:var(--maxw);margin:0 auto;padding:10px 1.35rem 12px}#app-dev-log[data-astro-cid-zhn2mnrv]{font-size:.82rem;max-height:150px;overflow:auto;margin-bottom:6px;border:1px solid var(--line);border-radius:var(--r-sm);padding:8px;background:var(--surface-2)}#app-dev-log[data-astro-cid-zhn2mnrv] p[data-astro-cid-zhn2mnrv]{margin:0 0 4px}#app-dev-history[data-astro-cid-zhn2mnrv]{font-size:.82rem;max-height:180px;overflow:auto;margin-bottom:6px}@media(max-width:720px){.app-dev-inner[data-astro-cid-zhn2mnrv]{padding:8px 1rem 10px}}\n"}],"routeData":{"route":"/app/[id]","isIndex":false,"type":"page","pattern":"^\\/app\\/([^/]+?)\\/?$","segments":[[{"content":"app","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/app/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".section-tabs[data-astro-cid-2ypbjnip]{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 1rem;flex-wrap:wrap}.section-tab[data-astro-cid-2ypbjnip]{padding:9px 16px;font-size:.9rem;font-weight:600;color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.section-tab[data-astro-cid-2ypbjnip]:hover{color:var(--ink-2)}.section-tab[data-astro-cid-2ypbjnip].on{color:var(--brand-strong);border-bottom-color:var(--brand)}\n"}],"routeData":{"route":"/approvals","isIndex":false,"type":"page","pattern":"^\\/approvals\\/?$","segments":[[{"content":"approvals","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/approvals.astro","pathname":"/approvals","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/apps.BcCIHoWZ.css"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/apps","isIndex":false,"type":"page","pattern":"^\\/apps\\/?$","segments":[[{"content":"apps","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/apps.astro","pathname":"/apps","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".bk-gauge[data-astro-cid-2lnc5rn3]{height:8px;background:var(--surface-2, #eef1f5);border-radius:4px;overflow:hidden;margin-top:4px}.bk-gfill[data-astro-cid-2lnc5rn3]{height:100%;background:var(--brand-strong, #14365c);border-radius:4px;transition:width .3s}.bk-gfill[data-astro-cid-2lnc5rn3].hot{background:var(--danger, #b4541a)}\n"}],"routeData":{"route":"/backup","isIndex":false,"type":"page","pattern":"^\\/backup\\/?$","segments":[[{"content":"backup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/backup.astro","pathname":"/backup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".section-tabs[data-astro-cid-2ypbjnip]{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 1rem;flex-wrap:wrap}.section-tab[data-astro-cid-2ypbjnip]{padding:9px 16px;font-size:.9rem;font-weight:600;color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.section-tab[data-astro-cid-2ypbjnip]:hover{color:var(--ink-2)}.section-tab[data-astro-cid-2ypbjnip].on{color:var(--brand-strong);border-bottom-color:var(--brand)}\n"}],"routeData":{"route":"/billing","isIndex":false,"type":"page","pattern":"^\\/billing\\/?$","segments":[[{"content":"billing","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/billing.astro","pathname":"/billing","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/calendar","isIndex":false,"type":"page","pattern":"^\\/calendar\\/?$","segments":[[{"content":"calendar","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/calendar.astro","pathname":"/calendar","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/chat","isIndex":false,"type":"page","pattern":"^\\/chat\\/?$","segments":[[{"content":"chat","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/chat.astro","pathname":"/chat","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":":root{--c-bg: #16171B;--c-surface: #24262C;--c-ink: #F5F4F2;--c-line: rgba(255,255,255,.1);--c-accent: #E2C079;--c-sub: #9A9CA4;--c-btn: #D6B070;--c-btn-ink: #16171B;--c-ghost-bg: #2C2E34;--c-msg: #E5675A;color-scheme:dark}@media(prefers-color-scheme:light){:root{--c-bg: #F2F1F4;--c-surface: #FFFFFF;--c-ink: #1B1D22;--c-line: #E6E5EA;--c-accent: #946F2C;--c-sub: #5b6b7b;--c-btn: #1B1D22;--c-btn-ink: #FFFFFF;--c-ghost-bg: #FFFFFF;--c-msg: #C7382B;color-scheme:light}}[data-astro-cid-4y5t3my7]{box-sizing:border-box}body{font-family:-apple-system,Hiragino Sans,Noto Sans JP,Meiryo,system-ui,sans-serif;margin:0;background:var(--c-bg);color:var(--c-ink);line-height:1.8}.wrap[data-astro-cid-4y5t3my7]{max-width:760px;margin:0 auto;padding:28px 18px 64px}h1[data-astro-cid-4y5t3my7]{color:var(--c-accent);font-size:1.3rem}.doc[data-astro-cid-4y5t3my7]{background:var(--c-surface);border:1px solid var(--c-line);border-radius:12px;padding:16px 18px;margin:14px 0}.doc[data-astro-cid-4y5t3my7] h2[data-astro-cid-4y5t3my7]{color:var(--c-accent);font-size:1.05rem;margin:0 0 8px}.doc[data-astro-cid-4y5t3my7] pre[data-astro-cid-4y5t3my7]{white-space:pre-wrap;word-break:break-word;font:inherit;margin:0}.agree[data-astro-cid-4y5t3my7]{position:sticky;bottom:0;background:var(--c-surface);border:1px solid var(--c-line);border-radius:12px;padding:16px 18px;margin-top:18px;box-shadow:0 -4px 16px #00000040}.agree[data-astro-cid-4y5t3my7] label[data-astro-cid-4y5t3my7]{display:flex;gap:10px;align-items:flex-start;cursor:pointer}button[data-astro-cid-4y5t3my7]{margin-top:12px;background:var(--c-btn);color:var(--c-btn-ink);border:0;border-radius:8px;padding:12px 24px;font-weight:700;cursor:pointer}button[data-astro-cid-4y5t3my7][disabled]{opacity:.5;cursor:not-allowed}.msg[data-astro-cid-4y5t3my7]{margin-top:10px;font-size:.9rem;color:var(--c-msg)}.sub[data-astro-cid-4y5t3my7]{color:var(--c-sub);font-size:.85rem}a[data-astro-cid-4y5t3my7]{color:var(--c-accent)}\n"}],"routeData":{"route":"/consent","isIndex":false,"type":"page","pattern":"^\\/consent\\/?$","segments":[[{"content":"consent","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/consent.astro","pathname":"/consent","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"external","src":"_astro/dashboard.-6sVdypn.css"}],"routeData":{"route":"/dashboard","isIndex":false,"type":"page","pattern":"^\\/dashboard\\/?$","segments":[[{"content":"dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dashboard.astro","pathname":"/dashboard","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/diagnostics","isIndex":false,"type":"page","pattern":"^\\/diagnostics\\/?$","segments":[[{"content":"diagnostics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/diagnostics.astro","pathname":"/diagnostics","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/directory","isIndex":false,"type":"page","pattern":"^\\/directory\\/?$","segments":[[{"content":"directory","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/directory.astro","pathname":"/directory","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/drive","isIndex":false,"type":"page","pattern":"^\\/drive\\/?$","segments":[[{"content":"drive","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/drive.astro","pathname":"/drive","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":"html,body{margin:0;background:transparent}iframe[data-astro-cid-dyap5gvz]{width:100%;border:0;display:block;background:transparent}\n"}],"routeData":{"route":"/embed/[slug]","isIndex":false,"type":"page","pattern":"^\\/embed\\/([^/]+?)\\/?$","segments":[[{"content":"embed","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/embed/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".back{display:inline-flex;align-items:center;gap:7px;font-size:.88rem;color:var(--muted)}.back:hover{color:var(--ink)}.back .flip{transform:rotate(180deg)}.metarow{display:flex;gap:26px;flex-wrap:wrap;margin-top:18px}.detail-grid{display:grid;grid-template-columns:1fr 384px;gap:56px;align-items:start;padding-top:48px}.ev-body{font-size:1.04rem;color:var(--ink-2);line-height:1.95}.ev-body>p:first-child{font-size:1.18rem;color:var(--ink);font-family:var(--font-serif);line-height:1.85}.ev-body h2{font-size:1.5rem;margin:1.7em 0 .5em;padding-left:16px;border-left:2px solid var(--accent);color:var(--ink)}.ev-body ul{padding-left:1.2em}.ev-body li{margin:.45em 0}.apply-col{position:sticky;top:92px}.amount-row{display:flex;align-items:center;justify-content:space-between;margin:4px 0 16px}.amount{font-family:var(--font-serif);font-size:1.4rem;color:var(--ink)}.formmsg{font-size:.84rem;margin-top:12px;color:var(--muted);min-height:1em}.formmsg.err{color:#c0392b}.steplabel{font-size:.76rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin-bottom:14px}.summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);margin-bottom:16px}.summary strong{font-family:var(--font-serif);font-size:1.1rem}.demo-note{display:flex;align-items:center;gap:7px;font-size:.78rem;color:var(--muted);margin:12px 0 0}.done-mark{display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;border:1.5px solid var(--accent);color:var(--accent);margin-bottom:6px}.notice{text-align:left;background:var(--surface-2);border:1px solid var(--line);border-radius:var(--r);padding:16px;margin:16px 0}.notice-h{display:inline-flex;align-items:center;gap:7px;font-weight:600;font-size:.9rem;color:var(--ink)}@media(max-width:900px){.detail-grid{grid-template-columns:1fr;gap:32px}.apply-col{position:static}}\n"},{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/event/[slug]","isIndex":false,"type":"page","pattern":"^\\/event\\/([^/]+?)\\/?$","segments":[[{"content":"event","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/event/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/events","isIndex":false,"type":"page","pattern":"^\\/events\\/?$","segments":[[{"content":"events","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/events.astro","pathname":"/events","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/favicon.ico","isIndex":false,"type":"endpoint","pattern":"^\\/favicon\\.ico$","segments":[[{"content":"favicon.ico","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/favicon.ico.ts","pathname":"/favicon.ico","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/files/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/files\\/([^/]+?)\\/?$","segments":[[{"content":"files","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/files/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/files","isIndex":true,"type":"page","pattern":"^\\/files\\/?$","segments":[[{"content":"files","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/files/index.astro","pathname":"/files","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/forbidden","isIndex":false,"type":"page","pattern":"^\\/forbidden\\/?$","segments":[[{"content":"forbidden","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/forbidden.astro","pathname":"/forbidden","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/gmail","isIndex":false,"type":"page","pattern":"^\\/gmail\\/?$","segments":[[{"content":"gmail","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gmail.astro","pathname":"/gmail","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":"[data-astro-cid-c55btd6p]{box-sizing:border-box;margin:0;padding:0}body{background:#f2f1f4;font-family:system-ui,-apple-system,Hiragino Sans,Noto Sans JP,Segoe UI,sans-serif;color:#1b1d22;min-height:100vh}.hero[data-astro-cid-c55btd6p]{background:linear-gradient(135deg,#1b1d22,#2d3142 60%,#1b1d22);color:#fff;padding:56px 24px 48px;text-align:center}.hero[data-astro-cid-c55btd6p] h1[data-astro-cid-c55btd6p]{font-size:clamp(24px,5vw,38px);font-weight:800;letter-spacing:-.02em;line-height:1.2}.hero[data-astro-cid-c55btd6p] p[data-astro-cid-c55btd6p]{font-size:15px;color:#ffffffb8;max-width:620px;margin:14px auto 0;line-height:1.7;white-space:pre-wrap;text-wrap:pretty}.wrap[data-astro-cid-c55btd6p]{max-width:760px;margin:0 auto;padding:28px 18px 60px}.grid[data-astro-cid-c55btd6p]{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}.lp[data-astro-cid-c55btd6p]{display:block;background:#fff;border:1px solid #E6E5EA;border-radius:14px;padding:20px;text-decoration:none;color:#1b1d22;box-shadow:0 2px 8px #14161e0d;transition:transform .12s,box-shadow .12s}.lp[data-astro-cid-c55btd6p]:hover{transform:translateY(-2px);box-shadow:0 8px 22px -8px #14161e40}.lp[data-astro-cid-c55btd6p] .t[data-astro-cid-c55btd6p]{font-size:15px;font-weight:700;overflow-wrap:anywhere;text-wrap:pretty}.lp[data-astro-cid-c55btd6p] .go[data-astro-cid-c55btd6p]{display:inline-block;margin-top:10px;font-size:12px;font-weight:700;color:#946f2c}.empty[data-astro-cid-c55btd6p]{color:#6e7179;text-align:center;padding:40px 0}.foot[data-astro-cid-c55btd6p]{text-align:center;color:#b0b3bc;font-size:11px;margin-top:32px}\n"}],"routeData":{"route":"/hub/[id]","isIndex":false,"type":"page","pattern":"^\\/hub\\/([^/]+?)\\/?$","segments":[[{"content":"hub","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/hub/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/import","isIndex":false,"type":"page","pattern":"^\\/import\\/?$","segments":[[{"content":"import","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/import.astro","pathname":"/import","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".section-tabs[data-astro-cid-2ypbjnip]{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 1rem;flex-wrap:wrap}.section-tab[data-astro-cid-2ypbjnip]{padding:9px 16px;font-size:.9rem;font-weight:600;color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.section-tab[data-astro-cid-2ypbjnip]:hover{color:var(--ink-2)}.section-tab[data-astro-cid-2ypbjnip].on{color:var(--brand-strong);border-bottom-color:var(--brand)}\n"}],"routeData":{"route":"/invoices","isIndex":false,"type":"page","pattern":"^\\/invoices\\/?$","segments":[[{"content":"invoices","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/invoices.astro","pathname":"/invoices","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/join","isIndex":false,"type":"page","pattern":"^\\/join\\/?$","segments":[[{"content":"join","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/join.astro","pathname":"/join","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/legal","isIndex":false,"type":"page","pattern":"^\\/legal\\/?$","segments":[[{"content":"legal","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/legal.astro","pathname":"/legal","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".login[data-astro-cid-sgpqyurt]{min-height:100vh;display:grid;grid-template-columns:1.05fr 1fr}.login-brand[data-astro-cid-sgpqyurt]{position:relative;overflow:hidden;padding:40px 48px;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(160deg,#0e1a2b,#122236 55%,#0a1320);color:#f8f5ee}.lb-top[data-astro-cid-sgpqyurt]{display:flex;align-items:center;gap:.6rem;z-index:2;font-size:1.1rem}.lb-mark[data-astro-cid-sgpqyurt]{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:#ffffff1a;color:var(--brand);border:1px solid rgba(201,168,106,.5)}.lb-mark[data-astro-cid-sgpqyurt] svg[data-astro-cid-sgpqyurt]{width:20px;height:20px}.login-brand-mid[data-astro-cid-sgpqyurt]{max-width:480px;z-index:2}.login-brand-mid[data-astro-cid-sgpqyurt] .display[data-astro-cid-sgpqyurt]{color:#f8f5ee;line-height:1.2}.login-brand-mid[data-astro-cid-sgpqyurt] .display[data-astro-cid-sgpqyurt] .nb[data-astro-cid-sgpqyurt]{white-space:nowrap}.promises[data-astro-cid-sgpqyurt]{display:flex;flex-direction:column;gap:14px;margin-top:32px}.promise[data-astro-cid-sgpqyurt]{display:flex;gap:12px;align-items:flex-start}.promise[data-astro-cid-sgpqyurt] svg[data-astro-cid-sgpqyurt]{flex:0 0 auto;margin-top:2px;background:#ffffff29;border-radius:50%;padding:4px;width:26px;height:26px;color:#f8f5ee}.promise[data-astro-cid-sgpqyurt] strong[data-astro-cid-sgpqyurt]{display:block;font-size:.98rem}.promise[data-astro-cid-sgpqyurt] span[data-astro-cid-sgpqyurt]{color:#ffffffc7;font-size:.86rem}.lb-foot[data-astro-cid-sgpqyurt]{z-index:2;color:#ffffff8c;font-size:.8rem}.login-orbs[data-astro-cid-sgpqyurt]{position:absolute;inset:0;z-index:1;pointer-events:none}.login-orbs[data-astro-cid-sgpqyurt] span[data-astro-cid-sgpqyurt]{position:absolute;border-radius:50%;filter:blur(2px)}.login-orbs[data-astro-cid-sgpqyurt] span[data-astro-cid-sgpqyurt]:nth-child(1){width:320px;height:320px;right:-90px;top:-70px;background:radial-gradient(circle,var(--brand),transparent 68%);opacity:.5}.login-orbs[data-astro-cid-sgpqyurt] span[data-astro-cid-sgpqyurt]:nth-child(2){width:240px;height:240px;right:60px;bottom:-60px;background:radial-gradient(circle,#fff,transparent 65%);opacity:.12}.login-orbs[data-astro-cid-sgpqyurt] span[data-astro-cid-sgpqyurt]:nth-child(3){width:160px;height:160px;left:40px;top:45%;background:radial-gradient(circle,var(--brand),transparent 70%);opacity:.25}.login-main[data-astro-cid-sgpqyurt]{display:grid;place-items:center;padding:32px 24px;background:var(--bg)}.login-card[data-astro-cid-sgpqyurt]{width:100%;max-width:440px}.g-btn[data-astro-cid-sgpqyurt]{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;min-height:50px;border:1px solid var(--line-strong);border-radius:var(--r);background:var(--surface);color:var(--ink);font-size:.96rem;font-weight:600;cursor:pointer;transition:background .15s,transform .08s;text-decoration:none}.g-btn[data-astro-cid-sgpqyurt]:hover{background:var(--surface-3)}.g-mark[data-astro-cid-sgpqyurt]{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#4285f4;font-weight:800;border:1px solid var(--line);font-size:.9rem}@media(max-width:820px){.login[data-astro-cid-sgpqyurt]{grid-template-columns:1fr}.login-brand[data-astro-cid-sgpqyurt]{padding:28px 24px}.login-brand-mid[data-astro-cid-sgpqyurt]{margin:18px 0}.login-brand-mid[data-astro-cid-sgpqyurt] .display[data-astro-cid-sgpqyurt]{font-size:1.7rem}.promises[data-astro-cid-sgpqyurt]{display:none}}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/lp/craft-career","isIndex":false,"type":"page","pattern":"^\\/lp\\/craft-career\\/?$","segments":[[{"content":"lp","dynamic":false,"spread":false}],[{"content":"craft-career","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lp/craft-career.astro","pathname":"/lp/craft-career","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/SiteLockGate.oVXP50Ug.css"},{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/lp/[slug]","isIndex":false,"type":"page","pattern":"^\\/lp\\/([^/]+?)\\/?$","segments":[[{"content":"lp","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/lp/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/meet","isIndex":false,"type":"page","pattern":"^\\/meet\\/?$","segments":[[{"content":"meet","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/meet.astro","pathname":"/meet","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/membership","isIndex":false,"type":"page","pattern":"^\\/membership\\/?$","segments":[[{"content":"membership","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/membership.astro","pathname":"/membership","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/minutes","isIndex":false,"type":"page","pattern":"^\\/minutes\\/?$","segments":[[{"content":"minutes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/minutes.astro","pathname":"/minutes","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/my-events","isIndex":false,"type":"page","pattern":"^\\/my-events\\/?$","segments":[[{"content":"my-events","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/my-events.astro","pathname":"/my-events","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/news/[slug]","isIndex":false,"type":"page","pattern":"^\\/news\\/([^/]+?)\\/?$","segments":[[{"content":"news","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/news/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/news","isIndex":false,"type":"page","pattern":"^\\/news\\/?$","segments":[[{"content":"news","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/news.astro","pathname":"/news","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":"html,body{margin:0;background:#f2f1f4}.bo-public[data-astro-cid-f3iwrppf]{max-width:720px;margin:0 auto;padding:8px}iframe[data-astro-cid-f3iwrppf]{width:100%;border:0;display:block;background:transparent}footer[data-astro-cid-f3iwrppf]{max-width:720px;margin:8px auto 24px;padding:0 16px;color:#9a9ca1;font:12px system-ui,-apple-system,sans-serif;text-align:center}\n"}],"routeData":{"route":"/p/[slug]","isIndex":false,"type":"page","pattern":"^\\/p\\/([^/]+?)\\/?$","segments":[[{"content":"p","dynamic":false,"spread":false}],[{"content":"slug","dynamic":true,"spread":false}]],"params":["slug"],"component":"src/pages/p/[slug].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/personal","isIndex":false,"type":"page","pattern":"^\\/personal\\/?$","segments":[[{"content":"personal","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/personal.astro","pathname":"/personal","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".bo-list-table[data-astro-cid-iejuj6pp]{width:max-content;min-width:100%;border-collapse:collapse;background:var(--surface);color:var(--ink);border-radius:14px;overflow:hidden;border:1px solid var(--line);font-size:13px}.bo-list-table[data-astro-cid-iejuj6pp] th[data-astro-cid-iejuj6pp],.bo-list-table[data-astro-cid-iejuj6pp] td[data-astro-cid-iejuj6pp]{padding:10px 14px;text-align:left;white-space:nowrap;border-bottom:1px solid var(--line);color:var(--ink)}.bo-list-table[data-astro-cid-iejuj6pp] th[data-astro-cid-iejuj6pp]{background:var(--surface-3);color:var(--brand-strong);font-size:11px;font-weight:700;letter-spacing:.06em}.bo-list-table[data-astro-cid-iejuj6pp] td[data-astro-cid-iejuj6pp] a[data-astro-cid-iejuj6pp]{color:var(--brand-strong)}@media(max-width:600px){.bo-list-scroll[data-astro-cid-iejuj6pp]{overflow-x:visible}.bo-list-table[data-astro-cid-iejuj6pp]{width:auto!important;min-width:0!important;border:none;background:transparent}.bo-list-table[data-astro-cid-iejuj6pp] thead[data-astro-cid-iejuj6pp]{display:none}.bo-list-table[data-astro-cid-iejuj6pp] tr[data-astro-cid-iejuj6pp]{display:block;background:var(--surface);border:1px solid var(--line);border-radius:12px;margin-bottom:12px}.bo-list-table[data-astro-cid-iejuj6pp] td[data-astro-cid-iejuj6pp]{display:flex;justify-content:space-between;gap:14px;text-align:right;white-space:normal!important;overflow-wrap:anywhere;border-bottom:1px solid var(--line)}.bo-list-table[data-astro-cid-iejuj6pp] tr[data-astro-cid-iejuj6pp] td[data-astro-cid-iejuj6pp]:last-child{border-bottom:none}.bo-list-table[data-astro-cid-iejuj6pp] td[data-astro-cid-iejuj6pp]:before{content:attr(data-label);flex:0 0 auto;text-align:left;font-weight:600;color:var(--muted)}}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/project/[id]","isIndex":false,"type":"page","pattern":"^\\/project\\/([^/]+?)\\/?$","segments":[[{"content":"project","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/project/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".pj-grid[data-astro-cid-aid3sr62]{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.pj-card[data-astro-cid-aid3sr62]{position:relative;display:flex;flex-direction:column;gap:8px;background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 18px 16px;text-decoration:none;color:var(--ink);overflow:hidden;box-shadow:var(--shadow-sm, 0 1px 3px rgba(20,22,30,.06));transition:transform .14s ease,box-shadow .14s ease,border-color .14s}.pj-card[data-astro-cid-aid3sr62]:hover{transform:translateY(-3px);box-shadow:0 12px 26px -12px #14161e59;border-color:color-mix(in srgb,hsl(var(--h) 55% 55%) 60%,var(--line));text-decoration:none}.pj-card-accent[data-astro-cid-aid3sr62]{position:absolute;inset:0 0 auto;height:5px;background:linear-gradient(90deg,hsl(var(--h) 60% 58%),hsl(calc(var(--h) + 40) 60% 60%))}.pj-card-head[data-astro-cid-aid3sr62]{display:flex;align-items:center;gap:10px;margin-top:4px}.pj-card-ic[data-astro-cid-aid3sr62]{width:40px;height:40px;flex:0 0 auto;display:grid;place-items:center;font-size:20px;border-radius:11px;background:color-mix(in srgb,hsl(var(--h) 60% 58%) 20%,var(--surface-2, transparent));border:1px solid color-mix(in srgb,hsl(var(--h) 60% 58%) 35%,var(--line))}.pj-card-name[data-astro-cid-aid3sr62]{font-size:1.05rem;font-weight:700;overflow-wrap:anywhere;text-wrap:pretty}.pj-card-desc[data-astro-cid-aid3sr62]{color:var(--muted);font-size:.85rem;line-height:1.5;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pj-card-foot[data-astro-cid-aid3sr62]{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:auto;padding-top:8px;font-size:.82rem;color:var(--muted)}.pj-stat[data-astro-cid-aid3sr62] b[data-astro-cid-aid3sr62]{color:var(--ink);font-size:.95rem}.pj-tag[data-astro-cid-aid3sr62]{font-size:.72rem;font-weight:700;color:var(--brand-strong);background:var(--brand-soft);border:1px solid color-mix(in srgb,var(--brand) 40%,transparent);border-radius:999px;padding:1px 8px}.pj-go[data-astro-cid-aid3sr62]{margin-left:auto;color:var(--brand-strong);font-weight:700}.pj-empty[data-astro-cid-aid3sr62]{display:flex;align-items:center;gap:16px;padding:28px}.pj-empty-ic[data-astro-cid-aid3sr62]{font-size:36px;opacity:.7}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/projects","isIndex":false,"type":"page","pattern":"^\\/projects\\/?$","segments":[[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects.astro","pathname":"/projects","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".rep-head[data-astro-cid-k5zskagf]{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.rep-nav[data-astro-cid-k5zskagf]{display:flex;align-items:center;gap:8px}.kpi-grid[data-astro-cid-k5zskagf]{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:.6rem 0 1rem}.kpi[data-astro-cid-k5zskagf]{border:1px solid var(--line);border-radius:12px;padding:.8rem;background:var(--surface);display:flex;flex-direction:column;gap:2px}.kpi-hero[data-astro-cid-k5zskagf]{border-color:var(--brand-strong)}.kpi-v[data-astro-cid-k5zskagf]{font-size:1.3rem;font-weight:800}.kpi-l[data-astro-cid-k5zskagf]{font-size:.78rem;color:var(--muted)}.labor-grid[data-astro-cid-k5zskagf]{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin:.6rem 0 .8rem}.labor-grid[data-astro-cid-k5zskagf] label[data-astro-cid-k5zskagf]{display:flex;flex-direction:column;gap:4px;font-size:.82rem;color:var(--muted)}.labor-grid[data-astro-cid-k5zskagf] input[data-astro-cid-k5zskagf]{padding:.4rem .55rem}@media print{.no-print[data-astro-cid-k5zskagf],nav,header,footer{display:none!important}.card[data-astro-cid-k5zskagf]{border:none;box-shadow:none}}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/reports","isIndex":false,"type":"page","pattern":"^\\/reports\\/?$","segments":[[{"content":"reports","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/reports.astro","pathname":"/reports","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".section-tabs[data-astro-cid-2ypbjnip]{display:flex;gap:4px;border-bottom:1px solid var(--line);margin:0 0 1rem;flex-wrap:wrap}.section-tab[data-astro-cid-2ypbjnip]{padding:9px 16px;font-size:.9rem;font-weight:600;color:var(--muted);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px}.section-tab[data-astro-cid-2ypbjnip]:hover{color:var(--ink-2)}.section-tab[data-astro-cid-2ypbjnip].on{color:var(--brand-strong);border-bottom-color:var(--brand)}\n"}],"routeData":{"route":"/review","isIndex":false,"type":"page","pattern":"^\\/review\\/?$","segments":[[{"content":"review","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/review.astro","pathname":"/review","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/robots.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robots\\.txt$","segments":[[{"content":"robots.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robots.txt.ts","pathname":"/robots.txt","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".lead[data-astro-cid-xjqxvez7]{color:var(--ink);margin:.2rem 0 1rem}.cal-head[data-astro-cid-xjqxvez7]{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:.5rem 0 .6rem}.cal-label[data-astro-cid-xjqxvez7]{font-size:1.2rem}.cal-nav[data-astro-cid-xjqxvez7]{min-height:44px}.cal[data-astro-cid-xjqxvez7]{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.cal[data-astro-cid-xjqxvez7] .wd[data-astro-cid-xjqxvez7]{text-align:center;font-size:.82rem;font-weight:700;color:var(--muted);padding:4px 0}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7]{min-height:56px;border:1px solid var(--line);border-radius:var(--r-sm);background:var(--surface);padding:5px 4px;cursor:pointer;display:flex;flex-direction:column;gap:2px;text-align:left}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7]:hover{border-color:var(--brand);background:var(--brand-soft)}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7].sel{border-color:var(--brand-strong);box-shadow:inset 0 0 0 2px var(--brand-strong);background:var(--brand-soft)}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7].blank{background:transparent;border:0;cursor:default}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7].today{border-color:var(--brand);box-shadow:inset 0 0 0 1px var(--brand)}.cal[data-astro-cid-xjqxvez7] .dn[data-astro-cid-xjqxvez7]{display:block;width:100%;font-size:1rem;font-weight:700;margin-bottom:2px}.cal[data-astro-cid-xjqxvez7] .sun[data-astro-cid-xjqxvez7] .dn[data-astro-cid-xjqxvez7]{color:var(--danger)}.cal[data-astro-cid-xjqxvez7] .sat[data-astro-cid-xjqxvez7] .dn[data-astro-cid-xjqxvez7]{color:#2c5aa0}.cal[data-astro-cid-xjqxvez7] .ev[data-astro-cid-xjqxvez7]{font-size:.82rem;line-height:1.3;background:var(--brand-soft);color:var(--accent-ink);border-radius:4px;padding:2px 5px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cal[data-astro-cid-xjqxvez7] .more[data-astro-cid-xjqxvez7]{font-size:.82rem;color:var(--muted)}.cal[data-astro-cid-xjqxvez7].week .cell[data-astro-cid-xjqxvez7]{min-height:120px;align-items:stretch}.cal[data-astro-cid-xjqxvez7].week .ev[data-astro-cid-xjqxvez7]{display:block!important;white-space:normal}.cal[data-astro-cid-xjqxvez7] .ev[data-astro-cid-xjqxvez7].g{background:#e8f0fe;color:#1a56b0}.add-panel[data-astro-cid-xjqxvez7]{margin-top:1rem;border:2px solid var(--brand)}.add-date[data-astro-cid-xjqxvez7]{font-size:1.05rem;font-weight:700;margin-bottom:.6rem}.time-row[data-astro-cid-xjqxvez7]{display:flex;align-items:center;gap:8px}.time-row[data-astro-cid-xjqxvez7] select[data-astro-cid-xjqxvez7]{min-height:48px;font-size:1.05rem;min-width:88px}.time-sep[data-astro-cid-xjqxvez7]{font-size:1rem;color:var(--muted)}.add-actions[data-astro-cid-xjqxvez7]{display:flex;gap:10px;align-items:center;margin-top:.8rem;flex-wrap:wrap}.add-go[data-astro-cid-xjqxvez7]{min-height:52px;font-size:1.05rem;padding:0 1.4rem}@media(max-width:480px){.cal[data-astro-cid-xjqxvez7]{gap:3px}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7]{min-height:48px}.cal[data-astro-cid-xjqxvez7] .ev[data-astro-cid-xjqxvez7]{display:none}.cal[data-astro-cid-xjqxvez7] .cell[data-astro-cid-xjqxvez7].has:after{content:\"●\";color:var(--brand-strong);font-size:.8rem;line-height:1}}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/schedule","isIndex":false,"type":"page","pattern":"^\\/schedule\\/?$","segments":[[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/schedule.astro","pathname":"/schedule","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/a2a","isIndex":false,"type":"page","pattern":"^\\/settings\\/a2a\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"a2a","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/a2a.astro","pathname":"/settings/a2a","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".small[data-astro-cid-k62awgq3]{font-size:.82rem}.adv-tabs[data-astro-cid-k62awgq3]{display:flex;gap:6px;margin:.8rem 0 1.2rem;flex-wrap:wrap}.adv-tab[data-astro-cid-k62awgq3]{padding:.5rem .95rem;border:1px solid var(--line, #e5e5e5);border-radius:999px;background:var(--surface, #fff);color:var(--ink, #1B1D22);cursor:pointer;font-weight:600;font-size:.9rem}.adv-tab[data-astro-cid-k62awgq3].on{background:var(--brand-strong, #1B1D22);color:#fff;border-color:var(--brand-strong, #1B1D22)}.adv-panel[data-astro-cid-k62awgq3][hidden]{display:none}.steps[data-astro-cid-k62awgq3]{display:flex;flex-direction:column;gap:14px;margin-top:.6rem}.step[data-astro-cid-k62awgq3]{display:flex;gap:12px;align-items:flex-start}.step-no[data-astro-cid-k62awgq3]{flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:var(--brand, #C9A86A);color:var(--on-brand, #1B1D22);display:grid;place-items:center;font-weight:800;font-size:.85rem}.step-body[data-astro-cid-k62awgq3]{min-width:0}.step-body[data-astro-cid-k62awgq3]>strong[data-astro-cid-k62awgq3]:first-child{display:block;line-height:26px}.step-btn[data-astro-cid-k62awgq3]{display:inline-flex;margin-top:.5rem}.wpaid-row[data-astro-cid-k62awgq3]{display:flex;align-items:center;gap:6px;margin-top:.5rem}.step-body[data-astro-cid-k62awgq3] code[data-astro-cid-k62awgq3]{background:var(--surface-3, #ECEBF1);color:var(--ink, #1B1D22);padding:.05rem .35rem;border-radius:5px}\n"}],"routeData":{"route":"/settings/advanced","isIndex":false,"type":"page","pattern":"^\\/settings\\/advanced\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"advanced","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/advanced.astro","pathname":"/settings/advanced","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".small[data-astro-cid-mzvflrad]{font-size:.82rem}.hub-grid[data-astro-cid-mzvflrad]{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:1rem}.hub-card[data-astro-cid-mzvflrad]{display:flex;flex-direction:column;gap:5px}\n"}],"routeData":{"route":"/settings/agent","isIndex":false,"type":"page","pattern":"^\\/settings\\/agent\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"agent","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/agent.astro","pathname":"/settings/agent","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/analytics","isIndex":false,"type":"page","pattern":"^\\/settings\\/analytics\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"analytics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/analytics.astro","pathname":"/settings/analytics","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/settings/connectors","isIndex":false,"type":"page","pattern":"^\\/settings\\/connectors\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"connectors","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/connectors.astro","pathname":"/settings/connectors","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/directory","isIndex":false,"type":"page","pattern":"^\\/settings\\/directory\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"directory","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/directory.astro","pathname":"/settings/directory","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/display","isIndex":false,"type":"page","pattern":"^\\/settings\\/display\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"display","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/display.astro","pathname":"/settings/display","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/domain","isIndex":false,"type":"page","pattern":"^\\/settings\\/domain\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"domain","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/domain.astro","pathname":"/settings/domain","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/events","isIndex":false,"type":"page","pattern":"^\\/settings\\/events\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"events","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/events.astro","pathname":"/settings/events","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/google-setup.BIyjAtgt.css"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/google-setup","isIndex":false,"type":"page","pattern":"^\\/settings\\/google-setup\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"google-setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/google-setup.astro","pathname":"/settings/google-setup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/inbox","isIndex":false,"type":"page","pattern":"^\\/settings\\/inbox\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"inbox","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/inbox.astro","pathname":"/settings/inbox","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".small[data-astro-cid-zuhf7pg4]{font-size:.82rem}.hub-grid[data-astro-cid-zuhf7pg4]{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:1rem}.hub-card[data-astro-cid-zuhf7pg4]{display:flex;flex-direction:column;gap:5px}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/integrations","isIndex":false,"type":"page","pattern":"^\\/settings\\/integrations\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"integrations","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/integrations.astro","pathname":"/settings/integrations","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".small[data-astro-cid-e7q4zvoc]{font-size:.82rem}.setup-guide[data-astro-cid-e7q4zvoc]{margin-top:.5rem}.setup-guide[data-astro-cid-e7q4zvoc]>summary[data-astro-cid-e7q4zvoc]{cursor:pointer;font-weight:600;font-size:.88rem;color:var(--brand-strong)}.guide-steps[data-astro-cid-e7q4zvoc]{margin:.6rem 0 .2rem;padding-left:1.3rem}.guide-steps[data-astro-cid-e7q4zvoc]>li[data-astro-cid-e7q4zvoc]{margin:.5rem 0}.guide-steps[data-astro-cid-e7q4zvoc] .muted[data-astro-cid-e7q4zvoc]{margin-top:2px}.prov[data-astro-cid-e7q4zvoc]{border:1px solid var(--line, #e5e5e5);border-left:4px solid var(--brand, #C9A86A);border-radius:10px;padding:.6rem .8rem;margin:.6rem 0}.prov[data-astro-cid-e7q4zvoc]:has(.reg-badge){border-left-color:var(--ok, #1a8a4a);background:color-mix(in srgb,var(--ok, #1a8a4a) 6%,transparent)}.prov-h[data-astro-cid-e7q4zvoc]{margin:0 0 .2rem;font-weight:700;font-size:.92rem}.prov-tag[data-astro-cid-e7q4zvoc]{display:inline-block;margin-left:.4rem;background:var(--line, #e5e5e5);color:var(--brand-strong, #1B1D22);border-radius:6px;padding:.05rem .45rem;font-size:.72rem;font-weight:600;vertical-align:middle}.reg-badge[data-astro-cid-e7q4zvoc]{display:inline-block;margin-left:.4rem;background:color-mix(in srgb,var(--ok, #1a8a4a) 16%,transparent);color:var(--ok, #1a8a4a);border-radius:6px;padding:.05rem .45rem;font-size:.72rem;font-weight:700;vertical-align:middle}.prov[data-astro-cid-e7q4zvoc] .btn[data-astro-cid-e7q4zvoc]{margin-top:.2rem}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/keys","isIndex":false,"type":"page","pattern":"^\\/settings\\/keys\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"keys","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/keys.astro","pathname":"/settings/keys","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/media","isIndex":false,"type":"page","pattern":"^\\/settings\\/media\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"media","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/media.astro","pathname":"/settings/media","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".m-name-wrap[data-astro-cid-mzuny3q7]{display:flex;align-items:center;gap:.3rem;flex-wrap:wrap}.m-name[data-astro-cid-mzuny3q7]{font-weight:600}.conn-badge[data-astro-cid-mzuny3q7]{font-size:.68rem;line-height:1;padding:2px 6px;border-radius:999px;color:#fff;white-space:nowrap}.conn-line[data-astro-cid-mzuny3q7]{background:#06c755}.conn-discord[data-astro-cid-mzuny3q7]{background:#5865f2}.conn-slack[data-astro-cid-mzuny3q7]{background:#611f69}.m-ops[data-astro-cid-mzuny3q7]{display:flex;align-items:center;gap:.35rem;flex-wrap:wrap}.link-box[data-astro-cid-mzuny3q7]{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;padding:.2rem 0}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/members","isIndex":false,"type":"page","pattern":"^\\/settings\\/members\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"members","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/members.astro","pathname":"/settings/members","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/messaging.DEScgiIY.css"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/messaging","isIndex":false,"type":"page","pattern":"^\\/settings\\/messaging\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"messaging","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/messaging.astro","pathname":"/settings/messaging","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/nav","isIndex":false,"type":"page","pattern":"^\\/settings\\/nav\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"nav","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/nav.astro","pathname":"/settings/nav","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/news","isIndex":false,"type":"page","pattern":"^\\/settings\\/news\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"news","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/news.astro","pathname":"/settings/news","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".small[data-astro-cid-fj7qes35]{font-size:.82rem}.hub-grid[data-astro-cid-fj7qes35]{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:1rem}.hub-card[data-astro-cid-fj7qes35]{display:flex;flex-direction:column;gap:5px}\n"}],"routeData":{"route":"/settings/ops","isIndex":false,"type":"page","pattern":"^\\/settings\\/ops\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"ops","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/ops.astro","pathname":"/settings/ops","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".small[data-astro-cid-chu44qix]{font-size:.82rem}.hub-grid[data-astro-cid-chu44qix]{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:1rem}.hub-card[data-astro-cid-chu44qix]{display:flex;flex-direction:column;gap:5px}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/org","isIndex":false,"type":"page","pattern":"^\\/settings\\/org\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"org","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/org.astro","pathname":"/settings/org","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/public","isIndex":false,"type":"page","pattern":"^\\/settings\\/public\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"public","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/public.astro","pathname":"/settings/public","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"external","src":"_astro/builder.BWJC6ILG.css"}],"routeData":{"route":"/settings/site/builder","isIndex":false,"type":"page","pattern":"^\\/settings\\/site\\/builder\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"site","dynamic":false,"spread":false}],[{"content":"builder","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/site/builder.astro","pathname":"/settings/site/builder","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/site","isIndex":false,"type":"page","pattern":"^\\/settings\\/site\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"site","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/site.astro","pathname":"/settings/site","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/social","isIndex":false,"type":"page","pattern":"^\\/settings\\/social\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"social","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/social.astro","pathname":"/settings/social","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".th-color-row[data-astro-cid-ashqdkw5]{display:flex;align-items:center;gap:6px}.th-color-row[data-astro-cid-ashqdkw5] input[data-astro-cid-ashqdkw5][type=color]{width:44px;height:36px;padding:0;border:1px solid var(--line);border-radius:var(--r-sm);background:none;flex:0 0 auto;cursor:pointer}.th-color-row[data-astro-cid-ashqdkw5] input[data-astro-cid-ashqdkw5]:not([type=color]){flex:1;min-width:0}\n"}],"routeData":{"route":"/settings/theme","isIndex":false,"type":"page","pattern":"^\\/settings\\/theme\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"theme","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/theme.astro","pathname":"/settings/theme","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".upd-steps[data-astro-cid-curm2vkq]{list-style:none;padding:0;margin:.6rem 0 0;counter-reset:s}.upd-steps[data-astro-cid-curm2vkq]>li[data-astro-cid-curm2vkq]{border:1px solid var(--line);border-radius:10px;padding:.7rem .9rem;margin-bottom:.6rem;background:var(--surface)}.upd-steps[data-astro-cid-curm2vkq] .small[data-astro-cid-curm2vkq]{font-size:.82rem}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/settings/update","isIndex":false,"type":"page","pattern":"^\\/settings\\/update\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"update","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/update.astro","pathname":"/settings/update","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".small[data-astro-cid-ffzmbnih]{font-size:.82rem}.web-tabs[data-astro-cid-ffzmbnih]{display:flex;gap:6px;margin:.6rem 0 1rem;flex-wrap:wrap}.web-tab[data-astro-cid-ffzmbnih]{padding:.5rem .95rem;border:1px solid var(--line, #e5e5e5);border-radius:999px;background:var(--surface, #fff);color:var(--ink, #1B1D22);cursor:pointer;font-weight:600;font-size:.9rem}.web-tab[data-astro-cid-ffzmbnih].on{background:var(--brand-strong, #1B1D22);color:#fff;border-color:var(--brand-strong, #1B1D22)}.web-panel[data-astro-cid-ffzmbnih][hidden]{display:none}.web-head[data-astro-cid-ffzmbnih]{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.web-list[data-astro-cid-ffzmbnih]{display:flex;flex-direction:column;gap:8px;margin-top:.6rem}.web-row[data-astro-cid-ffzmbnih]{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border:1px solid var(--line);border-radius:10px;padding:.6rem .8rem}.web-row-main[data-astro-cid-ffzmbnih]{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}.web-row-main[data-astro-cid-ffzmbnih] code[data-astro-cid-ffzmbnih]{background:var(--surface-3, #ECEBF1);color:var(--ink, #1B1D22);padding:.1rem .4rem;border-radius:6px;font-size:.8rem}.web-row-act[data-astro-cid-ffzmbnih]{display:flex;gap:6px;flex:0 0 auto}.tag[data-astro-cid-ffzmbnih]{font-size:.72rem;border:1px solid var(--line-strong, #c4c2c8);color:var(--muted);border-radius:999px;padding:.05rem .5rem}.tag[data-astro-cid-ffzmbnih].ok{border-color:var(--ok, #2e9e6b);color:var(--ok, #2e9e6b)}.web-grid[data-astro-cid-ffzmbnih]{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.web-grid[data-astro-cid-ffzmbnih] .card[data-astro-cid-ffzmbnih].link{display:flex;flex-direction:column;gap:3px}\n"}],"routeData":{"route":"/settings/web","isIndex":false,"type":"page","pattern":"^\\/settings\\/web\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}],[{"content":"web","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/web.astro","pathname":"/settings/web","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".settings[data-astro-cid-376iicvc]{--set-top: 16px;display:grid;grid-template-columns:260px 1fr;gap:26px;margin-top:22px;align-items:start}.set-sec[data-astro-cid-376iicvc]{margin-bottom:28px;scroll-margin-top:var(--set-top)}.set-nav[data-astro-cid-376iicvc]{display:flex;flex-direction:column;gap:4px;position:sticky;top:var(--set-top);align-self:start;max-height:calc(100vh - var(--set-top) - 16px);overflow:auto}.set-nav-btn[data-astro-cid-376iicvc]{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:var(--r-sm);text-decoration:none;color:var(--ink-2);transition:background .15s}.set-nav-btn[data-astro-cid-376iicvc]:hover{background:var(--surface-3)}.set-nav-btn[data-astro-cid-376iicvc].on{background:var(--brand-soft)}.set-nav-btn[data-astro-cid-376iicvc].on strong[data-astro-cid-376iicvc]{color:var(--brand-strong)}.set-nav-btn[data-astro-cid-376iicvc] .sn-ico[data-astro-cid-376iicvc]{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--surface-3);color:var(--ink-2);flex:0 0 auto}.set-nav-btn[data-astro-cid-376iicvc] .sn-ico[data-astro-cid-376iicvc] svg[data-astro-cid-376iicvc]{width:19px;height:19px}.set-nav-btn[data-astro-cid-376iicvc].on .sn-ico[data-astro-cid-376iicvc]{background:var(--brand);color:var(--on-brand)}.set-nav-btn[data-astro-cid-376iicvc] strong[data-astro-cid-376iicvc]{display:block;font-size:.92rem}.set-dot[data-astro-cid-376iicvc]{width:9px;height:9px;border-radius:50%;background:var(--line-strong, #c4c2c8);flex:0 0 auto;margin-left:auto}.set-dot[data-astro-cid-376iicvc].on{background:var(--ok, #2e9e6b)}@media(max-width:760px){.settings[data-astro-cid-376iicvc]{grid-template-columns:1fr}.set-nav[data-astro-cid-376iicvc]{flex-direction:row;overflow-x:auto;position:sticky;top:var(--set-top);z-index:5;background:var(--bg);padding:6px 0;max-height:none}.set-nav-btn[data-astro-cid-376iicvc]{flex:0 0 auto}}@media(max-width:720px){.settings[data-astro-cid-376iicvc]{--set-top: 58px}}\n"}],"routeData":{"route":"/settings","isIndex":true,"type":"page","pattern":"^\\/settings\\/?$","segments":[[{"content":"settings","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/settings/index.astro","pathname":"/settings","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"inline","content":".setup-steps[data-astro-cid-jz2jwhht]{display:flex;flex-direction:column;gap:10px;margin:1rem 0}.setup-step[data-astro-cid-jz2jwhht]{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid var(--line-strong);border-radius:var(--r-md);background:var(--surface)}.setup-step[data-astro-cid-jz2jwhht].done{border-color:var(--ok, #1a8a4a);background:var(--surface-2, #f6faf7)}.setup-step[data-astro-cid-jz2jwhht].current{border-color:var(--brand-strong, #1B1D22);box-shadow:0 0 0 2px var(--brand-soft)}.ss-pill[data-astro-cid-jz2jwhht]{font-size:.72rem;font-weight:700;color:var(--on-brand, #fff);background:var(--brand-strong, #1B1D22);border-radius:999px;padding:.1rem .55rem;margin-left:8px}.ss-mark[data-astro-cid-jz2jwhht]{width:36px;height:36px;flex:0 0 auto;border-radius:50%;display:grid;place-items:center;font-weight:800;background:var(--brand-soft);color:var(--brand-strong)}.setup-step[data-astro-cid-jz2jwhht].done .ss-mark[data-astro-cid-jz2jwhht]{background:var(--ok, #1a8a4a);color:#fff}.ss-body[data-astro-cid-jz2jwhht]{flex:1;min-width:0}.ss-title[data-astro-cid-jz2jwhht]{font-weight:700;font-size:1.05rem}.ss-badge[data-astro-cid-jz2jwhht]{font-size:.72rem;color:var(--ok, #1a8a4a);margin-left:8px}.wiz[data-astro-cid-jz2jwhht]{margin:1rem 0;border-left:4px solid var(--brand, #C9A86A)}.wiz-done[data-astro-cid-jz2jwhht]{border-left-color:var(--ok, #1a8a4a)}details[data-astro-cid-jz2jwhht].adv-wiz,details[data-astro-cid-jz2jwhht].adv-later{margin:1rem 0}details[data-astro-cid-jz2jwhht].adv-wiz>summary[data-astro-cid-jz2jwhht],details[data-astro-cid-jz2jwhht].adv-later>summary[data-astro-cid-jz2jwhht]{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;flex-wrap:wrap}details[data-astro-cid-jz2jwhht].adv-wiz>summary[data-astro-cid-jz2jwhht]::-webkit-details-marker,details[data-astro-cid-jz2jwhht].adv-later>summary[data-astro-cid-jz2jwhht]::-webkit-details-marker{display:none}details[data-astro-cid-jz2jwhht].adv-wiz>summary[data-astro-cid-jz2jwhht]:before,details[data-astro-cid-jz2jwhht].adv-later>summary[data-astro-cid-jz2jwhht]:before{content:\"▸\";color:var(--muted);transition:transform .15s}details[data-astro-cid-jz2jwhht].adv-wiz[open]>summary[data-astro-cid-jz2jwhht]:before,details[data-astro-cid-jz2jwhht].adv-later[open]>summary[data-astro-cid-jz2jwhht]:before{transform:rotate(90deg)}.wiz-q[data-astro-cid-jz2jwhht]{margin:.6rem 0}.wiz-h[data-astro-cid-jz2jwhht]{font-weight:700;font-size:.92rem;margin:0 0 .3rem}.wiz-opts[data-astro-cid-jz2jwhht]{display:flex;flex-wrap:wrap;gap:.4rem}.chip[data-astro-cid-jz2jwhht]{display:inline-flex;align-items:center;gap:.35rem;border:1px solid var(--line-strong, #c4c2c8);border-radius:999px;padding:.25rem .7rem;font-size:.85rem;cursor:pointer}.chip[data-astro-cid-jz2jwhht]:has(input:checked){border-color:var(--brand, #C9A86A);background:color-mix(in srgb,var(--brand, #C9A86A) 14%,transparent)}.rcard[data-astro-cid-jz2jwhht]{border:1px solid var(--line, #e5e5e5);border-radius:10px;padding:.6rem .8rem;margin:.5rem 0}.rcard[data-astro-cid-jz2jwhht].best{border-color:var(--brand, #C9A86A);box-shadow:0 0 0 2px color-mix(in srgb,var(--brand, #C9A86A) 25%,transparent)}.rbest[data-astro-cid-jz2jwhht]{display:inline-block;background:var(--brand-strong, #1B1D22);color:#fff;border-radius:6px;padding:.05rem .45rem;font-size:.72rem;font-weight:700;margin-right:.4rem}.rtags[data-astro-cid-jz2jwhht]{display:flex;flex-wrap:wrap;gap:.3rem;margin:.35rem 0}.rtag[data-astro-cid-jz2jwhht]{font-size:.72rem;background:var(--line, #eee);border-radius:6px;padding:.05rem .4rem}.ractions[data-astro-cid-jz2jwhht]{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.3rem}\n"},{"type":"external","src":"_astro/App.De9EUrkh.css"}],"routeData":{"route":"/setup","isIndex":false,"type":"page","pattern":"^\\/setup\\/?$","segments":[[{"content":"setup","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/setup.astro","pathname":"/setup","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/SiteLockGate.oVXP50Ug.css"},{"type":"external","src":"_astro/EventPublic.C30h46-U.css"}],"routeData":{"route":"/site","isIndex":false,"type":"page","pattern":"^\\/site\\/?$","segments":[[{"content":"site","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/site.astro","pathname":"/site","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/sitemap.xml","isIndex":false,"type":"endpoint","pattern":"^\\/sitemap\\.xml$","segments":[[{"content":"sitemap.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sitemap.xml.ts","pathname":"/sitemap.xml","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"inline","content":".bars[data-astro-cid-cq575q6v]{display:flex;align-items:flex-end;gap:4px;height:140px}.bar[data-astro-cid-cq575q6v]{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}.bar[data-astro-cid-cq575q6v] .fill[data-astro-cid-cq575q6v]{width:64%;background:var(--navy);border-radius:3px 3px 0 0;min-height:2px;transition:height .2s}.bar[data-astro-cid-cq575q6v] .bl[data-astro-cid-cq575q6v]{font-size:.82rem;color:var(--muted);margin-top:3px;white-space:nowrap}.u-warn[data-astro-cid-cq575q6v]{color:var(--warn);font-weight:700}.u-over[data-astro-cid-cq575q6v]{color:var(--danger);font-weight:700}.kv-quota[data-astro-cid-cq575q6v]{margin:.4rem 0 1rem}.kv-bar[data-astro-cid-cq575q6v]{height:14px;background:var(--line, #e5e7eb);border-radius:7px;overflow:hidden;margin-bottom:.5rem}.kv-bar[data-astro-cid-cq575q6v]>span[data-astro-cid-cq575q6v]{display:block;height:100%;background:var(--navy);border-radius:7px;transition:width .25s}.kv-bar[data-astro-cid-cq575q6v]>span[data-astro-cid-cq575q6v].over{background:var(--warn)}.reset-line[data-astro-cid-cq575q6v]{display:flex;justify-content:space-between;gap:14px;padding:3px 0;flex-wrap:wrap}.reset-line[data-astro-cid-cq575q6v]>span[data-astro-cid-cq575q6v]{color:var(--muted)}.neuron-cell[data-astro-cid-cq575q6v]{display:flex;flex-direction:column;gap:10px;min-width:150px}.neuron-val[data-astro-cid-cq575q6v]{font-weight:600}.neuron-val[data-astro-cid-cq575q6v] small[data-astro-cid-cq575q6v]{color:var(--muted);font-weight:400}.neuron-cap[data-astro-cid-cq575q6v]{display:flex;align-items:center;gap:8px;font-size:.82rem;color:var(--muted)}.neuron-cap[data-astro-cid-cq575q6v] input[data-astro-cid-cq575q6v]{width:100px}.table-wrap[data-astro-cid-cq575q6v] th[data-astro-cid-cq575q6v],.table-wrap[data-astro-cid-cq575q6v] td[data-astro-cid-cq575q6v]{padding:.7rem .85rem;vertical-align:middle}.table-wrap[data-astro-cid-cq575q6v] td[data-astro-cid-cq575q6v] input[data-astro-cid-cq575q6v],.table-wrap[data-astro-cid-cq575q6v] td[data-astro-cid-cq575q6v] select[data-astro-cid-cq575q6v]{padding:.4rem .55rem}.table-wrap[data-astro-cid-cq575q6v] td[data-astro-cid-cq575q6v] .btn-sm[data-astro-cid-cq575q6v]{margin:2px 4px 2px 0}\n"}],"routeData":{"route":"/usage","isIndex":false,"type":"page","pattern":"^\\/usage\\/?$","segments":[[{"content":"usage","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/usage.astro","pathname":"/usage","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[],"routeData":{"route":"/[sitepage]","isIndex":false,"type":"page","pattern":"^\\/([^/]+?)\\/?$","segments":[[{"content":"sitepage","dynamic":true,"spread":false}]],"params":["sitepage"],"component":"src/pages/[sitepage].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"_astro/page.CZJGP_M3.js"}],"styles":[{"type":"external","src":"_astro/App.De9EUrkh.css"},{"type":"external","src":"_astro/index.DNeW-EBi.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"serverLike":true,"middlewareMode":"classic","base":"/","trailingSlash":"ignore","compressHTML":true,"experimentalQueuedRendering":{"enabled":false,"poolSize":0,"contentCache":false},"componentMetadata":[["/home/runner/work/baku-office/baku-office/apps/client/src/pages/lp/[slug].astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/site.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/event/[slug].astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/events.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/lp/craft-career.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/news.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/news/[slug].astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/admin/data.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/consent.astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/embed/[slug].astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/hub/[id].astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/p/[slug].astro",{"propagation":"none","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/account.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/accounting/index.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/activate.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/approvals.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/apps.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/backup.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/billing.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/calendar.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/dashboard.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/diagnostics.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/directory.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/drive.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/files/index.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/forbidden.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/gmail.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/import.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/invoices.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/join.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/legal.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/login.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/meet.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/membership.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/minutes.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/my-events.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/personal.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/project/[id].astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/projects.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/reports.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/review.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/schedule.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/a2a.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/advanced.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/agent.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/analytics.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/directory.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/display.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/domain.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/events.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/google-setup.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/inbox.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/index.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/integrations.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/keys.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/media.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/members.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/messaging.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/nav.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/news.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/ops.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/org.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/public.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/site.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/site/builder.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/social.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/theme.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/update.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/settings/web.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/setup.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/usage.astro",{"propagation":"in-tree","containsHead":true}],["/home/runner/work/baku-office/baku-office/apps/client/src/layouts/App.astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/account@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:pages",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:manifest",{"propagation":"in-tree","containsHead":false}],["/home/runner/work/baku-office/baku-office/node_modules/astro/dist/core/app/entrypoints/virtual/prod.js",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:app",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/accounting/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/activate@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/app/[id]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/approvals@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/apps@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/backup@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/billing@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/calendar@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/dashboard@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/diagnostics@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/directory@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/drive@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/files/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/forbidden@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/gmail@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/import@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/invoices@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/join@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/legal@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/login@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/meet@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/membership@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/minutes@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/my-events@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/personal@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/project/[id]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/projects@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/reports@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/review@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/schedule@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/a2a@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/advanced@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/agent@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/analytics@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/directory@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/display@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/domain@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/events@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/google-setup@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/inbox@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/integrations@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/keys@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/media@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/members@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/messaging@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/nav@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/news@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/ops@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/org@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/public@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/site@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/site/builder@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/social@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/theme@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/update@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/settings/web@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/setup@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000virtual:astro:page:src/pages/usage@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"/home/runner/work/baku-office/baku-office/packages/shared/src/index.ts":"chunks/index_D2iS05Cq.mjs","\u0000virtual:astro:actions/noop-entrypoint":"chunks/noop-entrypoint_DsBX4kaI.mjs","\u0000virtual:astro:server-island-manifest":"chunks/_virtual_astro_server-island-manifest_CFl7y3Qj.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/memory.ts":"chunks/memory_CYyQ4i1p.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/social.ts":"chunks/social_BykrS1Yu.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/theme.ts":"chunks/theme_DFty9gzU.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/projects.ts":"chunks/projects_B_gexkwU.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/membership.ts":"chunks/membership_DQ1fLu2V.mjs","\u0000virtual:astro:session-driver":"chunks/_virtual_astro_session-driver_Csu6PJY6.mjs","/home/runner/work/baku-office/baku-office/apps/client/node_modules/@astrojs/cloudflare/dist/utils/static-image-collection.js":"chunks/static-image-collection_CCF3oKHg.mjs","virtual:cloudflare/worker-entry":"entry.mjs","\u0000virtual:astro:middleware":"virtual_astro_middleware.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/client.ts":"chunks/client_F4fksau0.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/auth.ts":"chunks/auth_DL5yvmzT.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/custom-domain.ts":"chunks/custom-domain_BlEKJqw-.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/site-routing.ts":"chunks/site-routing_D_cHuHu3.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/errors.ts":"chunks/errors_Cz86HmdL.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/diag.ts":"chunks/diag_CY3PJnOM.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/kv.ts":"chunks/kv_JIFmI05h.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/profiles.ts":"chunks/profiles_D3vLhBYo.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/apps.ts":"chunks/apps_qko8nJrR.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/storage.ts":"chunks/storage_BHLYBEBb.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/google.ts":"chunks/google_DFar0IbF.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/egress.ts":"chunks/egress_5_OuCaR0.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/users.ts":"chunks/users_DArBIlQW.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/parts/calendar.ts":"chunks/calendar_cTVYBYHh.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/notifications.ts":"chunks/notifications_DKh03i2Y.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/usage.ts":"chunks/usage_CfukLLAj.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/models/config.ts":"chunks/config_2o5HV4Wj.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/settings.ts":"chunks/settings_dTyIbTCR.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/google-sa.ts":"chunks/google-sa_3CXcw4Dg.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/appdef.ts":"chunks/appdef_CBJw5awM.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/ai.ts":"chunks/ai_Dn536Rzr.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/a2a.ts":"chunks/a2a_CFW4H8ZE.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/autonomy.ts":"chunks/autonomy_BR9KrOCt.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/skills.ts":"chunks/skills_Be49B9yx.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/store.ts":"chunks/store_D30lmPXJ.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/capabilities.ts":"chunks/capabilities_DGQUed42.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/approvals.ts":"chunks/approvals_CEi6BOlb.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/a2a-actions.ts":"chunks/a2a-actions_EJRkCxpU.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/update.ts":"chunks/update_BZb99hDh.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/storage-usage.ts":"chunks/storage-usage_CAVmHTS3.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/public-pages.ts":"chunks/public-pages_DHQdIiIX.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/sites.ts":"chunks/sites_DMFBMYur.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/drive.ts":"chunks/drive_BU5bDSNm.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/reports.ts":"chunks/reports_CwNccJnM.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/blocks/defs.ts":"chunks/defs_DgmjYFRV.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/journal.ts":"chunks/journal_CPKMU7C_.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/reception.ts":"chunks/reception_cJlTAjNe.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/fixed-assets.ts":"chunks/fixed-assets_B-_ABDN3.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/register.ts":"chunks/register_BlCGyPLB.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/agent-jobs.ts":"chunks/agent-jobs_DaGtU1F5.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/oauth.ts":"chunks/oauth_BlD-15-T.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/webview.ts":"chunks/webview_V8PPSFH4.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/backup.ts":"chunks/backup_CQuZgyNM.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/scheduled-tasks.ts":"chunks/scheduled-tasks_DLesrd8F.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/inbound/discord.ts":"chunks/discord_MitODRRb.mjs","\u0000virtual:astro:page:src/pages/api/discord/link/start@_@ts":"chunks/start_ClHEzLou.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/events.ts":"chunks/events_DvycExYH.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/import.ts":"chunks/import_DtV2QKSa.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/site-nav.ts":"chunks/site-nav_BtEfeAEe.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/news.ts":"chunks/news_BXvjBFaK.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/notion-oauth.ts":"chunks/notion-oauth_Cg9XxEMi.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/payments.ts":"chunks/payments_BuytDk0e.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/kpi.ts":"chunks/kpi_BmbE7XHM.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/task-log.ts":"chunks/task-log_BGzViZew.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/self-check.ts":"chunks/self-check_CChoVSYc.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/nav.ts":"chunks/nav_CqD0IXOG.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/core/home.ts":"chunks/home_iZZVavtW.mjs","/home/runner/work/baku-office/baku-office/apps/client/node_modules/@astrojs/cloudflare/dist/entrypoints/image-service-workerd.js":"chunks/image-service-workerd_D_1w3ZTg.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/chat-flow.ts":"chunks/chat-flow_CD0ZG1R9.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/upload-queue.ts":"chunks/upload-queue_B0YYP6NN.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/usage-digest.ts":"chunks/usage-digest_BEX2WCjN.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/cf-provision.ts":"chunks/cf-provision_C2s8s1mc.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/conn-status.ts":"chunks/conn-status_DKuiC5qX.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/disclosure.ts":"chunks/disclosure_Cv_kPxVT.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/lib/legal-templates.ts":"chunks/legal-templates_DcdGoCNh.mjs","\u0000virtual:astro:page:src/pages/.well-known/jwks.json@_@ts":"chunks/jwks_CsiS37L0.mjs","\u0000virtual:astro:page:src/pages/.well-known/openid-configuration@_@ts":"chunks/openid-configuration_D2KRfFkx.mjs","\u0000virtual:astro:page:src/pages/account@_@astro":"chunks/account_CZYO80Z3.mjs","\u0000virtual:astro:page:src/pages/accounting/export.csv@_@ts":"chunks/export_DhYMBBBF.mjs","\u0000virtual:astro:page:src/pages/accounting/yayoi.csv@_@ts":"chunks/yayoi_Do_7-xzO.mjs","\u0000virtual:astro:page:src/pages/activate@_@astro":"chunks/activate_BIr1iWVb.mjs","\u0000virtual:astro:page:src/pages/api/a2a/inbound@_@ts":"chunks/inbound_D8OdjjQX.mjs","\u0000virtual:astro:page:src/pages/api/a2a/manage@_@ts":"chunks/manage_BZ9T9MRc.mjs","\u0000virtual:astro:page:src/pages/api/accounting/asset@_@ts":"chunks/asset_qp3aflJm.mjs","\u0000virtual:astro:page:src/pages/api/accounting/closure@_@ts":"chunks/closure_D7GQv1nu.mjs","\u0000virtual:astro:page:src/pages/api/accounting/journal@_@ts":"chunks/journal_BIVIK669.mjs","\u0000virtual:astro:page:src/pages/api/accounting/suggest-account@_@ts":"chunks/suggest-account_B6ODq2zF.mjs","\u0000virtual:astro:page:src/pages/api/accounting/wallet@_@ts":"chunks/wallet_iGeoVnNd.mjs","\u0000virtual:astro:page:src/pages/api/activity@_@ts":"chunks/activity_DRTgP70B.mjs","\u0000virtual:astro:page:src/pages/api/agent-actions@_@ts":"chunks/agent-actions_CTATwLl9.mjs","\u0000virtual:astro:page:src/pages/api/app-ask@_@ts":"chunks/app-ask_BMNCj5zs.mjs","\u0000virtual:astro:page:src/pages/api/app-audit@_@ts":"chunks/app-audit_B-Vv-fD2.mjs","\u0000virtual:astro:page:src/pages/api/app-drafts@_@ts":"chunks/app-drafts_BopBBcJk.mjs","\u0000virtual:astro:page:src/pages/api/app-edit@_@ts":"chunks/app-edit_BjPFuSQ_.mjs","\u0000virtual:astro:page:src/pages/api/app-from-csv@_@ts":"chunks/app-from-csv_B_tBfFum.mjs","\u0000virtual:astro:page:src/pages/api/app-run@_@ts":"chunks/app-run_-UPliDj9.mjs","\u0000virtual:astro:page:src/pages/api/auth/google/relay@_@ts":"chunks/relay_CxhOqFAf.mjs","\u0000virtual:astro:page:src/pages/api/auth/[provider]/callback@_@ts":"chunks/callback_DpedW5tD.mjs","\u0000virtual:astro:page:src/pages/api/auth/[provider]/start@_@ts":"chunks/start_D-lvWP5e.mjs","\u0000virtual:astro:page:src/pages/api/autopilot@_@ts":"chunks/autopilot_D3TD452_.mjs","\u0000virtual:astro:page:src/pages/api/backup@_@ts":"chunks/backup_CgKPIxoF.mjs","\u0000virtual:astro:page:src/pages/api/billing/start@_@ts":"chunks/start_C2x8fgIB.mjs","\u0000virtual:astro:page:src/pages/api/capabilities@_@ts":"chunks/capabilities_DVtvl0yu.mjs","\u0000virtual:astro:page:src/pages/api/chat/stream@_@ts":"chunks/stream_BPvRaCLC.mjs","\u0000virtual:astro:page:src/pages/api/chat@_@ts":"chunks/chat_BirWhDop.mjs","\u0000virtual:astro:page:src/pages/api/chat-sessions@_@ts":"chunks/chat-sessions_DvMKuFfu.mjs","\u0000virtual:astro:page:src/pages/api/connectors@_@ts":"chunks/connectors_DCZpf05V.mjs","\u0000virtual:astro:page:src/pages/api/consent@_@ts":"chunks/consent_B25LKNHa.mjs","\u0000virtual:astro:page:src/pages/api/contact@_@ts":"chunks/contact_D12UwxHu.mjs","\u0000virtual:astro:page:src/pages/api/data@_@ts":"chunks/data_BwSfQOwj.mjs","\u0000virtual:astro:page:src/pages/api/directory@_@ts":"chunks/directory_Ck_EAAYN.mjs","\u0000virtual:astro:page:src/pages/api/discord/link/callback@_@ts":"chunks/callback_BUtf94SN.mjs","\u0000virtual:astro:page:src/pages/api/discord/panel@_@ts":"chunks/panel_BhpSlbEx.mjs","\u0000virtual:astro:page:src/pages/api/discord/register@_@ts":"chunks/register_Qw3cy7Z9.mjs","\u0000virtual:astro:page:src/pages/api/discord/setup@_@ts":"chunks/setup_D3RL6TNP.mjs","\u0000virtual:astro:page:src/pages/api/docs@_@ts":"chunks/docs_DOtpg0iD.mjs","\u0000virtual:astro:page:src/pages/api/drive/callback@_@ts":"chunks/callback_Bmfc8sOl.mjs","\u0000virtual:astro:page:src/pages/api/drive/start@_@ts":"chunks/start_Ds1nKbQb.mjs","\u0000virtual:astro:page:src/pages/api/drive@_@ts":"chunks/drive_YcFmcLRv.mjs","\u0000virtual:astro:page:src/pages/api/event/apply@_@ts":"chunks/apply_DBRgxaZk.mjs","\u0000virtual:astro:page:src/pages/api/event/pay@_@ts":"chunks/pay_CO4iitbK.mjs","\u0000virtual:astro:page:src/pages/api/event@_@ts":"chunks/event_BkeJHqow.mjs","\u0000virtual:astro:page:src/pages/api/ext/[appId]@_@ts":"chunks/_appId__B26EzPOg.mjs","\u0000virtual:astro:page:src/pages/api/ext-token@_@ts":"chunks/ext-token_ByiK7ilS.mjs","\u0000virtual:astro:page:src/pages/api/feedback@_@ts":"chunks/feedback_CpHhzVpv.mjs","\u0000virtual:astro:page:src/pages/api/files@_@ts":"chunks/files_C-pKBMdW.mjs","\u0000virtual:astro:page:src/pages/api/google/callback@_@ts":"chunks/callback_CVyXijPZ.mjs","\u0000virtual:astro:page:src/pages/api/google/start@_@ts":"chunks/start_w2r_F4Md.mjs","\u0000virtual:astro:page:src/pages/api/google/wif-handoff@_@ts":"chunks/wif-handoff_BoL9a7j0.mjs","\u0000virtual:astro:page:src/pages/api/google@_@ts":"chunks/google_Xt3x1jns.mjs","\u0000virtual:astro:page:src/pages/api/import@_@ts":"chunks/import_CZ7l3z9n.mjs","\u0000virtual:astro:page:src/pages/api/invoices@_@ts":"chunks/invoices_CLFZSGfs.mjs","\u0000virtual:astro:page:src/pages/api/join@_@ts":"chunks/join_O5UKR3_t.mjs","\u0000virtual:astro:page:src/pages/api/keys@_@ts":"chunks/keys_BgpJhF8Q.mjs","\u0000virtual:astro:page:src/pages/api/line/setup@_@ts":"chunks/setup_56rvIvYc.mjs","\u0000virtual:astro:page:src/pages/api/login@_@ts":"chunks/login_Dw8MVy9o.mjs","\u0000virtual:astro:page:src/pages/api/me/leave-request@_@ts":"chunks/leave-request_THTu3Wmq.mjs","\u0000virtual:astro:page:src/pages/api/me/profile@_@ts":"chunks/profile_BsXA9GVu.mjs","\u0000virtual:astro:page:src/pages/api/members@_@ts":"chunks/members_OtIRhj5S.mjs","\u0000virtual:astro:page:src/pages/api/membership@_@ts":"chunks/membership_DUVItBZo.mjs","\u0000virtual:astro:page:src/pages/api/nav@_@ts":"chunks/nav_BNqpVx56.mjs","\u0000virtual:astro:page:src/pages/api/news@_@ts":"chunks/news_CsO4lCUS.mjs","\u0000virtual:astro:page:src/pages/api/notifications@_@ts":"chunks/notifications_DiC7Kknj.mjs","\u0000virtual:astro:page:src/pages/api/notion/oauth/callback@_@ts":"chunks/callback_CReYBCLr.mjs","\u0000virtual:astro:page:src/pages/api/notion/oauth/start@_@ts":"chunks/start_vWiYStTL.mjs","\u0000virtual:astro:page:src/pages/api/p/[slug]@_@ts":"chunks/_slug__BnL5vl3G.mjs","\u0000virtual:astro:page:src/pages/api/personal@_@ts":"chunks/personal_C7kOkFC9.mjs","\u0000virtual:astro:page:src/pages/api/plan-request@_@ts":"chunks/plan-request_DoG7SebL.mjs","\u0000virtual:astro:page:src/pages/api/precheck@_@ts":"chunks/precheck_BsyTppac.mjs","\u0000virtual:astro:page:src/pages/api/projects@_@ts":"chunks/projects_yYQYevrY.mjs","\u0000virtual:astro:page:src/pages/api/public/manage@_@ts":"chunks/manage_CPalVKPe.mjs","\u0000virtual:astro:page:src/pages/api/push@_@ts":"chunks/push_BXQqf4Gm.mjs","\u0000virtual:astro:page:src/pages/api/pv@_@ts":"chunks/pv_BfPjq1KF.mjs","\u0000virtual:astro:page:src/pages/api/report@_@ts":"chunks/report_CEJSGNiW.mjs","\u0000virtual:astro:page:src/pages/api/reports/kpi@_@ts":"chunks/kpi_DokKoWTU.mjs","\u0000virtual:astro:page:src/pages/api/review@_@ts":"chunks/review_fKvzgzHh.mjs","\u0000virtual:astro:page:src/pages/api/schedule-sync@_@ts":"chunks/schedule-sync_BIWleL4u.mjs","\u0000virtual:astro:page:src/pages/api/scheduled-tasks@_@ts":"chunks/scheduled-tasks_BnfVELZh.mjs","\u0000virtual:astro:page:src/pages/api/self-check@_@ts":"chunks/self-check_Bzu9x6BF.mjs","\u0000virtual:astro:page:src/pages/api/settings@_@ts":"chunks/settings_Dj0owle_.mjs","\u0000virtual:astro:page:src/pages/api/site/join@_@ts":"chunks/join_CjwoQYl2.mjs","\u0000virtual:astro:page:src/pages/api/site/stripe-webhook@_@ts":"chunks/stripe-webhook_Chhyp1RJ.mjs","\u0000virtual:astro:page:src/pages/api/site@_@ts":"chunks/site_BCazqZ-d.mjs","\u0000virtual:astro:page:src/pages/api/site-media/[id]@_@ts":"chunks/_id__BYOxSJJm.mjs","\u0000virtual:astro:page:src/pages/api/site-media@_@ts":"chunks/site-media_CavC8HSS.mjs","\u0000virtual:astro:page:src/pages/api/site-unlock@_@ts":"chunks/site-unlock_oK1YVI0Y.mjs","\u0000virtual:astro:page:src/pages/api/skills@_@ts":"chunks/skills_qjKiY_wC.mjs","\u0000virtual:astro:page:src/pages/api/slack/setup@_@ts":"chunks/setup_gfMxpIWg.mjs","\u0000virtual:astro:page:src/pages/api/store@_@ts":"chunks/store_CouvoScR.mjs","\u0000virtual:astro:page:src/pages/api/translate@_@ts":"chunks/translate_Dd1OFe7o.mjs","\u0000virtual:astro:page:src/pages/api/tts@_@ts":"chunks/tts_Db2cH1GN.mjs","\u0000virtual:astro:page:src/pages/api/tx@_@ts":"chunks/tx_CishHCPP.mjs","\u0000virtual:astro:page:src/pages/api/update@_@ts":"chunks/update_BvA_Ky4n.mjs","\u0000virtual:astro:page:src/pages/api/usage@_@ts":"chunks/usage_B0fwUy9k.mjs","\u0000virtual:astro:page:src/pages/api/usage-report@_@ts":"chunks/usage-report_CRJRRc1f.mjs","\u0000virtual:astro:page:src/pages/approvals@_@astro":"chunks/approvals_DjgmB438.mjs","\u0000virtual:astro:page:src/pages/billing@_@astro":"chunks/billing_Dja0L9Cw.mjs","\u0000virtual:astro:page:src/pages/calendar@_@astro":"chunks/calendar_CtlIXkDQ.mjs","\u0000virtual:astro:page:src/pages/chat@_@astro":"chunks/chat_BreP2uKn.mjs","\u0000virtual:astro:page:src/pages/diagnostics@_@astro":"chunks/diagnostics_CXH5RJRo.mjs","\u0000virtual:astro:page:src/pages/directory@_@astro":"chunks/directory_BKnDDhaP.mjs","\u0000virtual:astro:page:src/pages/drive@_@astro":"chunks/drive_MRHr3c5s.mjs","\u0000virtual:astro:page:src/pages/events@_@astro":"chunks/events_C-sCuq75.mjs","\u0000virtual:astro:page:src/pages/favicon.ico@_@ts":"chunks/favicon_CO8aEwKh.mjs","\u0000virtual:astro:page:src/pages/files/[id]@_@ts":"chunks/_id__DSOX6G9E.mjs","\u0000virtual:astro:page:src/pages/files/index@_@astro":"chunks/index_BP1RQrVt.mjs","\u0000virtual:astro:page:src/pages/forbidden@_@astro":"chunks/forbidden_I7PAahIg.mjs","\u0000virtual:astro:page:src/pages/gmail@_@astro":"chunks/gmail_jLL_MVzB.mjs","\u0000virtual:astro:page:src/pages/import@_@astro":"chunks/import_DIsOMSiI.mjs","\u0000virtual:astro:page:src/pages/invoices@_@astro":"chunks/invoices_xlXW4HLG.mjs","\u0000virtual:astro:page:src/pages/join@_@astro":"chunks/join_DiVRcoTi.mjs","\u0000virtual:astro:page:src/pages/legal@_@astro":"chunks/legal_DByx-JA_.mjs","\u0000virtual:astro:page:src/pages/lp/craft-career@_@astro":"chunks/craft-career_CdAxS53l.mjs","\u0000virtual:astro:page:src/pages/lp/[slug]@_@astro":"chunks/_slug__BEjhZCsT.mjs","\u0000virtual:astro:page:src/pages/meet@_@astro":"chunks/meet_DoN_0rwb.mjs","\u0000virtual:astro:page:src/pages/membership@_@astro":"chunks/membership_Bj0Hwkc7.mjs","\u0000virtual:astro:page:src/pages/minutes@_@astro":"chunks/minutes_ClYC3rSj.mjs","\u0000virtual:astro:page:src/pages/my-events@_@astro":"chunks/my-events_NafSdGgl.mjs","\u0000virtual:astro:page:src/pages/news/[slug]@_@astro":"chunks/_slug__BqDikAY6.mjs","\u0000virtual:astro:page:src/pages/news@_@astro":"chunks/news_C09jt2aH.mjs","\u0000virtual:astro:page:src/pages/personal@_@astro":"chunks/personal_Cc5VF-UZ.mjs","\u0000virtual:astro:page:src/pages/review@_@astro":"chunks/review_DSl3Bvxy.mjs","\u0000virtual:astro:page:src/pages/robots.txt@_@ts":"chunks/robots_m-h_0FAd.mjs","\u0000virtual:astro:page:src/pages/settings/a2a@_@astro":"chunks/a2a_SObwu-Og.mjs","\u0000virtual:astro:page:src/pages/settings/analytics@_@astro":"chunks/analytics_BVEpTNbm.mjs","\u0000virtual:astro:page:src/pages/settings/connectors@_@astro":"chunks/connectors_DNH3uZf9.mjs","\u0000virtual:astro:page:src/pages/settings/directory@_@astro":"chunks/directory_Du-_OTVr.mjs","\u0000virtual:astro:page:src/pages/settings/display@_@astro":"chunks/display_DAh2pgTY.mjs","\u0000virtual:astro:page:src/pages/settings/domain@_@astro":"chunks/domain_C4yrIOYg.mjs","\u0000virtual:astro:page:src/pages/settings/events@_@astro":"chunks/events_CBBtS9Xp.mjs","\u0000virtual:astro:page:src/pages/settings/inbox@_@astro":"chunks/inbox_BagChmH7.mjs","\u0000virtual:astro:page:src/pages/settings/media@_@astro":"chunks/media_BEUaKyO_.mjs","\u0000virtual:astro:page:src/pages/settings/nav@_@astro":"chunks/nav_1_0syb4v.mjs","\u0000virtual:astro:page:src/pages/settings/news@_@astro":"chunks/news_CFn3tkzP.mjs","\u0000virtual:astro:page:src/pages/settings/public@_@astro":"chunks/public_PdQzzk06.mjs","\u0000virtual:astro:page:src/pages/settings/site@_@astro":"chunks/site_KUxgnNoo.mjs","\u0000virtual:astro:page:src/pages/settings/social@_@astro":"chunks/social_Dv9oMgt4.mjs","\u0000virtual:astro:page:src/pages/site@_@astro":"chunks/site_CtIhngP_.mjs","\u0000virtual:astro:page:src/pages/sitemap.xml@_@ts":"chunks/sitemap_B8fIvc3H.mjs","\u0000virtual:astro:page:src/pages/[sitepage]@_@astro":"chunks/_sitepage__cMyBef-L.mjs","\u0000virtual:astro:page:src/pages/404@_@astro":"chunks/404_CdtlpKor.mjs","\u0000virtual:astro:page:src/pages/accounting/index@_@astro":"chunks/index_DWkzmmrj.mjs","\u0000virtual:astro:page:src/pages/admin/data@_@astro":"chunks/data_RW7rPozP.mjs","\u0000virtual:astro:page:src/pages/api/accounting/import-csv@_@ts":"chunks/import-csv_9M_3AcD2.mjs","\u0000virtual:astro:page:src/pages/api/app-export@_@ts":"chunks/app-export_C3csFgos.mjs","\u0000virtual:astro:page:src/pages/api/cron/drain@_@ts":"chunks/drain_xD4nBjF9.mjs","\u0000virtual:astro:page:src/pages/api/logo@_@ts":"chunks/logo_PmNbp4ae.mjs","\u0000virtual:astro:page:src/pages/api/mascot@_@ts":"chunks/mascot_B_nQ6xBw.mjs","\u0000virtual:astro:page:src/pages/app/[id]@_@astro":"chunks/_id__Bh14KCkH.mjs","\u0000virtual:astro:page:src/pages/backup@_@astro":"chunks/backup_CA2rjV0w.mjs","\u0000virtual:astro:page:src/pages/consent@_@astro":"chunks/consent_BW1SoCHu.mjs","\u0000virtual:astro:page:src/pages/embed/[slug]@_@astro":"chunks/_slug__ChfDlqwT.mjs","\u0000virtual:astro:page:src/pages/event/[slug]@_@astro":"chunks/_slug__DgW_Trzy.mjs","\u0000virtual:astro:page:src/pages/hub/[id]@_@astro":"chunks/_id__CIYlyR_5.mjs","\u0000virtual:astro:page:src/pages/login@_@astro":"chunks/login_DO2HCfDo.mjs","\u0000virtual:astro:page:src/pages/p/[slug]@_@astro":"chunks/_slug__BNAg91lz.mjs","\u0000virtual:astro:page:src/pages/project/[id]@_@astro":"chunks/_id__4enW4kWY.mjs","\u0000virtual:astro:page:src/pages/projects@_@astro":"chunks/projects_Cskoou9Q.mjs","\u0000virtual:astro:page:src/pages/reports@_@astro":"chunks/reports_MsXsVsXs.mjs","\u0000virtual:astro:page:src/pages/schedule@_@astro":"chunks/schedule_BwFtXamt.mjs","\u0000virtual:astro:page:src/pages/settings/advanced@_@astro":"chunks/advanced_DkqIoV8t.mjs","\u0000virtual:astro:page:src/pages/settings/agent@_@astro":"chunks/agent_DMokHQiI.mjs","\u0000virtual:astro:page:src/pages/settings/google-setup@_@astro":"chunks/google-setup_D5fSYCqe.mjs","\u0000virtual:astro:page:src/pages/settings/integrations@_@astro":"chunks/integrations_BcJXjI2K.mjs","\u0000virtual:astro:page:src/pages/settings/keys@_@astro":"chunks/keys_C8Bh-3dX.mjs","\u0000virtual:astro:page:src/pages/settings/members@_@astro":"chunks/members_BpJBodrH.mjs","\u0000virtual:astro:page:src/pages/settings/messaging@_@astro":"chunks/messaging_U1IMpxfa.mjs","\u0000virtual:astro:page:src/pages/settings/ops@_@astro":"chunks/ops_rqQjBUPy.mjs","\u0000virtual:astro:page:src/pages/settings/org@_@astro":"chunks/org_BTOivk5I.mjs","\u0000virtual:astro:page:src/pages/settings/site/builder@_@astro":"chunks/builder_XL09nYHK.mjs","\u0000virtual:astro:page:src/pages/settings/theme@_@astro":"chunks/theme_BNMb-hA1.mjs","\u0000virtual:astro:page:src/pages/settings/update@_@astro":"chunks/update_BixDP8Gj.mjs","\u0000virtual:astro:page:src/pages/settings/web@_@astro":"chunks/web_Ci_n075i.mjs","\u0000virtual:astro:page:src/pages/settings/index@_@astro":"chunks/index_Jy2ZVUka.mjs","\u0000virtual:astro:page:src/pages/setup@_@astro":"chunks/setup_CTclNWQR.mjs","\u0000virtual:astro:page:src/pages/usage@_@astro":"chunks/usage_DJoPSoGY.mjs","\u0000virtual:astro:page:src/pages/index@_@astro":"chunks/index_BOzQeePR.mjs","\u0000virtual:astro:page:src/pages/apps@_@astro":"chunks/apps_lPoCwOeI.mjs","\u0000virtual:astro:page:src/pages/api/inbound/[connector]@_@ts":"chunks/_connector__DoLh4eHl.mjs","\u0000virtual:astro:page:src/pages/dashboard@_@astro":"chunks/dashboard_CdcVuC36.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/parts/index.ts":"chunks/index_pgwuXuOD.mjs","/home/runner/work/baku-office/baku-office/apps/client/src/layouts/App.astro?astro&type=script&index=0&lang.ts":"_astro/App.astro_astro_type_script_index_0_lang.ByrpcIqf.js","/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=0&lang.ts":"_astro/_id_.astro_astro_type_script_index_0_lang.C6q6qf1V.js","/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=1&lang.ts":"_astro/_id_.astro_astro_type_script_index_1_lang.DEOp_3Z8.js","/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=2&lang.ts":"_astro/_id_.astro_astro_type_script_index_2_lang.CZnfPkaw.js","/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=3&lang.ts":"_astro/_id_.astro_astro_type_script_index_3_lang.lSPjGzBN.js","/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=4&lang.ts":"_astro/_id_.astro_astro_type_script_index_4_lang.C_pnBSYW.js","/home/runner/work/baku-office/baku-office/apps/client/src/pages/reports.astro?astro&type=script&index=0&lang.ts":"_astro/reports.astro_astro_type_script_index_0_lang.CJegca6I.js","/home/runner/work/baku-office/baku-office/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts":"_astro/ClientRouter.astro_astro_type_script_index_0_lang.C_fWNoU0.js","astro:scripts/page.js":"_astro/page.CZJGP_M3.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=1&lang.ts","globalThis.process??={};globalThis.process.env??={};if(!window.__boAppBridge){window.__boAppBridge=!0;const h=(c,o,p)=>Math.max(o,Math.min(p,c));window.addEventListener(\"message\",async c=>{const o=document.getElementById(\"app-frame\");if(!o||c.source!==o.contentWindow)return;const p=\"boapp:storage:\"+(o.dataset.app||\"_\"),y=()=>{try{return JSON.parse(localStorage.getItem(p)||\"{}\")}catch{return{}}},f=e=>{try{localStorage.setItem(p,JSON.stringify(e))}catch{}},t=c.data;if(!(!t||t.__bo!==1)){if(t.type===\"resize\"&&typeof t.height==\"number\"){const e=Math.max(360,window.innerHeight-200);o.style.height=h(Math.max(t.height,e),e,6e3)+\"px\";return}if(t.type===\"storageReq\"){o.contentWindow?.postMessage({__bo:1,type:\"storageInit\",data:y()},\"*\");return}if(t.type===\"storage\"){if(t.op===\"clear\"){f({});return}const e=y();t.op===\"set\"&&typeof t.key==\"string\"?e[t.key]=String(t.value??\"\"):t.op===\"remove\"&&typeof t.key==\"string\"&&delete e[t.key],f(e);return}if(t.type===\"listen\"){const e=t,n=window;n.__boRec=n.__boRec||{};const a=n.__boRec,s=r=>o.contentWindow?.postMessage(Object.assign({__bo:1,reqId:e.reqId},r),\"*\");if(e.action===\"stop\"){try{a[e.reqId]?.stop()}catch{}return}const g=n.SpeechRecognition||n.webkitSpeechRecognition;if(!g){s({type:\"listenError\",error:\"unsupported\"});return}try{const r=new g;r.lang=e.lang||\"ja-JP\",r.interimResults=e.interim!==!1,r.continuous=e.continuous!==!1,r.onresult=i=>{let l=\"\",u=\"\";for(let d=i.resultIndex;d<i.results.length;d++){const m=i.results[d][0].transcript;i.results[d].isFinal?u+=m:l+=m}u&&s({type:\"listenResult\",text:u,isFinal:!0}),l&&s({type:\"listenResult\",text:l,isFinal:!1})},r.onerror=i=>s({type:\"listenError\",error:i.error||\"error\"}),r.onend=()=>{delete a[e.reqId],s({type:\"listenEnd\"})},a[e.reqId]=r,r.start()}catch(r){s({type:\"listenError\",error:r.message})}return}if(t.type===\"run\"){let e;try{const a=!!document.getElementById(\"preview-bar\")?{draftId:o.dataset.app,screenId:t.screenId||void 0,inputs:t.inputs&&typeof t.inputs==\"object\"?t.inputs:{}}:{appId:o.dataset.app,screenId:t.screenId||void 0,inputs:t.inputs&&typeof t.inputs==\"object\"?t.inputs:{}};e=await(await fetch(\"/api/app-run\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify(a)})).json()}catch(n){e={ok:!1,error:n.message}}o.contentWindow?.postMessage({__bo:1,type:\"result\",reqId:t.reqId,ok:!!e.ok,output:e.output,error:e.error,code:e.code},\"*\"),(e.code===\"E6012\"||e.code===\"E6011\")&&window.__boRuntimeRepair?.({code:e.code,error:e.error})}}})}"],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/app/[id].astro?astro&type=script&index=4&lang.ts","globalThis.process??={};globalThis.process.env??={};document.addEventListener(\"astro:page-load\",()=>{const t=document.getElementById(\"app-fav\");t?.addEventListener(\"click\",async()=>{t.disabled=!0;try{const e=!!(await(await fetch(\"/api/settings\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({_action:\"fav_toggle\",appId:t.dataset.app})})).json()).fav;t.dataset.fav=e?\"1\":\"0\",t.textContent=e?\"★ お気に入り\":\"☆ お気に入り\",t.setAttribute(\"aria-pressed\",e?\"true\":\"false\")}catch{}finally{t.disabled=!1}})});"],["/home/runner/work/baku-office/baku-office/apps/client/src/pages/reports.astro?astro&type=script&index=0&lang.ts","globalThis.process??={};globalThis.process.env??={};document.getElementById(\"printBtn\")?.addEventListener(\"click\",()=>window.print());document.getElementById(\"saveLabor\")?.addEventListener(\"click\",async()=>{const e={};document.querySelectorAll(\".lab-min\").forEach(t=>{e[t.dataset.kind]=Number(t.value||0)});const n=Number(document.getElementById(\"hourly\").value||0);(await fetch(\"/api/reports/kpi\",{method:\"POST\",headers:{\"content-type\":\"application/json\"},body:JSON.stringify({hourlyJpy:n,minutesByKind:e})})).ok?location.reload():alert(\"保存に失敗しました\")});"]],"assets":["/favicon.svg","/manifest.webmanifest","/sw.js","/_astro/App.astro_astro_type_script_index_0_lang.ByrpcIqf.js","/_astro/ClientRouter.astro_astro_type_script_index_0_lang.C_fWNoU0.js","/_astro/_id_.astro_astro_type_script_index_0_lang.C6q6qf1V.js","/_astro/_id_.astro_astro_type_script_index_2_lang.CZnfPkaw.js","/_astro/_id_.astro_astro_type_script_index_3_lang.lSPjGzBN.js","/_astro/index.BoDvhrns.js","/_astro/page.CZJGP_M3.js","/img/craft-event.jpg","/img/craft-hero.jpg","/mascot/baku.png","/mascot/baku.webp","/_astro/App.De9EUrkh.css","/_astro/EventPublic.C30h46-U.css","/_astro/SiteLockGate.oVXP50Ug.css","/_astro/apps.BcCIHoWZ.css","/_astro/dashboard.-6sVdypn.css","/_astro/index.DNeW-EBi.css","/_astro/google-setup.BIyjAtgt.css","/_astro/messaging.DEScgiIY.css","/_astro/builder.BWJC6ILG.css","/_astro/page.CZJGP_M3.js"],"buildFormat":"directory","checkOrigin":true,"actionBodySizeLimit":1048576,"serverIslandBodySizeLimit":1048576,"allowedDomains":[],"key":"426zddWoK+ddRS8ph+XfZjWYHZU7tTBqka7pR8YwtPE=","sessionConfig":{"driver":"unstorage/drivers/cloudflare-kv-binding","options":{"binding":"SESSION"}},"image":{},"devToolbar":{"enabled":false,"debugInfoOutput":""},"logLevel":"info","shouldInjectCspMetaTags":false});
const manifestRoutes = _manifest.routes;
const manifest = Object.assign(_manifest, {
  renderers,
  actions: () => import("./noop-entrypoint_DsBX4kaI.mjs"),
  middleware: () => import("../virtual_astro_middleware.mjs"),
  sessionDriver: () => import("./_virtual_astro_session-driver_Csu6PJY6.mjs"),
  serverIslandMappings: () => import("./_virtual_astro_server-island-manifest_CFl7y3Qj.mjs"),
  routes: manifestRoutes,
  pageMap
});
const createApp$1 = ({ streaming } = {}) => {
  const app2 = new App(manifest, streaming);
  app2.setFetchHandler(fetchable);
  return app2;
};
const createApp = createApp$1;
function getFirstForwardedValue(multiValueHeader) {
  return multiValueHeader?.toString()?.split(",").map((e) => e.trim())?.[0];
}
const IP_RE = /^[0-9a-fA-F.:]{1,45}$/;
function isValidIpAddress(value) {
  return IP_RE.test(value);
}
function getValidatedIpFromHeader(headerValue) {
  const raw = getFirstForwardedValue(headerValue);
  if (raw && isValidIpAddress(raw)) {
    return raw;
  }
  return void 0;
}
function matchStaticAsset(manifest2, requestUrl, env2) {
  const { pathname } = new URL(requestUrl);
  if (manifest2.assets.has(pathname)) {
    return env2.ASSETS.fetch(requestUrl.replace(/\.html$/, ""));
  }
  return void 0;
}
async function fallbackToAssets(requestUrl, env2) {
  const asset = await env2.ASSETS.fetch(
    requestUrl.replace(/index.html$/, "").replace(/\.html$/, "")
  );
  if (asset.status !== 404) {
    return asset;
  }
  return void 0;
}
function createErrorPageFetch(env2) {
  return async (url) => {
    return env2.ASSETS.fetch(url.replace(/\.html$/, ""));
  };
}
function createLocals(ctx) {
  const locals = {
    cfContext: ctx
  };
  Object.defineProperty(locals, "runtime", {
    enumerable: false,
    value: {
      get env() {
        throw new Error(
          `Astro.locals.runtime.env has been removed in Astro v6. Use 'import { env } from "cloudflare:workers"' instead.`
        );
      },
      get cf() {
        throw new Error(
          `Astro.locals.runtime.cf has been removed in Astro v6. Use 'Astro.request.cf' instead.`
        );
      },
      get caches() {
        throw new Error(
          `Astro.locals.runtime.caches has been removed in Astro v6. Use the global 'caches' object instead.`
        );
      },
      get ctx() {
        throw new Error(
          `Astro.locals.runtime.ctx has been removed in Astro v6. Use 'Astro.locals.cfContext' instead.`
        );
      }
    }
  });
  return locals;
}
function getClientAddress(request) {
  return getValidatedIpFromHeader(request.headers.get("cf-connecting-ip"));
}
function injectSessionBinding(manifest2, env2) {
  if (env2[sessionKVBindingName]) {
    const sessionConfigOptions = manifest2.sessionConfig?.options ?? {};
    Object.assign(sessionConfigOptions, {
      binding: env2[sessionKVBindingName]
    });
  }
}
const app = createApp();
async function handle(request, env2, context) {
  injectSessionBinding(app.manifest, env2);
  const staticAsset = matchStaticAsset(app.manifest, request.url, env2);
  if (staticAsset) return staticAsset;
  let routeData = void 0;
  if (app.isDev()) {
    const result = await app.devMatch(app.getPathnameFromRequest(request));
    if (result) {
      routeData = result.routeData;
    }
  } else {
    routeData = app.match(request);
  }
  if (!routeData) {
    const asset = await fallbackToAssets(request.url, env2);
    if (asset) return asset;
  }
  const locals = createLocals(context);
  const waitUntil = context.waitUntil.bind(context);
  const response = await app.render(request, {
    routeData,
    locals,
    waitUntil,
    prerenderedErrorPageFetch: createErrorPageFetch(env2),
    clientAddress: getClientAddress(request)
  });
  if (app.setCookieHeaders) {
    for (const setCookieHeader of app.setCookieHeaders(response)) {
      response.headers.append("Set-Cookie", setCookieHeader);
    }
  }
  return response;
}
var server_default = {
  fetch: handle
};
const workerEntry = server_default ?? {};
export {
  isRemoteAllowed as i,
  renderComponent as r,
  spreadAttributes as s,
  workerEntry as w
};
