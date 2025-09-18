import express from 'express'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

dotenv.config()

const app = express()

// ⛔ STRIPE zahteva RAW BODY za webhook – ovo mora da bude PRE express.json()
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })

    let event
    const sig = req.headers['stripe-signature']

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (err) {
        console.error('❌ Stripe Webhook greška:', err.message)
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        console.log("📦 Stripe Session:", session)

        let customerEmail = session.customer_email

        // Ako nije stigao email, dohvatimo preko session.customer
        if (!customerEmail && session.customer) {
            const customer = await stripe.customers.retrieve(session.customer)
            customerEmail = customer.email
        }

        if (!customerEmail) {
            console.error('❌ Nema email adrese u sesiji')
            return res.status(400).send('Nema email adrese u sesiji')
        }

        console.log('📬 Plaćanje uspešno za:', customerEmail)

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

        const { error } = await supabase
            .from('user_profiles')
            .update({ plan: 'pro' })
            .eq('email', customerEmail)

        if (error) {
            console.error('❌ Greška pri ažuriranju plana:', error.message)
        } else {
            console.log(`✅ Plan za ${customerEmail} je postavljen na PRO`)
        }
    }

    res.status(200).json({ received: true })
})

// ✅ TEK SAD normalni middleware-i
app.use(cors())
app.use(express.json())

// ✅ Inicijalizacija Stripe, Supabase i OpenAI
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ✅ Checkout ruta
app.post('/api/create-checkout-session', async (req, res) => {
    const { plan, userId, email } = req.body

    if (!plan || !userId || !email) {
        return res.status(400).json({ error: 'Nedostaju podaci za kreiranje sesije' })
    }

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
                user_id: userId,
                plan: plan,
            },
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cancel',
        })

        res.json({ url: session.url })
    } catch (error) {
        console.error('❌ Stripe greška:', error)
        res.status(500).json({ error: 'Neuspešno kreiranje sesije' })
    }
})

// ✅ AI generator
app.post('/api/generate-message', async (req, res) => {
    const {
        emailType,
        full_name,
        company,
        service,
        offer_text,
        tone,
        addParagraphs
    } = req.body;

    console.log("📩 Primljeni podaci:", req.body);

    if (!emailType || !full_name || !offer_text) {
        return res.status(400).json({ error: 'Nedostaju podaci' });
    }

    try {
        const prompt = `Generiši ${tone} email (${emailType}) od osobe ${full_name} iz ${company || "nepoznate firme"} ka ${service}, sa porukom: ${offer_text}. ${addParagraphs ? "Dodaj paragrafe." : ""}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: 'Ti si stručnjak za pisanje email poruka za firme, prodaju i komunikaciju.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
        });

        const message = response.choices?.[0]?.message?.content;

        if (!message) {
            console.error("❌ Nema odgovora iz OpenAI:", response);
            return res.status(500).json({ error: 'OpenAI nije vratio poruku.' });
        }

        res.json({ message });
    } catch (err) {
        console.error('Greška u AI generisanju:', err);
        res.status(500).json({ error: 'Greška u generisanju poruke' });
    }
});

app.listen(4242, () => {
    console.log('🚀 Express backend radi na http://localhost:4242')
})
