const express = require('express');
const app = express();
app.use(express.json());

let ultimoPagoAprobado = false;

app.post('/webhook', (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", JSON.stringify(payment));

    const idEsperado = "138816198";
    const payloadStr = JSON.stringify(payment);
    
    // Verificamos si el ID exacto está presente en la notificación
    if (payloadStr.includes(idEsperado)) {
        console.log("¡Pago válido detectado para el QR exacto!");
        ultimoPagoAprobado = true;
    } else {
        console.log("Pago recibido de otro origen o ID, ignorado.");
    }

    res.status(200).send("OK");
});

app.get('/check-payment', (req, res) => {
    res.json({ status: ultimoPagoAprobado });
});

app.post('/clear-payment', (req, res) => {
    ultimoPagoAprobado = false;
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
