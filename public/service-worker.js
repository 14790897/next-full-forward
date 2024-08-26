// public/service-worker.js
// 网站的作用是通过我的网站域名加上需要代理的网址的完整链接，使得这个网址的流量全部经过我的网站给后端请求进行代理然后再返回给前端
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", async (event) => {
  const userRequestUrlObject = new URL(event.request.url); // 用户请求的完整链接
  const myWebsiteUrlObject = new URL(self.location.href); // 我的网站的域名的url对象
  const myWebsiteDomain = myWebsiteUrlObject.origin; // 我的网站的域名
  const prefix = `${myWebsiteDomain}/`;
  //正常情况下请求的链接应该是我的域名加上需要代理的完整的网址路径，如果请求的是我的代理网站的域名加上不带https域名的路径，说明需要使用上一次请求获得到的需要代理的域名加上去（请chatgpt帮我完成这部分）
  // 假设用来存储上一次请求的完整域名的变量
  // 从 Cache 中获取 lastRequestedDomain
  const cache = await caches.open("full-proxy-cache");
  const cachedResponse = await cache.match("lastRequestedDomain");
  let lastRequestedDomain = cachedResponse ? await cachedResponse.text() : null;

  // 如果请求的路径不包含完整的 URL（不带 https 前缀）
  if (!userRequestUrlObject.pathname.startsWith("http")) {
    // 检查是否有之前存储的域名信息
    if (lastRequestedDomain) {
      const reconstructedTrueUrl = `${lastRequestedDomain}${userRequestUrlObject.pathname}${userRequestUrlObject.search}`;
      console.log(
        "Reconstructed URL using last requested domain:",
        reconstructedTrueUrl
      );
      const reconstructedUrl = `${prefix}${encodeURIComponent(
        reconstructedTrueUrl
      )}`;
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
      console.log("No last requested domain available to reconstruct the URL.");
      //   return fetch(event.request);
      return;
    }
  }
  // 如果请求的域名不以myWebsiteDomain开头，说明他请求了外部的服务同时那个服务是一个完整的链接，则加上前缀，使得可以代理
  if (
    !userRequestUrlObject.href.startsWith(myWebsiteDomain) &&
    !(
      (
        userRequestUrlObject.protocol === "chrome-extension:" ||
        userRequestUrlObject.protocol === "about:"
      )
      //   requestUrl.href.includes("clarity") ||
      //   requestUrl.href.includes("analytics")
    )
  ) {
    // 检查是否为 script 文件
    if (
      userRequestUrlObject.pathname.endsWith(".js") ||
      userRequestUrlObject.pathname.endsWith(".mjs") ||
      userRequestUrlObject.pathname.endsWith(".css")
    ) {
      console.log("Skipping proxy for script file:", userRequestUrlObject.href);
      // 直接传递请求，不进行代理
      //   return fetch(event.request);
      return;
    }

    // 对 URL 进行编码，避免特殊字符引发的问题
    const modifiedUrl = `${prefix}${encodeURIComponent(userRequestUrlObject.href)}`;
    console.log(
      "URl未被代理,已修改：modifiedUrl:",
      modifiedUrl,
      "原始originRequestUrl:",
      userRequestUrlObject.href
    );
	const actualUrlStr = decodeURIComponent(
    userRequestUrlObject.pathname.replace("/", "") +
      userRequestUrlObject.search +
      userRequestUrlObject.hash
  );
	const actualUrlObject = new URL(actualUrlStr);
    const cache = await caches.open("full-proxy-cache");
    await cache.put(
      "lastRequestedDomain",
      new Response(actualUrlObject.pathname)
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
    console.log("未代理：", userRequestUrlObject.href);
    return fetch(event.request);
  }
});
