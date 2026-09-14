import { useEffect } from "react";
import { getChatbotIdentityTokenRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CHATBASE_ID = "yQ5m2mz8BR05MHnsYGeH9";

// Carrega o widget oficial uma única vez, independente das trocas de rota do React.
export default function ChatbaseWidget() {
  const { user } = useAuth();

  useEffect(() => {
    if (!window.chatbase || window.chatbase("getState") !== "initialized") {
      window.chatbase = (...args) => {
        window.chatbase.q ??= [];
        window.chatbase.q.push(args);
      };

      window.chatbase = new Proxy(window.chatbase, {
        get(target, property) {
          if (property === "q") return target.q;
          return (...args) => target(property, ...args);
        },
      });
    }

    if (document.getElementById(CHATBASE_ID)) return;

    const script = document.createElement("script");
    script.src = "https://www.chatbase.co/embed.min.js";
    script.id = CHATBASE_ID;
    script.domain = "www.chatbase.co";
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!user) return;

    getChatbotIdentityTokenRequest()
      .then(({ token }) => window.chatbase?.("identify", { token }))
      .catch(error => {
        // O chat segue disponível sem identificação se a configuração ainda não existir.
        console.error("Não foi possível identificar o usuário no assistente:", error);
      });
  }, [user]);

  return null;
}
