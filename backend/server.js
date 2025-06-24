require('dotenv').config(); // Carga variables desde .env
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const items = req.body.items;

    const line_items = items.map(item => ({
    price_data: {
        currency: 'usd',
        product_data: { name: item.name },
      unit_amount: item.price * 100, // Convierte a centavos
    },
    quantity: item.quantity,
    }));

    try {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,
        success_url: 'http://localhost:5500/success.html',
        cancel_url: 'http://localhost:5500/cancel.html',
    });

    res.json({ id: session.id });
    } catch (error) {
    console.error('Error creando sesión:', error);
    res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('✅ Servidor backend escuchando en http://localhost:3000');
});
