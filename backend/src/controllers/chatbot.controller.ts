import { Request, Response } from "express";
import { SignJWT } from "jose";

// Emite um token curto que o Chatbase usa para associar a conversa ao usuário logado.
export async function createChatbotIdentityToken(_req: Request, res: Response) {
  const secret = process.env.CHATBOT_IDENTITY_SECRET;

  if (!secret) {
    return res.status(503).json({
      success: false,
      message: "A identificação do assistente não está configurada.",
    });
  }

  const { userId, email, role } = res.locals.auth;

  try {
    const token = await new SignJWT({
      user_id: String(userId),
      email,
      role,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(new TextEncoder().encode(secret));

    return res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Erro ao gerar token de identificação do Chatbase:", error);
    return res.status(500).json({
      success: false,
      message: "Não foi possível identificar o usuário no assistente.",
    });
  }
}
