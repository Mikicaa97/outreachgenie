// src/utils/upgrade.js
import { supabase } from '@/lib/supabaseClient'

export const upgrade = async (planType, email) => {
    try {
        const { data } = await supabase.auth.getUser()
        const userId = data.user.id

        const response = await fetch('http://localhost:4242/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: planType, userId, email }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Greška iz API-ja:', response.status, errorText)
            alert('Greška prilikom povezivanja sa serverom.')
            return
        }

        const result = await response.json()
        if (result?.url) {
            window.location.href = result.url
        } else {
            console.error('⚠️ Neispravan odgovor (nema URL):', result)
            alert('Greška prilikom kreiranja Stripe sesije.')
        }
    } catch (error) {
        console.error('🔥 Greška u upgrade funkciji:', error)
        alert('Neočekivana greška prilikom nadogradnje.')
    }
}
