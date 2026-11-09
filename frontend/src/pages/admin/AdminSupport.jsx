import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    listAdminSupportTicketsRequest,
    getAdminSupportMessagesRequest,
    sendAdminSupportMessageRequest,
    updateAdminSupportStatusRequest,
} from "../../services/admin";

const STATUS_LABELS = {
    aberto: "Aberto",
    em_andamento: "Em andamento",
    resolvido: "Resolvido",
};

export default function AdminSupport() {
    const { user } = useAuth();

    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    async function loadTickets() {
        try {
            const response = await listAdminSupportTicketsRequest();
            setTickets(response.tickets || []);
        } catch (err) {
            setError(err.message || "Erro ao carregar chamados.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTickets();
    }, []);

    async function selectTicket(ticket) {
        setSelectedTicket(ticket);
        setMessages([]);
        setError("");

        try {
            const response = await getAdminSupportMessagesRequest(ticket.id);
            setSelectedTicket(response.ticket || ticket);
            setMessages(response.messages || []);
        } catch (err) {
            setError(err.message || "Erro ao carregar mensagens.");
        }
    }

    async function handleSendMessage(event) {
        event.preventDefault();

        if (!newMessage.trim() || !selectedTicket) return;

        setSending(true);
        setError("");

        try {
            const response = await sendAdminSupportMessageRequest(
                selectedTicket.id,
                newMessage.trim()
            );

            setMessages(current => [...current, response.message]);
            setNewMessage("");
            await loadTickets();
        } catch (err) {
            setError(err.message || "Erro ao enviar resposta.");
        } finally {
            setSending(false);
        }
    }

    async function handleStatusChange(event) {
        const status = event.target.value;

        try {
            setError("");

            const response = await updateAdminSupportStatusRequest(
                selectedTicket.id,
                status
            );

            setSelectedTicket(response.ticket);

            setTickets(current =>
                current.map(ticket =>
                    ticket.id === response.ticket.id ? response.ticket : ticket
                )
            );
        } catch (err) {
            setError(err.message || "Erro ao atualizar status.");
        }
    }

    if (loading) {
        return <div className="card p-6 text-slate-500">Carregando chamados...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black">Central de Atendimento</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Visualize e responda aos chamados enviados pelos clientes.
                </p>
            </div>

            {error && (
                <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <section className="card overflow-hidden">
                    <div className="border-b p-4">
                        <h3 className="font-bold">Chamados recebidos</h3>
                        <p className="text-xs text-slate-500">
                            {tickets.length} chamado(s)
                        </p>
                    </div>

                    {tickets.length === 0 ? (
                        <p className="p-4 text-sm text-slate-500">
                            Nenhum chamado recebido até o momento.
                        </p>
                    ) : (
                        tickets.map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => selectTicket(ticket)}
                                className={`block w-full border-b p-4 text-left hover:bg-slate-50 ${
                                    selectedTicket?.id === ticket.id ? "bg-slate-50" : ""
                                }`}
                            >
                                <p className="truncate text-sm font-semibold">
                                    {ticket.subject}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Cliente: {ticket.userId}
                                </p>

                                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs">
                  {STATUS_LABELS[ticket.status] || ticket.status}
                </span>
                            </button>
                        ))
                    )}
                </section>

                <section className="card flex min-h-[500px] flex-col">
                    {selectedTicket ? (
                        <>
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                                <div>
                                    <h3 className="font-bold">{selectedTicket.subject}</h3>
                                    <p className="text-sm text-slate-500">
                                        Cliente: {selectedTicket.userId} · Categoria:{" "}
                                        {selectedTicket.category}
                                    </p>
                                </div>

                                <select
                                    className="input w-auto"
                                    value={selectedTicket.status}
                                    onChange={handleStatusChange}
                                >
                                    <option value="aberto">Aberto</option>
                                    <option value="em_andamento">Em andamento</option>
                                    <option value="resolvido">Resolvido</option>
                                </select>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                                {messages.length === 0 ? (
                                    <p className="text-sm text-slate-500">
                                        Nenhuma mensagem neste chamado.
                                    </p>
                                ) : (
                                    messages.map(message => {
                                        const isAdmin =
                                            String(message.userId) === String(user?.id);

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    isAdmin ? "justify-end" : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                                        isAdmin
                                                            ? "bg-dts-600 text-white"
                                                            : "bg-slate-100 text-slate-800"
                                                    }`}
                                                >
                                                    <p className="mb-1 text-xs font-bold opacity-70">
                                                        {isAdmin ? "Equipe de atendimento" : "Cliente"}
                                                    </p>
                                                    {message.message}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {selectedTicket.status !== "resolvido" ? (
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex gap-2 border-t p-3"
                                >
                                    <input
                                        className="input flex-1"
                                        value={newMessage}
                                        onChange={event => setNewMessage(event.target.value)}
                                        placeholder="Escreva uma resposta ao cliente..."
                                        maxLength={2000}
                                        required
                                    />

                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={sending || !newMessage.trim()}
                                    >
                                        {sending ? "Enviando..." : "Enviar"}
                                    </button>
                                </form>
                            ) : (
                                <p className="border-t p-4 text-center text-sm text-slate-500">
                                    Este atendimento foi resolvido e não aceita novas respostas.
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-500">
                            Selecione um chamado para visualizar a conversa.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
