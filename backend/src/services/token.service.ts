import { jwtVerify, SignJWT } from "jose";

const TOKEN_ISSUER = "marketplace-api";
const TOKEN_AUDIENCE = "marketplace-frontend";
const TOKEN_EXPIRATION = "1h";

export const ACCESS_TOKEN_COOKIE = "dts_access_token";
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1000;

interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
}

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error(
      "JWT_SECRET deve estar configurada com pelo menos 32 caracteres.",
    );
  }

  return new TextEncoder().encode(jwtSecret);
}

export async function createAccessToken({
  userId,
  email,
  role,
}: AccessTokenPayload) {
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(String(userId))
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  });

  const userId = Number(payload.sub);

  if (
    !Number.isInteger(userId) ||
    typeof payload.email !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("Token de acesso inválido.");
  }

  return {
    userId,
    email: payload.email,
    role: payload.role,
  };
}
