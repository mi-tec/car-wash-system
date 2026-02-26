import prisma from "@/lib/prisma";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const isValid = email.includes("@") && password.length >= 8;

  if (!isValid) {
    return new Response(JSON.stringify({ error: "Invalid email or password" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const user = await prisma.admin.findUnique({
    where: { email },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "Invalid email or password" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const validPassword = await argon2.verify(user.password, password);

  if (!validPassword) {
    return new Response(JSON.stringify({ error: "Invalid password" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1d" });

  (await cookies()).set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/",
  });

  (await cookies()).set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return new Response(JSON.stringify({ message: "Login successful" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
