// app/proxy
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";
import { decodeUrl, encodeUrl } from "@/utils/url";

export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("GET request");
  return handleRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log("POST request");
  return handleRequest(request);
}

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const requestUrlObject = new URL(request.url);
    const prefix = `${requestUrlObject.origin}/`;
    let actualUrlStr: string;

    if (!requestUrlObject.pathname.startsWith("/http")) {
      // 从Cookie中读取之前访问的网站
      console.log(`路径未找到完整链接，进入cookie`);
      const cookie = request.headers.get("cookie");
      if (cookie) {
        const cookieObj: Record<string, string> = Object.fromEntries(
          cookie.split(";").map((cookie) => {
            const [key, ...val] = cookie.trim().split("=");
            return [key.trim(), val.join("=").trim()];
          })
        );
        if (cookieObj.current_site) {
          // 解码 URL
          actualUrlStr =
            decodeUrl(cookieObj.current_site) +
            requestUrlObject.pathname +
            requestUrlObject.search +
            requestUrlObject.hash;
          console.log("Actual URL from cookie:", actualUrlStr);
          const actualUrlObject = new URL(actualUrlStr);
          const redirectUrl = `${prefix}${encodeUrl(
            actualUrlObject.toString()
          )}`;
          console.log("redirectUrl in cookie:", redirectUrl);
          return NextResponse.redirect(redirectUrl, 301);
        } else {
          return new NextResponse(
            `No website in cookie. Please visit a website first.`,
            {
              status: 400,
              headers: { "Content-Type": "text/plain" },
            }
          );
        }
      } else {
        return new NextResponse(
          `No cookie found. Please visit a website first.`,
          {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          }
        );
      }
    } else {
      // 解码 URL
      actualUrlStr = decodeUrl(
        requestUrlObject.pathname.replace("/", "") +
          requestUrlObject.search +
          requestUrlObject.hash
      );
      console.log("Actual URL:", actualUrlStr);
    }

    const actualUrlObject = new URL(actualUrlStr);
    const modifiedRequestInit: RequestInit = {
      headers: {
        ...request.headers,
        Referer: actualUrlObject.origin, // 修改为你注册的域名
        Origin: actualUrlObject.origin, // 确保 Origin 也是正确的
        // "Accept-Encoding": "gzip, deflate, br", //  gzip...
      },
      method: request.method,
      body: request.method === "POST" ? await request.text() : null,
      redirect: "manual", // 手动处理重定向
    };

    let response = await fetch(actualUrlObject.toString(), modifiedRequestInit);

    // 处理重定向响应
    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.get("Location")
    ) {
      const location = response.headers.get("Location")!;
      const redirectUrlObject = new URL(location, actualUrlObject);
      const redirectUrl = redirectUrlObject.toString();

      // 如果重定向的 URL 与当前 URL origin相同，则跳出循环，避免无限重定向
      // if (
      //   redirectUrlObject.origin.toString() ===
      //   actualUrlObject.origin.toString()
      // ) {
      console.log("检测到循环重定向，停止重定向处理。");
      // 从重定向响应中删除 Location 头部，并将状态更改为 200 OK
      const modifiedHeaders = new Headers(response.headers);
      modifiedHeaders.delete("Location");

      return new NextResponse(response.body, {
        status: 200, // 将状态码更改为 200 OK
        headers: modifiedHeaders,
      });
      // } else {
      //   console.log(
      //     "redirectUrl vs actualUrl",
      //     redirectUrlObject.origin.toString(),
      //     actualUrlObject.origin.toString()
      //   );
      //   console.log("即将正常重定向：", redirectUrl);
      //   return NextResponse.redirect(
      //     `${prefix}${encodeUrl(redirectUrl)}`,
      //     response.status
      //   );
      // }
    }

    const baseUrl = `${prefix}${encodeUrl(actualUrlObject.origin)}`;
    if (response.headers.get("Content-Type")?.includes("text/html")) {
      response = await updateRelativeUrls(response, baseUrl, prefix);
    }

    const modifiedResponse = new NextResponse(response.body, {
      headers: response.headers,
    });
    // 删除 CSP 相关的响应头
    modifiedResponse.headers.delete("Content-Security-Policy");
    modifiedResponse.headers.delete("X-Content-Security-Policy");
    modifiedResponse.headers.delete("X-WebKit-CSP");
    modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");
    const currentSiteCookie = `current_site=${encodeUrl(
      actualUrlObject.origin
    )}; Path=/; Secure`;
    modifiedResponse.headers.append("Set-Cookie", currentSiteCookie);
    // console.log("modifiedResponse.body:", modifiedResponse.body);//这里他直接锁住了看不到
    return modifiedResponse;
  } catch (e) {
    return new NextResponse(
      `
      Error handling request:, ${e}`,
      {
        status: 404,
        statusText: "Not Found",
      }
    );
  }
}

async function updateRelativeUrls(
  response: Response,
  baseUrl: string,
  prefix: string
): Promise<Response> {
  let text = await response.text();

  text = text.replace(/(href|src|action)="([^"]*?)"/g, (match, p1, p2) => {
    if (!p2.includes("://") && !p2.startsWith("#")) {
      return `${p1}="${baseUrl}${p2}"`;
    } else if (
      p2.includes("://") &&
      !match.includes("js") &&
      !match.includes("css") &&
      !match.includes("mjs")
    ) {
      return `${p1}="${prefix}${p2}"`;
    }
    return match;
  });

  return new Response(text, {
    headers: response.headers,
  });
}
