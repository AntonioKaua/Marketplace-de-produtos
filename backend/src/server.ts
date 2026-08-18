import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        message: "API do DTS funcionando!"
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando localmente na porta ${PORT}`)
})