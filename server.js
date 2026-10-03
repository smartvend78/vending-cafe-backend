const express = require('express');
const app = express();
app.use(express.json());

let ultimoPagoAprobado = false;

app.post('/webhook', (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", JSON.stringify(payment));

    const idEsperado = "138816198";
    
    // Verificamos de forma estricta en los campos comunes donde Mercado Pago suele enviar el identificador de caja o punto de venta
    // (Puedes revisar en los logs de Render en qué propiedad exacta cae tu ID)
    const externalRef = String(payment.external_reference || "");
    const posId = String(payment.pos_id || "");
    const collectorId = String(payment.collector_id || "");
    const payloadStr = JSON.stringify(payment);

    // Condición estricta: debe contener el ID en alguna de estas referencias clave
    if (externalRef.includes(idEsperado) || posId.includes(idEsperado) || collectorId.includes(idEsperado)) {
        console.log("¡Pago válido detectado para el QR exacto!");
        ultimoPagoAprobado = true;
    } else {
        // Como las pruebas de simuladores genéricos a veces no mandan campos de caja, 
        // si quieres una prueba estricta, el ID debe venir explícitamente aquí.
        console.log("Pago rechazado: El ID no coincide con el QR autorizado.");
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
