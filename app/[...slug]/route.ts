// app/proxy
export const runtime = "edge";
import { NextRequest, NextResponse } from "next/server";

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
    const url = new URL(request.url);
    const prefix = `${url.origin}/`;
    let actualUrlStr: string;

    if (
      !(url.pathname.startsWith("/http") || url.pathname.startsWith("/https"))
    ) {
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
            decodeURIComponent(cookieObj.current_site) +
            url.pathname +
            url.search +
            url.hash;
          console.log("Actual URL from cookie:", actualUrlStr);
          const actualUrl = new URL(actualUrlStr);
          const redirectUrl = `${prefix}${encodeURIComponent(
            actualUrl.toString()
          )}`;
          console.log('redirectUrl in cookie:', redirectUrl);
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
      actualUrlStr = decodeURIComponent(
        url.pathname.replace("/", "") + url.search + url.hash
      );
      console.log("Actual URL:", actualUrlStr);
    }

    const actualUrl = new URL(actualUrlStr);
    const modifiedRequestInit: RequestInit = {
      headers: {
        ...request.headers,
        "Accept-Encoding": " deflate, br, zstd", // 禁用 gzip, br 等压缩方式
      },
      method: request.method,
      body: request.method === "POST" ? await request.text() : null,
      redirect: "follow",
    };

    let response = await fetch(actualUrl.toString(), modifiedRequestInit);
    const baseUrl = `${prefix}${encodeURIComponent(actualUrl.origin)}`;
    if (response.headers.get("Content-Type")?.includes("text/html")) {
      response = await updateRelativeUrls(response, baseUrl, prefix);
    }
    const clonedResponse = response.clone();
    // console.log("clonedResponse:", clonedResponse);

    const modifiedResponse = new NextResponse(response.body, {
      headers: response.headers,
    });
    modifiedResponse.headers.set("Access-Control-Allow-Origin", "*");
    const currentSiteCookie = `current_site=${encodeURIComponent(
      actualUrl.origin
    )}; Path=/; Secure`;
    modifiedResponse.headers.append("Set-Cookie", currentSiteCookie);
    // console.log("modifiedResponse.body:", modifiedResponse.body);//这里他直接锁住了看不到
    return modifiedResponse;
  } catch (e) {
    console.error("Error handling request:", e);
    let pathname = new URL(request.url).pathname;
    return new NextResponse(`"${pathname}" not found`, {
      status: 404,
      statusText: "Not Found",
    });
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
