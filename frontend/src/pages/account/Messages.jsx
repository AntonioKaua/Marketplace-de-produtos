import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listConversationsRequest, listMessagesRequest, sendMessageRequest } from "../../services/chat";

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const activeId = searchParams.get("conversation");

  useEffect(() => {
    listConversationsRequest()
      .then(response => {
        setConversations(response.conversations);
        if (!activeId && response.conversations[0]) {
          setSearchParams({ conversation: String(response.conversations[0].id) });
        }
      })
      .catch(error => console.error("Erro ao listar conversas:", error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return undefined;

    let active = true;

    const load = () => {
      listMessagesRequest(activeId)
        .then(response => {
          if (active) setMessages(response.messages);
        })
        .catch(error => console.error("Erro ao carregar mensagens:", error));
    };

    load();
    const interval = setInterval(load, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = async event => {
    event.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      const response = await sendMessageRequest(activeId, content.trim());
      setMessages(current => [...current, response.message]);
      setContent("");
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setSending(false);
    }
  };

  if (conversations.length === 0) {
    return <div className="card p-6 text-slate-500">Você ainda não tem conversas. Fale com um vendedor a partir da página de um produto.</div>;
  }

  return (
    <div className="card grid h-[560px] grid-cols-1 overflow-hidden md:grid-cols-[240px_1fr]">
      <div className="overflow-y-auto border-b md:border-b-0 md:border-r">
        {conversations.map(conversation => (
          <button
            key={conversation.id}
            onClick={() => setSearchParams({ conversation: String(conversation.id) })}
            className={`block w-full border-b p-3 text-left text-sm hover:bg-slate-50 ${String(conversation.id) === activeId ? "bg-slate-50" : ""}`}
          >
            <p className="font-semibold">{conversation.otherParty?.name ?? "Usuário"}</p>
            {conversation.product && <p className="truncate text-xs text-slate-400">{conversation.product.title}</p>}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map(message => (
            <div key={message.id} className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${message.senderId === user.id ? "bg-dts-600 text-white" : "bg-slate-100 text-slate-700"}`}>
                {message.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={submit} className="flex gap-2 border-t p-3">
          <input className="input" placeholder="Escreva uma mensagem..." value={content} onChange={e => setContent(e.target.value)} disabled={sending} />
          <button className="btn-primary px-4" disabled={sending}><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
}
