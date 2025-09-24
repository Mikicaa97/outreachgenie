// src/api/create-checkout-session.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // daj Stripe instancu
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2022-11-15',
    })

    const { plan, userId, email } = req.body

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: email,
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PLAN_PRICE_ID,
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                plan,
            },
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,

        })

        return res.status(200).json({ url: session.url })

    } catch (err) {
        console.error('Stripe greška:', err)
        return res.status(500).json({ error: 'Stripe session creation failed' })
    }
}
