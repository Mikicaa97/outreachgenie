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
          <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
                @click="connectGmail"
                class="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
            >
              📧 {{ t('dash_gmail_button') }}
            </button>
            <span v-if="gmailConnected" class="text-green-400 font-semibold">
              ✅ {{t('dash_connected_gmail')}}
<!--              <span v-if="gmailEmail">({{ gmailEmail }})</span>-->
            </span>
            <span v-else class="text-yellow-400">{{t('dash_gmail_field')}}</span>
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

            <!-- Dugme za generisanje -->
            <button
                type="button"
                @click="generateEmail"
                class="w-full px-4 py-2 rounded text-white font-medium transition
                bg-[#00C786] hover:bg-[#00b277] active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :disabled="isLoading"
            >
              <span v-if="isLoading">⏳ Generating...</span>
              <span v-else>✍️{{t('generate_button')}}</span>
            </button>

            <!-- Dugme za slanje -->
            <button
                type="button"
                @click="sendEmail"
                class="w-full mt-2 px-4 py-2 rounded text-white font-medium transition
                bg-blue-600 hover:bg-blue-500 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                :disabled="!gmailConnected || !generatedMessage"
            >
              📩 {{t('send_button')}}
            </button>

            <div
                v-if="isLoading"
                class="text-center text-green-400 my-2 animate-pulse"
            >
              {{ t('dash_generating_msg') }}
            </div>
          </form>

          <UpgradeCTA v-if="reachedLimit" />

          <div
              v-if="generatedMessage"
              class="bg-gray-900 p-4 rounded border border-green-500"
          >
            <h3 class="text-green-400 mb-2 font-semibold">
              {{ t('dash_ai_title') }}
            </h3>
            <pre class="whitespace-pre-wrap text-sm">{{ generatedMessage }}</pre>
            <div class="mt-2 flex gap-3">
              <button
                  @click="copyToClipboard(generatedMessage)"
                  class="text-blue-400 hover:underline"
              >
                {{ t('dash_copy') }}
              </button>
              <button
                  @click="sendEmail"
                  class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
                  :disabled="!gmailConnected || !generatedMessage"
              >
                📩 Pošalji
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- REFINE MODAL -->
      <div
          v-if="showRefine"
          class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      >
        <div
            class="bg-gray-900 border border-gray-700 p-4 rounded w-full max-w-xl"
        >
          <h3 class="text-lg font-semibold mb-2 text-white">
            {{ t('dash_refine_title') }}
          </h3>

          <textarea
              v-model="refineBaseText"
              rows="6"
              class="w-full p-2 border border-gray-600 rounded bg-black text-white mb-3"
          ></textarea>

          <div class="grid grid-cols-2 gap-3 mb-3">
            <select
                v-model="refineTone"
                class="p-2 border border-gray-600 rounded bg-black text-white"
            >
              <option value="short">{{ t('dash_tone_short') }}</option>
              <option value="formal">{{ t('dash_tone_formal') }}</option>
              <option value="friendly">{{ t('dash_tone_friendly') }}</option>
            </select>

            <select
                v-model="refineType"
                class="p-2 border border-gray-600 rounded bg-black text-white"
            >
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
            <button
                @click="showRefine = false"
                class="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600"
            >
              {{ t('dash_cancel') }}
            </button>
            <button
                @click="saveRefinedReplace"
                class="px-3 py-1 rounded text-white"
                style="background: #00c786"
            >
              {{ t('dash_refine_replace') }}
            </button>
            <button
                @click="saveRefinedAsNew"
                class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
            >
              {{ t('dash_refine_new') }}
            </button>
          </div>
        </div>
      </div>

      <UpgradeCTA v-if="showUpgradeBanner" />

      <!-- 🔹 Sidebar za mobilnu istoriju -->
      <transition name="slide">
        <div v-if="showHistoryPanel" class="fixed inset-0 z-50 flex">
          <div
              class="flex-1 bg-black/50"
              @click="showHistoryPanel = false"
          ></div>
          <div class="w-80 bg-gray-900 h-full p-4 overflow-y-auto shadow-lg">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold">{{ t('dash_history') }}</h2>
              <button @click="showHistoryPanel = false" class="text-red-400">
                ✕
              </button>
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
      <div
          class="max-w-6xl mx-auto mt-10 bg-gray border border-gray-700 p-4 rounded"
      >
        <h2 class="text-lg font-semibold mb-3">{{ $t('feedback_title') }}</h2>

        <textarea
            v-model="feedbackMessage"
            :placeholder="$t('feedback_placeholder')"
            class="w-full p-2 border border-gray-600 rounded bg-gray-900 text-white placeholder-gray-400"
        ></textarea>

        <button
            @click="submitFeedback"
            class="mt-3 px-4 py-2 bg-[#00C786] hover:bg-[#00b277] rounded text-white font-medium"
        >
          {{ $t('feedback_button') }}
        </button>

        <p v-if="feedbackSent" class="text-green-400 mt-2">
          {{ $t('feedback_thanks') }}
        </p>
      </div>
    </div>

    <!-- 🔔 Toast Notification -->
    <transition name="fade">
      <div
          v-if="toastMessage"
          :class="[
          'fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all',
          toastType === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        ]"
      >
        {{ toastMessage }}
      </div>
    </transition>

<!--    &lt;!&ndash; Profile prikaz (ako nema session-a) &ndash;&gt;-->
<!--    <div v-if="!toastMessage">-->
<!--      <Profile :session="session" />-->
<!--    </div>-->
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

// 🔔 Toast notifikacije
const toastMessage = ref('')
const toastType = ref('success')

const openedStatus = ref({}) // { tracking_id: true }

async function loadOpenedStatus() {
  if (!session.value?.user?.id) return;
  try {
    const res = await fetch(
        `https://outreachgenie-production.up.railway.app/api/email-events/status?userId=${session.value.user.id}`
    );
    const data = await res.json();
    openedStatus.value = data.opened || {};
  } catch (e) {
    console.error("⚠️ Greška pri učitavanju open statusa:", e);
  }
}


function showToast(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => (toastMessage.value = ''), 3000)
}

/** Poruke */
const messages = ref([])

/** Gmail */
const gmailConnected = ref(false)
const gmailEmail = ref(null)

async function connectGmail() {
  if (!session.value?.user?.id) {
    showToast(t('toast_login_gmail'), 'error')
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
      showToast(t('toast_auth_url_error'), 'error')
    }
  } catch (e) {
    console.error('❌ auth-url error:', e)
    showToast(t('toast_auth_error'), 'error')
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
    showToast(t('toast_login_feedback'), 'error')
    return
  }

  if (!feedbackMessage.value.trim()) {
    showToast(t('toast_feedback_empty'), 'error')
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
    showToast(t('toast_feedback_error'), 'error')
  } else {
    feedbackMessage.value = ''
    feedbackSent.value = true
    showToast(t('toast_feedback_success'), 'success')
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
    showToast(t('toast_copy_success'), 'success')
  } catch {
    showToast(t('toast_copy_error'), 'error')
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
    showToast(t('toast_delete_error'), 'error')
  } else {
    messages.value = messages.value.filter(m => m.id !== id)
    showToast(t('toast_delete_success'), 'success')
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
  if (!session.value?.user) return showToast(t('toast_login_required'), 'error')

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
    showToast(t('toast_save_error'), 'error')
  } else {
    showToast(t('toast_save_success'), 'success')
    showRefine.value = false
    refiningMessageId.value = null
    await loadMessages()
  }
}

const saveRefinedReplace = async () => {
  if (!session.value?.user) return showToast(t('toast_login_required'), 'error')
  if (!refiningMessageId.value) return showToast(t('toast_no_message'), 'error')

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
    showToast(t('toast_update_error'), 'error')
  } else {
    messages.value = messages.value.map(m =>
        m.id === refiningMessageId.value
            ? { ...m, offer_text: aiMessage, type: refineType.value, tone: refineTone.value }
            : m
    )
    showToast(t('toast_update_success'), 'success')
    showRefine.value = false
    refiningMessageId.value = null
  }
}

/** Generisanje */
async function generateEmail() {
  if (!recipientEmail.value || !subject.value) {
    showToast(t('toast_fill_fields'), 'error')
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

    generatedMessage.value = ai?.subject && ai?.body
        ? `${ai.subject}\n\n${ai.body}`
        : (typeof ai === 'string' ? ai : t('toast_generate_error'))

    await supabase.from('outreach_messages').insert([{
      full_name: full_name.value,
      company: company.value,
      service: service.value,
      offer_text: generatedMessage.value,
      type: emailType.value,
      tone: tone.value,
      user_id: session.value.user.id,
      created_at: new Date().toISOString()
    }])
    await loadMessages()
    showToast(t('toast_generate_success'), 'success')
  } catch (err) {
    console.error("❌ Greška u AI:", err)
    showToast(t('toast_generate_error'), 'error')
  } finally {
    isLoading.value = false
  }
}

/** Slanje */
async function sendEmail() {
  if (!gmailConnected.value) {
    showToast(t('toast_connect_gmail'), 'error')
    return
  }
  if (!generatedMessage.value) {
    showToast(t('toast_generate_first'), 'error')
    return
  }

  try {
    const res = await fetch("https://outreachgenie-production.up.railway.app/api/gmail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: session.value.user.id,
        to: recipientEmail.value,
        subject: subject.value,
        body: generatedMessage.value
      })
    })

    const data = await res.json()
    if (data?.success) {
      showToast(t('toast_email_sent'), 'success')
    } else {
      console.error("❌ Greška Gmail API:", data)
      showToast(t('toast_email_error'), 'error')
    }
  } catch (e) {
    console.error("❌ Fetch greška:", e)
    showToast(t('toast_email_failed'), 'error')
  }

  await supabase
      .from("outreach_messages")
      .update({
        recipient: recipientEmail.value,
        subject: subject.value,
      })
      .eq("user_id", session.value.user.id)
      .order("created_at", { ascending: false })
      .limit(1);

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

  await loadMessages();
  await loadOpenedStatus();
})
</script>


