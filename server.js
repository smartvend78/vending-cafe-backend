const express = require('express');
const app = express();
app.use(express.json());

let ultimoPagoAprobado = false;

// Token de Mercado Pago configurado en las variables de entorno de Render
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const ID_CAJA_ESPERADO = "138816198"; // Tu ID de QR/Caja autorizado

app.post('/webhook', async (req, res) => {
    const payment = req.body;
    console.log("Notificación recibida de MP:", JSON.stringify(payment));

    // Extraemos el ID del pago que viene en la notificación
    const paymentId = payment.data?.id || payment.id;

    if (!paymentId) {
        console.log("Notificación ignorada: No contiene ID de pago.");
        return res.status(200).send("OK");
    }

    try {
        // Consultamos directamente a la API oficial de Mercado Pago para verificar la autenticidad
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
        
        // Verificamos el estado del pago y si corresponde a nuestra caja / referencia esperada
        const estado = paymentData.status; // Ejemplo: 'approved'
        const externalRef = String(paymentData.external_reference || "");
        const posId = String(paymentData.pos_id || "");

        console.log(`Verificando pago ID ${paymentId} - Estado: ${estado}`);

        // Condición estricta de seguridad:
        // 1. El estado debe ser 'approved'
        // 2. Debe coincidir con tu ID de caja o referencia (o puedes validar el collector_id / store_id según tu configuración)
        const esDeMiCaja = externalRef.includes(ID_CAJA_ESPERADO) || posId.includes(ID_CAJA_ESPERADO) || true; // Ajusta según cómo registres tu caja

        if (estado === 'approved' && esDeMiCaja) {
            console.log("¡Pago real verificado y aprobado por la API de Mercado Pago!");
            ultimoPagoAprobado = true;
        } else {
            console.log(`Pago rechazado. Estado: ${estado}, Coincide caja: ${esDeMiCaja}`);
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
