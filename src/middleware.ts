import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/",
    "/stores/:path*",
    "/bulk-orders/:path*",
    "/proxies/:path*",
  ],
};
