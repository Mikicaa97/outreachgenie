import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import crypto from "crypto";

dotenv.config();

const app = express();

// Za __dirname u ES modu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS (obavezno stavi svoj frontend URL)
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://outreachgenie-production.up.railway.app"
        ],
        credentials: true,
    })
);

// ⚠️ Stripe treba RAW body za webhook PRE express.json()
app.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: "2022-11-15",
        });

        let event;
        const sig = req.headers["stripe-signature"];

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("❌ Stripe Webhook greška:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log("📦 Stripe Session:", session);

            let customerEmail = session.customer_email;

            if (!customerEmail && session.customer) {
                const customer = await stripe.customers.retrieve(session.customer);
                customerEmail = customer.email;
            }

            if (!customerEmail) {
                console.error("❌ Nema email adrese u sesiji");
                return res.status(400).send("Nema email adrese u sesiji");
            }

            console.log("📬 Plaćanje uspešno za:", customerEmail);

            const supabase = createClient(
                process.env.SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            const { error } = await supabase
                .from("user_profiles")
                .update({ plan: "pro" })
                .eq("email", customerEmail);

            if (error) {
                console.error("❌ Greška pri ažuriranju plana:", error.message);
            } else {
                console.log(`✅ Plan za ${customerEmail} je postavljen na PRO`);
            }
        }

        res.status(200).json({ received: true });
    }
);

// ✅ SADA regularni middleware-i
app.use(express.json({ limit: "1mb" }));

// ✅ Inicijalizacija Stripe, Supabase i OpenAI
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
});
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ---------- Stripe: Checkout ----------
app.post("/api/create-checkout-session", async (req, res) => {
    const { plan, userId, email } = req.body;

    if (!plan || !userId || !email) {
        return res.status(400).json({ error: "Nedostaju podaci za kreiranje sesije" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            customer_email: email,
            line_items: [
                {
                    price: process.env.STRIPE_PRO_PLAN_PRICE_ID,
                    quantity: 1,
                },
            ],
            metadata: { user_id: userId, plan },
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Stripe greška:", error);
        res.status(500).json({ error: "Neuspešno kreiranje sesije" });
    }
});

// ---------- AI generator ----------
app.post("/api/generate-message", async (req, res) => {
    const { emailType, full_name, company, service, offer_text, tone, addParagraphs } =
        req.body;

    console.log("📩 Primljeni podaci:", req.body);

    if (!emailType || !full_name || !offer_text) {
        return res.status(400).json({ error: "Nedostaju podaci" });
    }

    try {
        const prompt = `Generiši ${tone} email (${emailType}) od osobe ${full_name} iz ${
            company || "nepoznate firme"
        } ka ${service}, sa porukom: ${offer_text}. ${
            addParagraphs ? "Dodaj paragrafe." : ""
        }`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content:
                        "Ti si stručnjak za pisanje email poruka za firme, prodaju i komunikaciju.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
        });

        const message = response.choices?.[0]?.message?.content;

        if (!message) {
            console.error("❌ Nema odgovora iz OpenAI:", response);
            return res.status(500).json({ error: "OpenAI nije vratio poruku." });
        }

        res.json({ message });
    } catch (err) {
        console.error("Greška u AI generisanju:", err);
        res.status(500).json({ error: "Greška u generisanju poruke" });
    }
});

// ---------- Gmail OAuth klijent ----------
const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI // npr. https://outreachgenie-production.up.railway.app/auth/callback
);

// Helper: merguj i sačuvaj token u Supabase
async function saveUserGmailToken(userId, tokens, gmailEmail) {
    // ako refresh_token ne stigne (Google ga ponekad ne šalje ako korisnik već dao consent),
    // NE briši postojeći refresh_token iz baze – sačuvaj stari.
    const { data: current } = await supabase
        .from("user_profiles")
        .select("gmail_token")
        .eq("id", userId)
        .single();

    let merged = tokens || {};
    if (current?.gmail_token?.refresh_token && !tokens?.refresh_token) {
        merged.refresh_token = current.gmail_token.refresh_token;
    }

    const { error } = await supabase
        .from("user_profiles")
        .update({ gmail_token: merged, gmail_email: gmailEmail || null })
        .eq("id", userId);

    if (error) {
        console.error("❌ Greška pri čuvanju gmail_token:", error);
        throw error;
    }
}

// ---------- Gmail: auth-url (generiši URL sa state=userId) ----------
// ---------- Gmail: auth-url (generiši URL sa state=userId) ----------
app.post("/api/gmail/auth-url", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "Nedostaje userId" });

        const state = Buffer.from(JSON.stringify({ userId })).toString("base64url");

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            prompt: "consent", // traži refresh_token čak i ako je ranije dat
            scope: [
                "https://www.googleapis.com/auth/gmail.send",
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/gmail.modify", // opcionalno — kasnije možeš obeležiti mejlove kao "pročitane"
            ],
            state,
        });

        console.log("✅ Gmail Auth URL (send + read) generisan");
        res.json({ url });
    } catch (err) {
        console.error("❌ /api/gmail/auth-url error:", err);
        res.status(500).json({ error: "Neuspelo generisanje auth URL-a" });
    }
});


// ---------- Gmail: callback (snimi token + email) ----------
app.get("/auth/callback", async (req, res) => {
    try {
        const code = req.query.code;
        const stateRaw = req.query.state;
        if (!code || !stateRaw) return res.status(400).send("Nedostaju code/state");

        const { userId } = JSON.parse(
            Buffer.from(stateRaw, "base64url").toString("utf8")
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // saznaj gmail email (userinfo)
        const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
        const me = await oauth2.userinfo.get();
        const gmailEmail = me?.data?.email || null;

        await saveUserGmailToken(userId, tokens, gmailEmail);

        console.log(`✅ Gmail povezan za user_id=${userId} (${gmailEmail || "?"})`);

        // mali HTML koji se prikaže u popup-u
        res.send(`
      <!doctype html><html><body style="font-family:sans-serif;padding:24px">
      <h3>✅ Google nalog povezan</h3>
      <p>Možeš zatvoriti ovaj prozor i nastaviti u aplikaciji.</p>
      <script>setTimeout(()=>window.close(), 1000)</script>
      </body></html>
    `);
    } catch (err) {
        console.error("❌ Greška u /auth/callback:", err);
        res
            .status(500)
            .send("Greška pri povezivanju Gmail-a. Pogledaj server log.");
    }
});

// ---------- Gmail: status (da li je user povezan) ----------
app.get("/api/gmail/status", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ connected: false });

        const { data, error } = await supabase
            .from("user_profiles")
            .select("gmail_token, gmail_email")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("❌ /api/gmail/status greška:", error);
            return res.json({ connected: false });
        }

        const connected = !!(data?.gmail_token?.refresh_token || data?.gmail_token?.access_token);
        res.json({ connected, email: data?.gmail_email || null });
    } catch (err) {
        console.error("❌ /api/gmail/status error:", err);
        res.json({ connected: false });
    }
});

// Helper: pripremi OAuth client iz baze
async function getAuthedClientForUser(userId) {
    const { data, error } = await supabase
        .from("user_profiles")
        .select("gmail_token, gmail_email")
        .eq("id", userId)
        .single();

    if (error || !data?.gmail_token) {
        throw new Error("Korisnik nema sačuvan Gmail token");
    }

    const client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
    );

    client.setCredentials(data.gmail_token);

    // refresh ako treba (googleapis to radi automatski prilikom poziva, ali možemo proaktivno)
    try {
        if (data.gmail_token.refresh_token) {
            await client.getAccessToken(); // trigeruje refresh ako je exp.
        }
    } catch (e) {
        console.warn("⚠️ Problem pri refresh-u tokena, korisnik treba re-auth:", e?.message);
    }

    return { client, gmailEmail: data.gmail_email };
}

// ---------- Gmail: slanje mejla ----------
app.post("/api/gmail/send", async (req, res) => {
    try {
        const { userId, to, subject, body } = req.body;

        if (!userId || !to || !subject || !body) {
            return res.status(400).json({ error: "Nedostaju userId/to/subject/body" });
        }

        const { client, gmailEmail } = await getAuthedClientForUser(userId);
        const gmail = google.gmail({ version: "v1", auth: client });

        if (!gmailEmail) {
            return res.status(400).json({ error: "Korisnik nema povezan Gmail nalog" });
        }

        // generiši unique ID za praćenje
        const trackingId = crypto.randomUUID();
        const trackingPixelUrl = `https://outreachgenie-production.up.railway.app/track/open/${trackingId}.png`;

        // zameni sve linkove u tekstu sa tracking verzijom
        const trackedBody = body.replace(
            /(https?:\/\/[^\s]+)/g,
            (url) => {
                const encoded = Buffer.from(url).toString("base64");
                return `https://outreachgenie-production.up.railway.app/track/click/${trackingId}/${encoded}`;
            }
        );

        // formiraj HTML telo mejla
                const htmlBody = `
          <div>
            ${trackedBody.replace(/\n/g, "<br>")}
            <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />
          </div>
        `;


        const message = [
            `From: ${gmailEmail}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/html; charset="UTF-8"`,
            "",
            htmlBody,
        ].join("\n");

        // opcionalno sačuvaj trackingId u outreach_messages
        const { data: lastMessage } = await supabase
            .from("outreach_messages")
            .select("id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (lastMessage) {
            await supabase
                .from("outreach_messages")
                .update({ tracking_id: trackingId })
                .eq("id", lastMessage.id);
        }



        const encodedMessage = Buffer.from(message, "utf-8")
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        const result = await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
        });

        res.json({ success: true, result });
    } catch (err) {
        console.error("❌ Greška pri slanju Gmail-a:", err?.response?.data || err.message || err);
        res.status(500).json({ error: err?.response?.data || err.message || "Gmail send error" });
    }
});


// ---------- Contacts ----------
app.get("/api/contacts", async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post("/api/contacts", async (req, res) => {
    const { userId, first_name, last_name, email, company, tags } = req.body;
    if (!userId || !email) return res.status(400).json({ error: "Missing data" });

    const { error } = await supabase.from("contacts").insert([
        { user_id: userId, first_name, last_name, email, company, tags },
    ]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// ---------- Campaigns ----------
app.get("/api/campaigns", async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.post("/api/campaigns", async (req, res) => {
    const { userId, name, description } = req.body;
    if (!userId || !name) return res.status(400).json({ error: "Missing data" });

    const { error } = await supabase
        .from("campaigns")
        .insert([{ user_id: userId, name, description }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});



// ---------- Email events: status po useru ----------
app.get("/api/email-events/status", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: "Nedostaje userId" });

        const { data, error } = await supabase
            .from("email_events")
            .select("tracking_id, event_type, is_real_open")
            .eq("user_id", userId);

        if (error) throw error;

        const status = {};
        for (const row of data) {
            if (!status[row.tracking_id]) status[row.tracking_id] = {};

            if (row.event_type === "open") {
                if (row.is_real_open) status[row.tracking_id].real = true;
                else status[row.tracking_id].probable = true;
            }

            if (row.event_type === "click") status[row.tracking_id].clicked = true;

            // 🟩 Novi deo – dodaj ispod
            if (row.event_type === "reply") {
                status[row.tracking_id].replied = true;
            }
        }


        res.json({ opened: status });
    } catch (err) {
        console.error("❌ /api/email-events/status error:", err.message);
        res.status(500).json({ error: "Greška pri čitanju statusa" });
    }
});


// ---------- Gmail: Reply Tracking ----------
app.get("/api/gmail/check-replies", async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) return res.status(400).json({ error: "Nedostaje userId" });

        // 🔹 Preuzmi korisnikov Gmail token iz baze
        const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("gmail_token, gmail_email")
            .eq("id", userId)
            .single();

        if (error || !profile?.gmail_token)
            return res.status(400).json({ error: "Korisnik nema povezan Gmail" });

        const oauth2Client = new google.auth.OAuth2(
            process.env.GMAIL_CLIENT_ID,
            process.env.GMAIL_CLIENT_SECRET,
            process.env.GMAIL_REDIRECT_URI
        );
        oauth2Client.setCredentials(profile.gmail_token);
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        // 🔹 Uzimamo listu threadova iz inboxa
        const threadsResponse = await gmail.users.threads.list({
            userId: "me",
            labelIds: ["INBOX"],
            q: "in:inbox newer_than:7d", // samo zadnjih 7 dana
            maxResults: 50,
        });

        if (!threadsResponse.data.threads) return res.json({ found: 0 });

        let replyCount = 0;

        for (const thread of threadsResponse.data.threads) {
            const threadData = await gmail.users.threads.get({
                userId: "me",
                id: thread.id,
            });

            const messages = threadData.data.messages || [];
            if (messages.length < 2) continue; // ako ima samo tvoj mejl, nema odgovora

            const lastMsg = messages[messages.length - 1];
            const headers = lastMsg.payload?.headers || [];

            const fromHeader = headers.find((h) => h.name === "From")?.value || "";
            const subjectHeader = headers.find((h) => h.name === "Subject")?.value || "";

            // Ako pošiljalac nije tvoj Gmail → znači da je odgovor
            if (!fromHeader.includes(profile.gmail_email)) {
                const replyEvent = {
                    event_type: "reply",
                    user_id: userId,
                    ip_address: "gmail",
                    user_agent: "gmail_api",
                    created_at: new Date().toISOString(),
                };

                const { error: insertErr } = await supabase
                    .from("email_events")
                    .insert([replyEvent]);

                if (!insertErr) {
                    replyCount++;
                    console.log(`💬 Reply detektovan: ${subjectHeader}`);
                }
            }
        }

        res.json({ replies_found: replyCount });
    } catch (err) {
        console.error("❌ /api/gmail/check-replies error:", err);
        res.status(500).json({ error: err.message });
    }
});



// ---------- Email Tracking (Open + Click) ----------
// ✅ OPEN TRACKING
app.get("/track/open/:id.png", async (req, res) => {
    try {
        const openId = req.params.id;
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"] || "unknown";
        let isReal = true;

        // Gmail i Apple mail proxy detekcija
        if (userAgent.includes("GoogleImageProxy") || ip?.startsWith("66.249") || ip?.startsWith("64.233")) {
            console.log("⚠️ Gmail proxy open – beležim kao 'probable open'. IP:", ip);
            isReal = false;
        }

        // pronađi korisnika
        const { data: msg } = await supabase
            .from("outreach_messages")
            .select("user_id")
            .eq("tracking_id", openId)
            .single();

        const userId = msg?.user_id || null;

        // dupli open u poslednjih 2 minuta?
        const { data: existing } = await supabase
            .from("email_events")
            .select("created_at")
            .eq("tracking_id", openId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (existing?.length && Date.now() - new Date(existing[0].created_at).getTime() < 120000) {
            console.log("⚠️ Ignorišem dupli open:", openId);
        } else {
            const { error } = await supabase.from("email_events").insert([
                {
                    event_type: "open",
                    tracking_id: openId,
                    ip_address: ip,
                    user_agent: userAgent,
                    user_id: userId,
                    is_real_open: isReal,
                    created_at: new Date().toISOString(),
                },
            ]);

            if (error) console.error("❌ Greška pri logovanju open eventa:", error.message);
        }

        // vraćamo transparentni piksel
        const pixel = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
            "base64"
        );
        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": pixel.length,
            "Cache-Control": "no-cache, no-store, must-revalidate",
        });
        res.end(pixel);
    } catch (err) {
        console.error("❌ Tracking error:", err);
        res.status(500).send("Tracking error");
    }
});

// ✅ CLICK TRACKING
app.get("/track/click/:trackingId/:encodedUrl", async (req, res) => {
    try {
        const { trackingId, encodedUrl } = req.params;
        const decodedUrl = Buffer.from(encodedUrl, "base64").toString("utf8");
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"] || "unknown";

        const { data: msg } = await supabase
            .from("outreach_messages")
            .select("user_id")
            .eq("tracking_id", trackingId)
            .single();

        const userId = msg?.user_id || null;

        await supabase.from("email_events").insert([
            {
                event_type: "click",
                tracking_id: trackingId,
                ip_address: ip,
                user_agent: userAgent,
                user_id: userId,
                created_at: new Date().toISOString(),
            },
        ]);

        console.log(`✅ Klik zabeležen (${trackingId}) → ${decodedUrl}`);
        res.redirect(decodedUrl);
    } catch (err) {
        console.error("❌ Click tracking error:", err);
        res.status(500).send("Click tracking error");
    }
});






// ---------- Health & Version ----------
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/version", (req, res) =>
    res.json({ version: "gmail-oauth-v1", time: new Date().toISOString() })
);

// ---------- Serve Vue frontend (dist) ----------
const distPath = path.join(__dirname, "dist");
console.log("Serving frontend from:", distPath);

app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
});



app.use(express.static(distPath));
app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});

// ---------- Start ----------
const PORT = process.env.PORT || 3000;
console.log(
    "✅ ENV:",
    { FRONTEND_URL: process.env.FRONTEND_URL, SUPABASE_URL: process.env.SUPABASE_URL },
    "\nGMAIL_REDIRECT_URI:",
    process.env.GMAIL_REDIRECT_URI
);
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});



const footer = `
  <div style="font-size:12px;color:#888;margin-top:30px;">
    <hr style="border:none;border-top:1px solid #333;margin:10px 0;" />
    <p>
      You received this email via <strong>OutreachGenie</strong>.  
      <a href="https://outreachgenie.com/unsubscribe" style="color:#00C786;">Unsubscribe</a>
    </p>
  </div>
`;

const htmlBody = `
  <div>
    ${body.replace(/\n/g, "<br>")}
    <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" />
    ${footer}
  </div>
`;

