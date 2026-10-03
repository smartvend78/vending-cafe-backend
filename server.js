const express = require('express');
const app = express();
app.use(express.json());

let ultimoPagoAprobado = false;

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
// Puedes definir el precio exacto del café que configuraste en tu Link de Pago
const PRECIO_CAFE = 500; // Cambia esto por el valor real que le pusiste en Mercado Pago

app.post('/webhook', async (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", JSON.stringify(payment));

    const paymentId = payment.data?.id || payment.id;

    if (!paymentId) {
        console.log("Notificación ignorada: No contiene ID de pago.");
        return res.status(200).send("OK");
    }

    try {
        // Consultamos a la API oficial de Mercado Pago
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            }
        });

        if (!response.ok) {
            console.log(`Error al consultar la API de MP para el pago ${paymentId}`);
            return res.status(200).send("OK");
        }

        const paymentData = await response.json();
        
        const estado = paymentData.status; // 'approved'
        const montoPagado = paymentData.transaction_amount;

        console.log(`Verificando pago ID ${paymentId} - Estado: ${estado} - Monto: ${montoPagado}`);

        // Validamos que el pago esté aprobado y que el monto sea el correcto
        if (estado === 'approved' && montoPagado === PRECIO_CAFE) {
            console.log("¡Pago por Link de Pago verificado y aprobado!");
            ultimoPagoAprobado = true;
        } else {
            console.log(`Pago rechazado. Estado: ${estado}, Monto recibido: ${montoPagado}`);
        }

    } catch (error) {
        console.error("Error procesando la validación con Mercado Pago:", error);
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
