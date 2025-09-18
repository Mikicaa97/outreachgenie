// src/openai.js
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o' // ostavi ovo za sada

// fraze koje ne želimo da se pojavljuju
const BAN_PHRASES = [
    /nadam se da (te|vas|vas ova) poruka nalazi dobro/gi,
    /nadam se da ste dobro/gi,
    /kontaktiram vas/gi,
    /obraćam vam se/gi,
    /želim da vam se predstavim/gi
]

// kratke CTA varijante (fallback koristi jednu)
const CTA_BANK = [
    'Ako je u redu, javite termin za kratak call.',
    'Pišite mi kada vam odgovara da se čujemo.',
    'Mogu da pošaljem više detalja — treba li vam?',
    'Ako vam je zanimljivo, hajde da se povežemo ove nedelje.'
]

// post-processing: čisti fraze, trimuje, opcioni paragrafi
function postProcess(text, { formatted = false } = {}) {
    let t = (text || '').trim()

    // ukloni zabranjene fraze
    BAN_PHRASES.forEach(rx => { t = t.replace(rx, '') })

    // zameniti duple razmake i linije
    t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

    if (!formatted) {
        // kompaktan stil: max 2 paragrafa
        const parts = t.split(/\n{2,}/).slice(0, 2)
        t = parts.join('\n\n')
    } else {
        // “lepsi” prikaz: osiguraj praznu liniju posle Subject: ako postoji
        t = t.replace(/^(Subject: .+)\n(?!\n)/i, '$1\n\n')
    }

    return t
}

// fallback generator (ako OpenAI padne)
function fallbackEmail({ full_name, company, recipient, base_text }) {
    const cta = CTA_BANK[Math.floor(Math.random() * CTA_BANK.length)]
    const subject = 'Kratak predlog'
    const body =
        `Zdravo ${recipient || ''},

${base_text || 'Javljam se sa kratkim predlogom koji možemo brzo da sprovedemo.'}

${cta}

Pozdrav,
${full_name || '—'}${company ? `\n${company}` : ''}`.trim()

    return { subject, body }
}

// helper: sleep
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// glavna funkcija sa retry + fallback
export async function generateMessage({
                                          full_name,
                                          company,
                                          recipient,
                                          base_text,
                                          tone = 'friendly',     // 'short' | 'formal' | 'friendly'
                                          type = 'general',      // 'offer' | 'promo' | 'followup' | ...
                                          formatted = false,     // paragrafi lepše
                                          model = MODEL
                                      }) {
    // prompt: kratak i strogo struktuisan
    const style =
        tone === 'short'   ? 'KRATAK I DIREKTAN. Bez uvoda i praznih fraza.' :
            tone === 'formal'  ? 'Profesionalan i sažet. Bez prenemaganja.' :
                'Prijateljski ali konkretan. Bez suvišnih uvoda.'

    const typeHint = {
        general:   'Opšti kratki email.',
        offer:     'Prodajni/predlog saradnje sa jasnim benefitom i CTA-om.',
        promo:     'Promo poruka (kratko, jasno, jedna ponuda).',
        followup:  'Follow-up na prethodnu komunikaciju.',
        technical: 'Tehnički zahtev ili instrukcija.',
        networking:'Kratko povezivanje / networking.',
        director:  'Obraćanje direktoru: sažeto, bez patetike.',
        linkedin:  'LinkedIn DM format: kratak i nenametljiv.',
        hiring:    'Kratka prijava/kandidatura.',
        reminder:  'Podsetnik: jasna referenca i sledeći korak.',
        apology:   'Izvinjenje: preuzmi odgovornost i predloži rešenje.'
    }[type] || 'Opšti kratki email.'

    const system = `
Piši e-mail na srpskom jeziku.
Zabrani fraze tipa "nadam se da te/vas poruka nalazi dobro".
Drži se suštine, 80–150 reči ukupno.
Vrati strogo JSON:

{
  "subject": "...",
  "body": "..."
}`.trim()

    const user = `
STIL: ${style}
TIP: ${typeHint}

Pošiljalac: ${full_name || '—'}${company ? `, ${company}` : ''}
Primalac: ${recipient || '—'}

ZADATAK:
${base_text || '—'}

Format odgovora: striktno JSON sa "subject" i "body". Bez dodatnog teksta.`.trim()

    // retry 3x sa exponential backoff
    const MAX_TRIES = 3
    let lastErr

    for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
        try {
            const res = await fetch(OPENAI_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model,
                    temperature: tone === 'formal' ? 0.5 : 0.8,
                    max_tokens: 350, // dovoljno da stane subject+body, ali ostaje kratko
                    messages: [
                        { role: 'system', content: system },
                        { role: 'user', content: user }
                    ]
                })
            })

            if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`)

            const data = await res.json()
            const raw = data?.choices?.[0]?.message?.content || ''

            // očekujemo JSON – bezbedno parsiranje
            let parsed
            try {
                parsed = JSON.parse(raw)
            } catch {
                // ponekad model “umota” JSON u tekst – pokušaj da izdvojimo
                const match = raw.match(/\{[\s\S]*\}/)
                parsed = match ? JSON.parse(match[0]) : null
            }

            if (!parsed?.subject || !parsed?.body) {
                throw new Error('Nevalidan format OpenAI odgovora')
            }

            const subject = postProcess(parsed.subject, { formatted })
            const body    = postProcess(parsed.body,    { formatted })

            return { subject, body }
        } catch (err) {
            lastErr = err
            // mali backoff: 500ms, 1200ms
            if (attempt < MAX_TRIES) await sleep(400 * attempt + 100)
        }
    }

    // ako sve padne → fallback
    const fb = fallbackEmail({ full_name, company, recipient, base_text })
    return {
        subject: postProcess(fb.subject, { formatted }),
        body: postProcess(fb.body, { formatted })
    }
}
