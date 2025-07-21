import jwt from "jsonwebtoken";

export function getUserIdFromToken(authHeader: string | undefined): string | null {
  const token = authHeader?.split(" ")[1];
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return payload.userId;
  } catch {
    return null;
  }
}
