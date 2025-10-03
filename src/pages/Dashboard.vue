<template>
  <div v-if="!session"></div>

  <div v-else class="bg-black text-white min-h-screen">
    <LoadingSpinner v-if="loading" />
    <TestBanner />

    <div v-if="currentView === 'home'" class="p-6 w-full mx-auto">
      <h1 class="text-sm text-center font-bold mb-8 animate-pulse">
        {{ t('dash_title') }}
      </h1>

      <!-- 🔹 Dugme za hamburger na mobilu -->
      <div class="lg:hidden flex justify-between items-center mb-4">
        <button
            @click="showHistoryPanel = true"
            class="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700"
        >
          ☰ {{ t('dash_history') }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <!-- LEVO: Istorija (desktop) -->
        <div class="hidden lg:block">
          <HistoryPanel
              :messages="filteredMessages"
              v-model:searchQuery="searchQuery"
              v-model:typeFilter="typeFilter"
              @edit="editMessage"
              @copy="copyToClipboard"
              @refine="startRefine"
              @delete="deleteMessage"
          />
        </div>

        <!-- DESNO: Generator -->
        <div>
          <!-- 🔹 Gmail Integracija -->
          <div class="mb-6 flex flex-wrap items-center gap-3">
            <button
                @click="connectGmail"
                class="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
            >
              📧 Poveži Gmail nalog
            </button>
            <span v-if="gmailConnected" class="text-green-400 font-semibold">
              ✅ Gmail povezan <span v-if="gmailEmail">({{ gmailEmail }})</span>
            </span>
            <span v-else class="text-yellow-400">Nalog nije povezan</span>
          </div>

          <form @submit.prevent="submitForm" class="space-y-4 mb-8">
            <select
                v-model="emailType"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white"
            >
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

            <!-- NOVO: Email (To) + Subject -->
            <input
                v-model="recipientEmail"
                type="email"
                placeholder="Recipient email (To)"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
                required
            />
            <input
                v-model="subject"
                type="text"
                placeholder="Subject"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
                required
            />

            <input
                v-model="full_name"
                :placeholder="t('dash_name_ph')"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            />

            <input
                v-model="company"
                :placeholder="t('dash_company_ph')"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            />

            <input
                v-model="service"
                :placeholder="t('dash_target_ph')"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            />

            <textarea
                v-model="offer_text"
                :placeholder="t('dash_details_ph')"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
            ></textarea>

            <label class="block">{{ t('dash_tone_label') }}</label>
            <select
                v-model="tone"
                class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white"
            >
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
                <span class="w-4 h-4 rounded-full bg-white animate-pulse"></span>
                {{ t('dash_generating') }}
              </span>
              <span v-else>{{ t('dash_send') }}</span>
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

          <textarea
              v-model="refineBaseText"
              rows="6"
              class="w-full p-2 border border-gray-600 rounded bg-black text-white mb-3"
          ></textarea>

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
            <button @click="showRefine=false" class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600">
              {{ t('dash_cancel') }}
            </button>
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

      <!-- 🔹 Sidebar za mobilnu istoriju -->
      <transition name="slide">
        <div v-if="showHistoryPanel" class="fixed inset-0 z-50 flex">
          <div class="flex-1 bg-black/50" @click="showHistoryPanel = false"></div>
          <div class="w-80 bg-gray-900 h-full p-4 overflow-y-auto shadow-lg">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold">{{ t('dash_history') }}</h2>
              <button @click="showHistoryPanel = false" class="text-red-400">✕</button>
            </div>

            <HistoryPanel
                :messages="filteredMessages"
                v-model:searchQuery="searchQuery"
                v-model:typeFilter="typeFilter"
                @edit="editMessage"
                @copy="copyToClipboard"
                @refine="startRefine"
                @delete="deleteMessage"
            />
          </div>
        </div>
      </transition>

      <!-- Feedback -->
      <div class="max-w-6xl mx-auto mt-10 bg-gray border border-gray-700 p-4 rounded">
        <h2 class="text-lg font-semibold mb-3">{{ $t('feedback_title') }}</h2>

        <textarea
            v-model="feedbackMessage"
            :placeholder="$t('feedback_placeholder')"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
        ></textarea>

        <button @click="submitFeedback" class="mt-3 px-4 py-2 bg-[#00C786] hover:bg-[#00b277] rounded text-white font-medium">
          {{ $t('feedback_button') }}
        </button>

        <p v-if="feedbackSent" class="text-green-400 mt-2">
          {{ $t('feedback_thanks') }}
        </p>
      </div>
    </div>

    <div v-else>
      <Profile :session="session" />
    </div>
  </div>
</template>

<script setup>
import HistoryPanel from '@/components/HistoryPanel.vue'
import { ref, onMounted, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { generateMessage } from '../openai.js'
import Profile from "./Profile.vue"
import UpgradeCTA from '../components/UpgradeCTA.vue'
import TestBanner from "@/components/TestBanner.vue"
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/** View kontrole */
const currentView = ref('home')
const showHistoryPanel = ref(false)

/** Global state */
const session = ref(null)
const userPlan = ref('')
const reachedLimit = ref(false)
const showUpgradeBanner = ref(false)
const isLoading = ref(false)
const generatedMessage = ref('')

/** Forma */
const recipientEmail = ref('')
const subject = ref('')
const full_name = ref('')
const company = ref('')
const service = ref('')
const offer_text = ref('')
const tone = ref('friendly')
const emailType = ref('general')
const addParagraphs = ref(false)

/** Poruke */
const messages = ref([])

/** Gmail */
const gmailConnected = ref(false)
const gmailEmail = ref(null)

async function connectGmail() {
  if (!session.value?.user?.id) {
    alert('Uloguj se da povežeš Gmail.')
    return
  }
  try {
    const resp = await fetch('https://outreachgenie-production.up.railway.app/api/gmail/auth-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: session.value.user.id })
    })
    const data = await resp.json()
    if (data?.url) {
      window.location.href = data.url
    } else {
      alert('Ne mogu da generišem Google auth URL.')
    }
  } catch (e) {
    console.error('❌ auth-url error:', e)
    alert('Greška pri otvaranju Google autorizacije.')
  }
}

async function checkGmailStatus() {
  if (!session.value?.user?.id) return
  try {
    const resp = await fetch(`https://outreachgenie-production.up.railway.app/api/gmail/status?userId=${session.value.user.id}`)
    const data = await resp.json()
    gmailConnected.value = !!data?.connected
    gmailEmail.value = data?.email || null
  } catch (e) {
    console.warn('⚠️ gmail status error:', e)
    gmailConnected.value = false
  }
}

/** Refine modal */
const showRefine = ref(false)
const refiningMessageId = ref(null)
const refineBaseText = ref('')
const refineTone = ref(tone.value)
const refineType = ref(emailType.value)

/** Pretraga i filter */
const searchQuery = ref('')
const typeFilter = ref('')

/** Feedback */
const feedbackMessage = ref('')
const feedbackSent = ref(false)

const submitFeedback = async () => {
  if (!session.value?.user) {
    alert("Moraš biti prijavljen da bi ostavio komentar.")
    return
  }

  if (!feedbackMessage.value.trim()) {
    alert("Unesi komentar pre slanja.")
    return
  }

  const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('id', session.value.user.id)
      .single()

  const { error } = await supabase.from('feedback').insert([{
    user_id: session.value.user.id,
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    message: feedbackMessage.value
  }])

  if (error) {
    console.error("Greška pri upisu feedback-a:", error)
    alert("Došlo je do greške. Pokušaj ponovo.")
  } else {
    feedbackMessage.value = ''
    feedbackSent.value = true
    setTimeout(() => (feedbackSent.value = false), 3000)
  }
}

/** Dinamični placeholderi */
watch(emailType, () => {
  offer_text.value = ''
  service.value = ''
})

/** Computed filter za poruke */
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

/** Kopiranje */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    alert("Nešto nije u redu sa kopiranjem.")
  }
}

/** Učitavanje user plana */
const loadUserPlan = async () => {
  if (!session.value?.user) return
  const { data, error } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('id', session.value.user.id)
      .single()

  if (error) {
    console.error("❌ Greška pri učitavanju plana:", error.message)
  } else {
    userPlan.value = data.plan
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

  if (error) {
    console.error("❌ Greška pri učitavanju poruka:", error.message)
  } else {
    messages.value = [...data]
  }
}

/** Edit */
const editMessage = (msg) => {
  full_name.value = msg.full_name
  company.value = msg.company
  service.value = msg.service
  offer_text.value = msg.offer_text
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** Delete */
const deleteMessage = async (id) => {
  const confirmed = confirm("Da li sigurno želiš da obrišeš ovu poruku?")
  if (!confirmed) return

  const { error } = await supabase.from('outreach_messages').delete().eq('id', id)
  if (error) {
    console.error("❌ Greška pri brisanju:", error.message)
  } else {
    messages.value = messages.value.filter(m => m.id !== id)
  }
}

/** Refine */
const startRefine = (msg) => {
  refiningMessageId.value = msg.id
  refineBaseText.value = msg.offer_text || ''
  refineTone.value = tone.value
  refineType.value = emailType.value
  showRefine.value = true
}

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
    user_id: session.value.user.id,
    created_at: new Date().toISOString()
  }])

  if (error) {
    console.error("❌ Greška pri insertu (saveRefinedAsNew):", error.message)
    alert("Greška pri upisu: " + error.message)
  } else {
    showRefine.value = false
    refiningMessageId.value = null
    await loadMessages()
  }
}

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
    console.error("❌ Greška pri update:", error.message)
    alert("Greška pri izmeni: " + error.message)
  } else {
    messages.value = messages.value.map(m =>
        m.id === refiningMessageId.value
            ? { ...m, offer_text: aiMessage, type: refineType.value, tone: refineTone.value }
            : m
    )
    showRefine.value = false
    refiningMessageId.value = null
  }
}

/** Submit */
const submitForm = async () => {
  if (!recipientEmail.value || !subject.value || !full_name.value || !company.value || !service.value || !offer_text.value) {
    alert('Popuni sva polja, uključujući Recipient i Subject!')
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

    generatedMessage.value = aiMessage

    const user = session.value?.user
    if (!user) return alert("Morate biti prijavljeni da biste slali poruke.")

    // Sačuvaj u istoriji
    const { error } = await supabase.from('outreach_messages').insert([{
      full_name: full_name.value,
      company: company.value,
      service: service.value,
      offer_text: aiMessage,
      type: emailType.value,
      tone: tone.value,
      user_id: user.id,
      created_at: new Date().toISOString()
    }])

    if (error) {
      console.error("❌ Greška pri insertu (submitForm):", error.message)
      alert("Greška pri upisu: " + error.message)
    } else {
      // ✅ Pošalji kroz Gmail (per-user)
      try {
        const res = await fetch("https://outreachgenie-production.up.railway.app/api/gmail/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            to: recipientEmail.value,
            subject: subject.value,
            body: aiMessage
          })
        })
        const data = await res.json()
        if (data?.success) {
          alert("✅ Email uspešno poslat kroz Gmail!")
          gmailConnected.value = true
        } else {
          console.error("❌ Greška Gmail API:", data)
          alert("Neuspešno slanje Gmail-a (pogledaj konzolu)")
        }
      } catch (sendErr) {
        console.error("❌ Fetch greška:", sendErr)
        alert("Greška pri pokušaju slanja Gmail-a.")
      }

      // reset forme
      // (Recipient/Subject ostavljam da ostanu popunjeni radi bržeg slanja sledećeg)
      full_name.value = ''
      company.value = ''
      service.value = ''
      offer_text.value = ''
      tone.value = 'friendly'
      await loadMessages()
    }
  } catch (err) {
    console.error('❌ Greška u OpenAI:', err)
  } finally {
    isLoading.value = false
  }
}

/** Mount & Auth */
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
    if (newSession?.user) {
      loadMessages()
      loadUserPlan()
      checkGmailStatus()
    }
  })

  if (session.value?.user) {
    loadMessages()
    loadUserPlan()
    checkGmailStatus()
  }
})
</script>
