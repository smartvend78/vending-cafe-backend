const express = require('express');
const app = express();
app.use(express.json());

let ultimoPagoAprobado = false;

// Ruta 1: Webhook donde Mercado Pago avisa que se pagó
app.post('/webhook', (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", JSON.stringify(payment));

    // Mercado Pago envía distintas estructuras según el tipo de integración.
    // Verificamos si la notificación pertenece a tu ID o caja '138816198'
    // (A veces viene en payment.collector_id, payment.external_reference, o en los datos del pos/store)
    
    const idEsperado = "138816198";
    
    // Validamos de forma flexible si el ID aparece en la notificación 
    // o si es una notificación general que deseas filtrar.
    const payloadStr = JSON.stringify(payment);
    
    if (payloadStr.includes(idEsperado) || payment.action === "payment.created" || payment.type === "payment") {
        // Nota: Si estás probando con varios QR distintos en el futuro, 
        // aquí puedes exigir estrictamente que coincida con el ID.
        console.log("¡Pago válido detectado para el QR de la máquina!");
        ultimoPagoAprobado = true;
    }

    res.status(200).send("OK");
});

// Ruta 2: El ESP32 consulta si ya pagaron
app.get('/check-payment', (req, res) => {
    res.json({ status: ultimoPagoAprobado });
});

// Ruta 3: El ESP32 avisa que ya procesó el pago para limpiar la variable
app.post('/clear-payment', (req, res) => {
    ultimoPagoAprobado = false;
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
