import { env } from "./env.ts";
import * as jose from "jose";

const alg = "HS256";
const secret = new TextEncoder().encode(
  env.JWT_SECRET,
);

// Determine whether the request is authenticated
export async function isAuthenticated(request: Request): Promise<boolean> {
  const jwt = request.cookie("jwt");
  if (!jwt) {
    return false;
  }

  try {
    const { payload } = await jose.jwtVerify(jwt, secret);
    return payload.authenticated === true;
  } catch (_) {
    return false;
  }
}

// Attempt to login with the provided password and return a response that will
// login to the application if it is correct
export async function login(password: string): Promise<Response> {
  if (password !== env.MBOX_PASSWORD) {
    throw new Error("Incorrect password");
  }

  const jwt = await new jose.SignJWT({ authenticated: true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  return new Response(null, {
    headers: {
      location: "/",
      "set-cookie":
        `jwt=${jwt};Max-Age=2592000;Path=/;Secure;HttpOnly;SameSite=Strict;`,
    },
    status: 302,
  });
}

// Return a response that will logout of the application
export function logout(): Response {
  return new Response(null, {
    headers: {
      location: "/login",
      "set-cookie": `jwt=_;Expires=${
        new Date(0).toUTCString()
      }Path=/;Secure;HttpOnly;SameSite=Strict;`,
    },
    status: 302,
  });
}
