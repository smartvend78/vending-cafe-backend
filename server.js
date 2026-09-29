const express = require('express');
const app = express();
app.use(express.json());

// Variable temporal para simular el estado del último pago
let ultimoPagoAprobado = false;

// Ruta 1: Webhook donde Mercado Pago avisa que se pagó
app.post('/webhook', (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", payment);

    // Aquí validaremos después que el pago esté 'approved' y por el monto exacto
    // Por ahora, marcamos que hay un pago listo para ser consumido
    ultimoPagoAprobado = true;

    res.status(200).send("OK");
});

// Ruta 2: El ESP32 consulta constantemente aquí si ya pagaron
app.get('/check-payment', (req, res) => {
    if (ultimoPagoAprobado) {
        res.json({ status: true });
        // Una vez que el ESP32 lee el pago y da el café, reseteamos la variable
        ultimoPagoAprobado = false; 
    } else {
        res.json({ status: false });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
