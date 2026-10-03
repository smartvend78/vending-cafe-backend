const express = require('express');
const app = express();
app.use(express.json());

// Variable temporal para simular el estado del último pago
let ultimoPagoAprobado = false;

// Ruta 1: Webhook donde Mercado Pago avisa que se pagó
app.post('/webhook', (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", payment);

    // Marcamos que hay un pago listo para ser consumido
    ultimoPagoAprobado = true;

    res.status(200).send("OK");
});

// Ruta 2: El ESP32 consulta constantemente aquí si ya pagaron
app.get('/check-payment', (req, res) => {
    res.json({ status: ultimoPagoAprobado });
});

// Ruta 3: El ESP32 avisa que ya procesó el pago para limpiar la variable
app.post('/clear-payment', (req, res) => {
    ultimoPagoAprobado = false;
    res.json({ success: true });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
