
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getSupportTickets,
    createSupportTicket,
    getSupportMessages,
    sendSupportMessage,
} from "../../services/support";

export default function Support() {
    const { user } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);

    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("Dúvida");
    const [initialMessage, setInitialMessage] = useState("");
    const [newMessage, setNewMessage] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadTickets() {
        try {
            const response = await getSupportTickets();
            setTickets(response.tickets || []);
        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (!selectedTicket) {
            setMessages([]);
            return;
        }

        getSupportMessages(selectedTicket.id)
            .then(response => setMessages(response.messages || []))
            .catch(err => setError(err.message));
    }, [selectedTicket]);

    async function handleCreateTicket(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await createSupportTicket({
                subject,
                category,
                message: initialMessage,
            });

            setTickets(current => [response.ticket, ...current]);
            setSelectedTicket(response.ticket);
            setMessages(response.message ? [response.message] : []);

            setSubject("");
            setCategory("Dúvida");
            setInitialMessage("");
            setShowForm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMessage(event) {
        event.preventDefault();

        if (!newMessage.trim() || !selectedTicket) return;

        setLoading(true);
        setError("");

        try {
            const response = await sendSupportMessage(
                selectedTicket.id,
                newMessage.trim()
            );

            setMessages(current => [...current, response.message]);
            setNewMessage("");
            await loadTickets();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black">Central de Atendimento</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Abra chamados e acompanhe suas solicitações.
                        </p>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={() => {
                            setError("");
                            setShowForm(!showForm);
                        }}
                    >
                        {showForm ? "Cancelar" : "Novo chamado"}
                    </button>
                </div>

                {error && (
                    <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {showForm && (
                    <form onSubmit={handleCreateTicket} className="mt-6 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold">
                                Assunto
                            </label>
                            <input
                                className="input"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                maxLength={150}
                                required
                                placeholder="Descreva o assunto do atendimento"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold">
                                Categoria
                            </label>
                            <select
                                className="input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="Dúvida">Dúvida</option>
                                <option value="Problema">Problema</option>
                                <option value="Pedido">Pedido</option>
                                <option value="Pagamento">Pagamento</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold">
                                Mensagem
                            </label>
                            <textarea
                                className="input min-h-28 resize-y"
                                value={initialMessage}
                                onChange={e => setInitialMessage(e.target.value)}
                                maxLength={2000}
                                required
                                placeholder="Explique como podemos ajudar..."
                            />
                        </div>

                        <button className="btn-primary" disabled={loading}>
                            {loading ? "Enviando..." : "Abrir chamado"}
                        </button>
                    </form>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <div className="card overflow-hidden">
                    <div className="border-b p-4">
                        <h3 className="font-bold">Meus chamados</h3>
                    </div>

                    {tickets.length === 0 ? (
                        <p className="p-4 text-sm text-slate-500">
                            Você ainda não possui chamados.
                        </p>
                    ) : (
                        tickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => {
                                    setError("");
                                    setSelectedTicket(ticket);
                                }}
                                className={`block w-full border-b p-4 text-left hover:bg-slate-50 ${
                                    selectedTicket?.id === ticket.id ? "bg-slate-50" : ""
                                }`}
                            >
                                <p className="truncate text-sm font-semibold">
                                    {ticket.subject}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {ticket.category}
                                </p>
                                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs">
                  {ticket.status}
                </span>
                            </button>
                        ))
                    )}
                </div>

                <div className="card flex min-h-[400px] flex-col">
                    {selectedTicket ? (
                        <>
                            <div className="border-b p-4">
                                <h3 className="font-bold">{selectedTicket.subject}</h3>
                                <p className="text-sm text-slate-500">
                                    Categoria: {selectedTicket.category}
                                </p>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            String(message.userId) === String(user.id)
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div className="max-w-[80%] rounded-2xl bg-slate-100 px-4 py-3 text-sm">
                                            {message.message}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {selectedTicket.status !== "resolvido" && (
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex gap-2 border-t p-3"
                                >
                                    <input
                                        className="input"
                                        placeholder="Escreva sua mensagem..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        maxLength={2000}
                                        disabled={loading}
                                    />
                                    <button
                                        className="btn-primary"
                                        disabled={loading || !newMessage.trim()}
                                    >
                                        Enviar
                                    </button>
                                </form>
                            )}

                            {selectedTicket.status === "resolvido" && (
                                <p className="border-t p-4 text-center text-sm text-slate-500">
                                    Este atendimento foi resolvido.
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
                            Selecione um chamado para visualizar as mensagens.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
