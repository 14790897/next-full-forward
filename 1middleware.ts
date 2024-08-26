import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    // request.nextUrl.pathname = `/${locale}${pathname}`;
    // return NextResponse.redirect(request.nextUrl);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|twitter-image.png|opengraph-image.png|manifest.json|site.webmanifest|favicon-32x32.png|favicon-16x16.png|apple-touch-icon.png|android-chrome-512x512.png|android-chrome-192x192.png|service-worker.js|serviceregister.js|global.css|sitemap.xml|robots.txt|api/oauth/callback).*)",
  ],
};
