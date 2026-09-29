# vending-cafe-backend
Servidor backend para cafetera vending con Mercado Pago

## Configuración

1. Instala dependencias:
   npm install

2. Crea un archivo `.env` con:
   PORT=3000
   NODE_ENV=development
   MP_ACCESS_TOKEN=tu_access_token
   MP_WEBHOOK_SECRET=tu_webhook_secret

3. Inicia el servidor:
   npm start

## Endpoints

- POST /webhook: recibe notificaciones de Mercado Pago
- GET /check-payment?machine_id=...: consulta si hay un pago aprobado
- GET /health: health check
- GET /admin/payments: lista pagos simulados (solo desarrollo)
- POST /admin/approve-payment/:paymentId: simula un pago aprobado (solo desarrollo)

## Nota
Este backend está preparado para integrar con Mercado Pago y para ser usado con un ESP32 o dispositivo similar.
