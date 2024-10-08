// public/service-worker.js
// 网站的作用是通过我的网站域名加上需要代理的网址的完整链接，使得这个网址的流量全部经过我的网站给后端请求进行代理然后再返回给前端
// importScripts("/utils/url.js");


self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", async (event) => {
  const webRequestUrlObject = new URL(event.request.url); // 用户请求的完整链接,这个链接可能encode也可能没有
  if (
    !(
      webRequestUrlObject.protocol === "chrome-extension:" ||
      webRequestUrlObject.protocol === "about:" ||
      webRequestUrlObject.href.includes("_next")
    )
    //   webRequestUrlObject.href.includes("clarity") ||
    //   webRequestUrlObject.href.includes("analytics")
  ) {
    const myWebsiteDomain = new URL(self.location.href).origin; // 我的网站的域名的域名（也就是我的代理网站）
    const prefix = `${myWebsiteDomain}/`;
    //正常情况下请求的链接应该是我的域名加上需要代理的完整的网址路径，如果请求的是我的代理网站的域名加上不带https域名的路径，说明需要使用上一次请求获得到的需要代理的域名加上去（请chatgpt帮我完成这部分）
    // 从 Cache 中获取 lastRequestedDomain
    const cache = await caches.open("full-proxy-cache");
    const cachedResponse = await cache.match("lastRequestedDomain");
    let lastRequestedDomain = cachedResponse
      ? await cachedResponse.text()
      : null;
    console.log("lastRequestedDomain:", lastRequestedDomain);

    // 如果请求的路径不包含完整的 URL（不带 /http 前缀）
    if (!webRequestUrlObject.pathname.startsWith("/http")) {
      // 检查是否有之前存储的域名信息
      if (lastRequestedDomain) {
        const reconstructedTrueUrl = `${decodeUrl(lastRequestedDomain)}${
          webRequestUrlObject.pathname
        }${webRequestUrlObject.search}`;
        console.log(
          "Reconstructed URL using last requested domain:",
          reconstructedTrueUrl
        );
        const reconstructedUrl = `${prefix}${encodeUrl(reconstructedTrueUrl)}`;
        const modifiedRequest = new Request(reconstructedUrl, {
          method: event.request.method,
          headers: event.request.headers,
          body: event.request.body,
          mode: "same-origin",
          credentials: event.request.credentials,
          cache: event.request.cache,
          redirect: event.request.redirect,
          referrer: event.request.referrer,
          integrity: event.request.integrity,
        });
        return fetch(modifiedRequest);
      } else {
        console.log(
          `No last requested domain available. webRequestUrlObject: ${webRequestUrlObject.href}`
        );
        //   return fetch(event.request);
        return;
      }
    }
    // 如果请求的域名不以myWebsiteDomain开头，说明他请求了外部的服务同时那个服务是一个完整的链接，则加上前缀，使得可以代理
    else if (!webRequestUrlObject.href.startsWith(myWebsiteDomain)) {


      const modifiedUrl = `${prefix}${encodeUrl(webRequestUrlObject.href)}`;
      console.log(
        "URl未被代理,已修改：modifiedUrl:",
        modifiedUrl,
        "原始originRequestUrl:",
        webRequestUrlObject.href
      );
      const modifiedRequestInit = {
        method: event.request.method,
        headers: event.request.headers,
        body: event.request.body,
        mode: "same-origin",
        credentials: event.request.credentials,
        cache: event.request.cache,
        redirect: event.request.redirect,
        referrer: event.request.referrer,
        integrity: event.request.integrity,
        duplex: event.request.body ? "half" : undefined, // 如果有 body，设置 duplex: 'half'
      };
      // 这里重定向到新的 URL，暂时不使用
      // const redirectUrl = new URL(modifiedUrl);
      // const redirectResponse = Response.redirect(redirectUrl, 302);
      // event.respondWith(redirectResponse);
      // 更新存储的上次请求域名
      // 将 lastRequestedDomain 存储到 Cache 中

      const modifiedRequest = new Request(modifiedUrl, modifiedRequestInit);
      return fetch(modifiedRequest);
    } else {
      console.log(
        "未修改,说明这个链接已经符合代理格式：",
        webRequestUrlObject.href
      );
      getUrlOriginPutCache(webRequestUrlObject);
      return fetch(event.request);
    }
  }
});

const getUrlOriginPutCache = async (webRequestUrlObject) => {
  const actualUrlStr = decodeUrl(
    webRequestUrlObject.pathname.replace("/", "") +
      webRequestUrlObject.search +
      webRequestUrlObject.hash
  );
  const actualUrlObject = new URL(actualUrlStr);
  const cache = await caches.open("full-proxy-cache");
  await cache.put(
    "lastRequestedDomain",
    new Response(encodeUrl(actualUrlObject.origin))
  );
  console.log("lastRequestedDomain put in cache:", actualUrlObject.origin);
};

 function encodeUrl(originalUrl) {
   return originalUrl.replace(/:\/\//g, "__SLASH__");
 }
 function decodeUrl(encodedUrl) {
   return encodedUrl.replace(/__SLASH__/g, "://");
 }
