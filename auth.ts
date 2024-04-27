import { Context } from "hono/mod.ts";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "hono/helper/cookie/index.ts";
import * as jose from "jose";
import { env } from "./env.ts";

const alg = "HS256";
const secret = new TextEncoder().encode(
  env.JWT_SECRET,
);

// Determine whether the request is authenticated
export async function isAuthenticated(
  c: Context,
): Promise<boolean> {
  const jwt = getCookie(c, "jwt");
  if (!jwt) {
    return false;
  }

  try {
    const { payload } = await jose.jwtVerify(jwt, secret);
    return payload.authenticated === true;
  } catch {
    return false;
  }
}

// Attempt to login with the provided password and return a response that will
// login to the application if it is correct
export async function login(c: Context, password: string): Promise<Response> {
  if (password !== env.MBOX_PASSWORD) {
    throw new Error("Incorrect password");
  }

  const jwt = await new jose.SignJWT({ authenticated: true })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
  setCookie(c, "jwt", jwt, {
    httpOnly: true,
    maxAge: 2592000,
    sameSite: "Strict",
    secure: true,
  });
  return c.redirect("/login");
}

// Return a response that will logout of the application
export function logout(c: Context): Response {
  deleteCookie(c, "jwt");
  return c.redirect("/");
}
