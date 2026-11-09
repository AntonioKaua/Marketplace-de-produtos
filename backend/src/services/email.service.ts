interface SupportEmailData {
    ticketId: number;
    subject: string;
    category: string;
    message: string;
    notificationType: "new_ticket" | "new_message";
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function sendSupportNotification(data: SupportEmailData) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const recipients = process.env.SUPPORT_TEAM_EMAIL
        ?.split(",")
        .map(email => email.trim())
        .filter(Boolean);

    if (!apiKey || !from || !recipients?.length) {
        console.warn(
            "Notificação de suporte não enviada: configure RESEND_API_KEY, EMAIL_FROM e SUPPORT_TEAM_EMAIL."
        );
        return;
    }

    const isNewTicket = data.notificationType === "new_ticket";

    const emailSubject = isNewTicket
        ? `Novo chamado #${data.ticketId}: ${data.subject}`
        : `Nova mensagem no chamado #${data.ticketId}`;

    const safeSubject = escapeHtml(data.subject);
    const safeCategory = escapeHtml(data.category);
    const safeMessage = escapeHtml(data.message).replace(/\n/g, "<br>");

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
                to: recipients,
                subject: emailSubject,
                html: `
                    <h2>${isNewTicket ? "Novo chamado recebido" : "Nova mensagem recebida"}</h2>
                    <p><strong>Chamado:</strong> #${data.ticketId}</p>
                    <p><strong>Assunto:</strong> ${safeSubject}</p>
                    <p><strong>Categoria:</strong> ${safeCategory}</p>
                    <hr />
                    <p><strong>Mensagem:</strong></p>
                    <p>${safeMessage}</p>
                    <hr />
                    <p>DTS Marketplace - Central de Atendimento</p>
                `,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Erro retornado pelo Resend:", error);
            return;
        }

        console.log(`Notificação do chamado #${data.ticketId} enviada.`);
    } catch (error) {
        console.error("Falha ao enviar notificação por e-mail:", error);
    }
}
