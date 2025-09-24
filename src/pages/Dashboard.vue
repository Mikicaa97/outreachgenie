<template>
  <div v-if="!session"></div>

  <div v-else class="bg-black text-white min-h-screen">

    <LoadingSpinner v-if="loading" />
    <TestBanner />
    <div v-if="currentView === 'home'" class="p-6 w-full mx-auto">
      <h1 class="text-xl text-center font-bold mb-8 animate-pulse">{{ t('dash_title') }}</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <!-- LEVO -->
        <div>
          <div class="mb-4 flex flex-col sm:flex-row gap-3">
            <input
                v-model="searchQuery"
                :placeholder="t('dash_search_placeholder')"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            />
            <select
                v-model="typeFilter"
                class="w-full sm:w-48 p-2 border border-gray-600 rounded bg-gray-900 text-white"
            >
              <option value="">{{ t('dash_filter_all') }}</option>
              <option value="general">{{ t('dash_type_general') }}</option>
              <option value="offer">{{ t('dash_type_offer') }}</option>
              <option value="promo">{{ t('dash_type_promo') }}</option>
              <option value="followup">{{ t('dash_type_followup') }}</option>
              <option value="technical">{{ t('dash_type_technical') }}</option>
              <option value="networking">{{ t('dash_type_networking') }}</option>
              <option value="director">{{ t('dash_type_director') }}</option>
              <option value="linkedin">{{ t('dash_type_linkedin') }}</option>
              <option value="hiring">{{ t('dash_type_hiring') }}</option>
              <option value="reminder">{{ t('dash_type_reminder') }}</option>
              <option value="apology">{{ t('dash_type_apology') }}</option>
            </select>
          </div>

          <h2 class="text-xl font-semibold mb-3">{{ t('dash_history') }}</h2>
          <div class="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            <ul>
              <li
                  v-for="msg in filteredMessages"
                  :key="msg.id"
                  class="mb-3 border border-gray-700 rounded p-3"
              >
                <div class="text-sm text-gray-400 mb-1">
                  <span class="uppercase tracking-wide">{{ msg.type || 'general' }}</span>
                  · {{ new Date(msg.created_at).toLocaleString() }}
                </div>
                <div class="mb-2">
                  <strong>{{ msg.full_name }}</strong> ({{ msg.company }}) → <em>{{ msg.service }}</em>
                </div>
                <pre class="whitespace-pre-wrap text-sm">{{ msg.offer_text }}</pre>

                <div class="mt-3 flex flex-wrap gap-3 justify-end text-sm">
                  <button @click="editMessage(msg)" class="text-blue-400 hover:underline">{{ t('dash_edit') }}</button>
                  <button @click="copyToClipboard(msg.offer_text)" class="text-blue-400 hover:underline">{{ t('dash_copy') }}</button>
                  <button @click="startRefine(msg)" class="text-emerald-400 hover:underline">{{ t('dash_edit_ai') }}</button>
                  <button @click="deleteMessage(msg.id)" class="text-red-400 hover:underline">{{ t('dash_delete') }}</button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- DESNO -->
        <div>
          <form @submit.prevent="submitForm" class="space-y-4 mb-8">
            <select v-model="emailType" class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white">
              <option value="">{{ t('dash_type_label') }}</option>
              <option value="general">{{ t('dash_type_general') }}</option>
              <option value="offer">{{ t('dash_type_offer') }}</option>
              <option value="promo">{{ t('dash_type_promo') }}</option>
              <option value="followup">{{ t('dash_type_followup') }}</option>
              <option value="technical">{{ t('dash_type_technical') }}</option>
              <option value="networking">{{ t('dash_type_networking') }}</option>
              <option value="director">{{ t('dash_type_director') }}</option>
              <option value="linkedin">{{ t('dash_type_linkedin') }}</option>
              <option value="hiring">{{ t('dash_type_hiring') }}</option>
              <option value="reminder">{{ t('dash_type_reminder') }}</option>
              <option value="apology">{{ t('dash_type_apology') }}</option>
            </select>

            <input v-model="full_name"
                   :placeholder="t('dash_name_ph')"
                   class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400" />

            <input v-model="company"
                   :placeholder="t('dash_company_ph')"
                   class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400" />

            <input v-model="service"
                   :placeholder="t('dash_target_ph')"
                   class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400" />

            <textarea v-model="offer_text"
                      :placeholder="t('dash_details_ph')"
                      class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"></textarea>

            <label class="block">{{ t('dash_tone_label') }}</label>
            <select v-model="tone" class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white">
              <option value="short">{{ t('dash_tone_short') }}</option>
              <option value="formal">{{ t('dash_tone_formal') }}</option>
              <option value="friendly">{{ t('dash_tone_friendly') }}</option>
            </select>

            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="addParagraphs" />
              <span>{{ t('dash_add_paragraphs') }}</span>
            </label>

            <button
                type="submit"
                class="w-full px-4 py-2 rounded text-white font-medium transition
                 bg-[#00C786] hover:bg-[#00b277] active:scale-95
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :disabled="isLoading"
            >
              <span v-if="isLoading" class="flex items-center gap-2">
                <!-- Animacija pulsa -->
                <span class="w-4 h-4 rounded-full bg-white animate-pulse"></span>
                {{ t('dash_generating') }}
              </span>
                          <span v-else>
                {{ t('dash_send') }}
              </span>
            </button>

            <div v-if="isLoading" class="text-center text-green-400 my-2 animate-pulse">
              {{ t('dash_generating_msg') }}
            </div>
          </form>

          <UpgradeCTA v-if="reachedLimit" />

          <div v-if="generatedMessage" class="bg-gray-900 p-4 rounded border border-green-500">
            <h3 class="text-green-400 mb-2 font-semibold">{{ t('dash_ai_title') }}</h3>
            <pre class="whitespace-pre-wrap text-sm">{{ generatedMessage }}</pre>
            <div class="mt-2 flex gap-3">
              <button @click="copyToClipboard(generatedMessage)" class="text-blue-400 hover:underline">
                {{ t('dash_copy') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- REFINE MODAL -->
      <div v-if="showRefine" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div class="bg-gray-900 border border-gray-700 p-4 rounded w-full max-w-xl">
          <h3 class="text-lg font-semibold mb-2 text-white">{{ t('dash_refine_title') }}</h3>

          <textarea v-model="refineBaseText" rows="6"
                    class="w-full p-2 border border-gray-600 rounded bg-black text-white mb-3"></textarea>

          <div class="grid grid-cols-2 gap-3 mb-3">
            <select v-model="refineTone" class="p-2 border border-gray-600 rounded bg-black text-white">
              <option value="short">{{ t('dash_tone_short') }}</option>
              <option value="formal">{{ t('dash_tone_formal') }}</option>
              <option value="friendly">{{ t('dash_tone_friendly') }}</option>
            </select>

            <select v-model="refineType" class="p-2 border border-gray-600 rounded bg-black text-white">
              <option value="general">{{ t('dash_type_general') }}</option>
              <option value="offer">{{ t('dash_type_offer') }}</option>
              <option value="promo">{{ t('dash_type_promo') }}</option>
              <option value="followup">{{ t('dash_type_followup') }}</option>
              <option value="technical">{{ t('dash_type_technical') }}</option>
              <option value="networking">{{ t('dash_type_networking') }}</option>
              <option value="director">{{ t('dash_type_director') }}</option>
              <option value="linkedin">{{ t('dash_type_linkedin') }}</option>
              <option value="hiring">{{ t('dash_type_hiring') }}</option>
              <option value="reminder">{{ t('dash_type_reminder') }}</option>
              <option value="apology">{{ t('dash_type_apology') }}</option>
            </select>
          </div>

          <div class="flex justify-end gap-2">
            <button @click="showRefine=false" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">{{ t('dash_cancel') }}</button>
            <button @click="saveRefinedReplace" class="px-3 py-1 rounded text-white" style="background:#00C786">
              {{ t('dash_refine_replace') }}
            </button>
            <button @click="saveRefinedAsNew" class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500">
              {{ t('dash_refine_new') }}
            </button>
          </div>
        </div>
      </div>

      <UpgradeCTA v-if="showUpgradeBanner" />
    </div>

    <div v-else>
      <Profile :session="session" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
// import { supabase } from '../supabase.js'
import { supabase } from '@/lib/supabaseClient'
import { generateMessage } from '../openai.js'
import Auth from "../components/Auth.vue"
import HeaderBar from '../components/HeaderBar.vue'
import Profile from "./Profile.vue"
import UpgradeCTA from '../components/UpgradeCTA.vue'
import TestBanner from "@/components/TestBanner.vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const currentView = ref('home')

/** Kontrole stila i tipa */
const tone = ref('friendly')       // 'short' | 'formal' | 'friendly'
const emailType = ref('general')   // 'general' | 'offer' | 'promo' | ...

/** Global state */
const reachedLimit = ref(false)
const showUpgradeBanner = ref(false)
const session = ref(null)

/** Forma / podaci */
const messages = ref([])
const full_name = ref('')
const company = ref('')
const service = ref('')
const offer_text = ref('')
const addParagraphs = ref(false)

/** Refine modal state */
const showRefine = ref(false)
const refiningMessageId = ref(null)
const refineBaseText = ref('')
const refineTone = ref(tone.value)      // default iz glavnog selecta
const refineType = ref(emailType.value)

/** Naslov (tipkanje) */
const titleText = "Piši cold emailove koji dobijaju klijente – pomoću AI-ja."
const animatedTitle = ref('')
let index = 0

const isLoading = ref(false)
const generatedMessage = ref('')

/** User plan */
const userPlan = ref('')

const loadUserPlan = async () => {
  if (!session.value?.user) return
  const { data, error } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', session.value.user.id)
      .single()

  if (!error && data) {
    userPlan.value = data.plan
  } else {
    console.error("Greška pri učitavanju plana:", error)
  }
}

/** Mount & Auth */
onMounted(async () => {
  // tipkanje naslova
  const interval = setInterval(() => {
    if (index < titleText.length) {
      animatedTitle.value += titleText[index]
      index++
    } else {
      clearInterval(interval)
    }
  }, 50)

  // sesija
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
    if (newSession?.user) {
      ensureProfileExists(newSession.user.id)
      loadMessages()
      loadUserPlan()
    }
  })

  if (session.value?.user) {
    loadMessages()
    loadUserPlan()
  }
})

const ensureProfileExists = async (userId) => {
  const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

  // PGRST116 = not found; u tom slučaju kreiraj profil
  if (error && error.code !== 'PGRST116') {
    console.error('Greška pri čitanju user_profiles:', error)
    return
  }
  if (!data) {
    const { error: insertError } = await supabase
        .from('user_profiles')
        .insert([{ id: userId, plan: 'free' }])
    if (insertError) console.error('Greška pri dodavanju user_profile:', insertError)
  }
}

/** Dinamični placeholderi */
const placeholderExamples = {
  general: "Napiši opšti email (kratak uvod, poenta, pozdrav).",
  offer: "Predstavi ponudu: npr. 'Nudimo održavanje Magento/Shopify sajta...'",
  promo: "Promo: 'Popust 20% na SEO paket do petka...'",
  followup: "Follow-up: 'Javljam se povodom razgovora od prošle nedelje...'",
  technical: "Tehnički zahtev: 'Molim backend da poveže formu sa email-om...'",
  networking: "Networking: 'Primijetio sam da pratimo slične teme...'",
  director: "Za direktora: 'Želim predlog saradnje za...'",
  linkedin: "LinkedIn: 'Video sam vaš profil, želeo bih da se povežemo...'",
  hiring: "Kandidatura: 'Prijavljujem se za poziciju... Prilažem CV...'",
  reminder: "Podsetnik: 'Samo podsećam na sastanak u...'",
  apology: "Izvinjenje: 'Želim da se izvinim zbog...'",
}

const servicePlaceholderExamples = {
  general: "Kome je namenjen email? (npr. Marko iz IT tima, klijent...)",
  offer: "Ime firme/osobe kojoj nudiš uslugu/proizvod...",
  promo: "Publika: npr. postojeći klijenti / newsletter lista...",
  followup: "Osoba kojoj šalješ podsećanje (npr. Petar iz HR-a)...",
  technical: "Osoba/tim kome šalješ tehnički zahtev...",
  networking: "Kontakt sa LinkedIn-a / konferencije...",
  director: "Direktor (ime) ili kompanija...",
  linkedin: "Ime profila kome pišeš...",
  hiring: "HR tim ili kontakt osoba...",
  reminder: "Osoba koju podsećaš (npr. Jelena – sastanak u 10h)...",
  apology: "Osoba kojoj se izvinjavaš...",
}

/** Animacija kucanja */
const typeText = async (text) => {
  generatedMessage.value = ''
  for (let i = 0; i < text.length; i++) {
    generatedMessage.value += text[i]
    await new Promise(resolve => setTimeout(resolve, 20))
  }
}

/** Kopiranje */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    alert("Nešto nije u redu sa kopiranjem.")
  }
}

/** Učitavanje poruka */
const loadMessages = async () => {
  if (!session.value?.user) return
  const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq('user_id', session.value.user.id)
      .order('created_at', { ascending: false })

  if (!error) {
    messages.value = [...data]
  } else {
    console.error('Greška pri učitavanju:', error)
  }
}

/** Brisanje */
const deleteMessage = async (id) => {
  const confirmed = confirm("Da li sigurno želiš da obrišeš ovu poruku?")
  if (!confirmed) return

  const { error } = await supabase
      .from('outreach_messages')
      .delete()
      .eq('id', id)

  if (error) {
    alert('Nešto nije uspelo.')
  } else {
    messages.value = messages.value.filter((m) => m.id !== id)
  }
}

/** Limit FREE vs PRO */
const hasReachedLimit = async () => {
  if (!session.value?.user) return false

  // koliko je poslao danas
  const { count, error } = await supabase
      .from('outreach_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.value.user.id)
      .gte('created_at', new Date().toISOString().split('T')[0])

  if (error) return false

  // plan korisnika
  const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', session.value.user.id)
      .single()

  if (profileError) return false
  if (profile?.plan === 'pro') return false

  return (count ?? 0) >= 999
}

/** Filteri */
const searchQuery = ref('')
const typeFilter = ref('')

const filteredMessages = computed(() => {
  const q = (searchQuery.value || '').toLowerCase().trim()
  const tf = (typeFilter.value || '').trim()

  return messages.value.filter(m => {
    const matchesType = tf ? (m.type || 'general') === tf : true
    if (!q) return matchesType
    const hay = `${m.full_name} ${m.company} ${m.service} ${m.offer_text}`.toLowerCase()
    return matchesType && hay.includes(q)
  })
})

/** Upgrade CTA */
const goToUpgrade = () => {
  window.location.href = 'https://buy.stripe.com/test_4gMeVf3Xjc1R7hUdOfaVa00'
}

/** Edit u formi */
const editMessage = (msg) => {
  full_name.value = msg.full_name
  company.value = msg.company
  service.value = msg.service
  offer_text.value = msg.offer_text
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Start refine (otvaranje modala) */
const startRefine = (msg) => {
  refiningMessageId.value = msg.id
  refineBaseText.value = msg.offer_text || ''
  refineTone.value = tone.value
  refineType.value = emailType.value
  showRefine.value = true
}

/** Sačuvaj doradu kao novu poruku (NE troši limit) */
const saveRefinedAsNew = async () => {
  if (!session.value?.user) return alert('Uloguj se.')

  const ai = await generateMessage({
    full_name: full_name.value || '—',
    company: company.value || '—',
    recipient: service.value || '—',
    base_text: refineBaseText.value,
    tone: refineTone.value,
    type: refineType.value,
    model: 'gpt-4o',
    formatted: addParagraphs.value
  })

  const aiMessage = ai?.subject && ai?.body ? `${ai.subject}\n\n${ai.body}` : (ai || '')

  const { error } = await supabase.from('outreach_messages').insert([{
    full_name: full_name.value || '—',
    company: company.value || '—',
    service: service.value || '—',
    offer_text: aiMessage,
    type: refineType.value,
    tone: refineTone.value,
    user_id: session.value.user.id
  }])

  if (error) {
    alert('Nešto nije uspelo.')
    return
  }

  showRefine.value = false
  refiningMessageId.value = null
  await loadMessages()
}

/** Sačuvaj doradu kao izmenu postojeće poruke (UPDATE) */
const saveRefinedReplace = async () => {
  if (!session.value?.user) return alert('Uloguj se.')
  if (!refiningMessageId.value) return alert('Nema poruke za izmenu.')

  const ai = await generateMessage({
    full_name: full_name.value || '—',
    company: company.value || '—',
    recipient: service.value || '—',
    base_text: refineBaseText.value,
    tone: refineTone.value,
    type: refineType.value,
    model: 'gpt-4o',
    formatted: addParagraphs.value
  })

  const aiMessage = ai?.subject && ai?.body ? `${ai.subject}\n\n${ai.body}` : (ai || '')

  const { error } = await supabase
      .from('outreach_messages')
      .update({ offer_text: aiMessage, type: refineType.value, tone: refineTone.value })
      .eq('id', refiningMessageId.value)
      .eq('user_id', session.value.user.id)

  if (error) {
    alert('Nešto nije uspelo.')
    return
  }

  // lokalna reaktivna izmena
  messages.value = messages.value.map(m =>
      m.id === refiningMessageId.value
          ? { ...m, offer_text: aiMessage, type: refineType.value, tone: refineTone.value }
          : m
  )

  showRefine.value = false
  refiningMessageId.value = null
}

/** Submit – generiši novu poruku */
const submitForm = async () => {
  if (await hasReachedLimit()) {
    showUpgradeBanner.value = true
    return
  }
  if (!full_name.value || !company.value || !service.value || !offer_text.value) {
    alert('Popuni sva polja!')
    return
  }

  try {
    isLoading.value = true
    generatedMessage.value = ''

    const ai = await generateMessage({
      full_name: full_name.value,
      company: company.value,
      recipient: service.value,
      base_text: offer_text.value,
      tone: tone.value,
      type: emailType.value,
      model: 'gpt-4o',
      formatted: addParagraphs.value
    })

    const aiMessage = ai?.subject && ai?.body
        ? `${ai.subject}\n\n${ai.body}`
        : (typeof ai === 'string' ? ai : 'Greška pri generisanju poruke.')

    await typeText(aiMessage)

    const user = session.value?.user
    if (!user) {
      alert("Morate biti prijavljeni da biste slali poruke.")
      return
    }

    const { error } = await supabase.from('outreach_messages').insert([{
      full_name: full_name.value,
      company: company.value,
      service: service.value,
      offer_text: aiMessage,
      type: emailType.value,
      tone: tone.value,
      user_id: user.id
    }])

    if (error) {
      alert('Došlo je do greške pri unosu.')
    } else {
      full_name.value = ''
      company.value = ''
      service.value = ''
      offer_text.value = ''
      tone.value = 'friendly'
      loadMessages()
    }
  } catch (err) {
    console.error('Greška u OpenAI:', err)
    alert('Došlo je do greške pri generisanju poruke.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.logo { height: 6em; padding: 1.5em; will-change: filter; transition: filter 300ms; }
.logo:hover { filter: drop-shadow(0 0 2em #646cffaa); }
.logo.vue:hover { filter: drop-shadow(0 0 2em #42b883aa); }
</style>
