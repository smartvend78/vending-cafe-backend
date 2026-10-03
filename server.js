const express = require('express');
const app = express();
app.use(express.json());

let ultimoPagoAprobado = false;

app.post('/webhook', (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", JSON.stringify(payment));

    const idEsperado = "138816198";
    
    // Extraemos de forma segura el ID que viene en la notificación de Mercado Pago
    // Según tu log, viene en payment.data.id o en payment.id
    const idRecibido = String(payment.data?.id || payment.id || "");

    // Validamos estrictamente que coincida con el ID de tu QR
    if (idRecibido === idEsperado) {
        console.log("¡Pago válido detectado para el QR exacto!");
        ultimoPagoAprobado = true;
    } else {
        console.log(`Pago rechazado: El ID recibido (${idRecibido}) no coincide con el QR autorizado.`);
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
