<template>
  <section id="live" class="pt-32 bg-gray-100 text-gray-800 py-20 px-6">
    <div class="max-w-4xl mx-auto text-center mb-12">
      <h2 class="text-3xl sm:text-4xl font-bold mb-4">🎯 {{ t('live_title') }}</h2>
      <p class="text-lg text-gray-600">{{ t('live_subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <!-- Forma -->
      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="submitForm" class="space-y-4">
          <div>
            <label class="block text-left text-sm font-medium text-gray-700">{{ t('field_type') }}</label>
            <select v-model="emailType" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800">
              <option value="">{{ t('choose') }}</option>
              <option value="general">{{ t('type_general') }}</option>
              <option value="offer">{{ t('type_offer') }}</option>
              <option value="promo">{{ t('type_promo') }}</option>
              <option value="followup">{{ t('type_followup') }}</option>
              <option value="technical">{{ t('type_technical') }}</option>
              <option value="networking">{{ t('type_networking') }}</option>
              <option value="director">{{ t('type_director') }}</option>
              <option value="linkedin">{{ t('type_linkedin') }}</option>
              <option value="hiring">{{ t('type_hiring') }}</option>
              <option value="reminder">{{ t('type_reminder') }}</option>
              <option value="apology">{{ t('type_apology') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-left text-sm font-medium text-gray-700">{{ t('field_name') }}</label>
            <input v-model="full_name" type="text" :placeholder="t('ph_name')" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label class="block text-left text-sm font-medium text-gray-700">{{ t('field_company') }}</label>
            <input v-model="company" type="text" :placeholder="t('ph_company')" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label class="block text-left text-sm font-medium text-gray-700">{{ t('field_target') }}</label>
            <input v-model="service" :placeholder="servicePlaceholderExamples[emailType] || t('ph_target_default')" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" />
          </div>

          <div>
            <label class="block text-left text-sm font-medium text-gray-700">{{ t('field_details') }}</label>
            <textarea v-model="offer_text" :placeholder="placeholderExamples[emailType] || t('ph_details_default')" rows="4" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md"></textarea>
          </div>

          <div>
            <label class="block text-left text-sm font-medium text-gray-700">{{ t('field_tone') }}</label>
            <select v-model="tone" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800">
              <option value="short">{{ t('tone_short') }}</option>
              <option value="formal">{{ t('tone_formal') }}</option>
              <option value="friendly">{{ t('tone_friendly') }}</option>
            </select>
          </div>

          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="addParagraphs" />
            <span>{{ t('field_paragraphs') }}</span>
          </label>

          <button type="submit" class="bg-black text-white font-bold px-6 py-2 rounded hover:bg-gray-800 transition w-full">
            {{ isLoading ? t('loading') : t('generate_button') }}
          </button>

          <div v-if="isLoading" class="text-center text-green-600 my-2 animate-pulse">✨ {{ t('loading_message') }}</div>

          <p v-if="alreadyGenerated" class="text-red-600 text-sm text-center">
            {{ t('limit_reached') }}
          </p>
        </form>
      </div>

      <!-- Prikaz poruke -->
      <div v-if="generatedMessage"
           class="bg-white text-black p-4 rounded border border-green-500 overflow-y-auto max-h-80">
        <h3 class="text-green-400 mb-2 font-semibold">{{ t('ai_message_title') }}</h3>
        <pre class="whitespace-pre-wrap text-sm break-words">{{ generatedMessage }}</pre>
        <div class="mt-2 flex gap-3">
          <button @click="copyToClipboard(generatedMessage)" class="text-blue-400 hover:underline">📋 {{ t('copy') }}</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emailType = ref('')
const full_name = ref('')
const company = ref('')
const service = ref('')
const offer_text = ref('')
const tone = ref('short')
const addParagraphs = ref(false)
const isLoading = ref(false)
const generatedMessage = ref('')
const alreadyGenerated = ref(false)

const placeholderExamples = {
  general: t('ph_general'),
  director: t('ph_director'),
}
const servicePlaceholderExamples = {
  general: t('ph_service_general'),
}

onMounted(() => {
  alreadyGenerated.value = localStorage.getItem("liveDemoUsed") === "true"
})

const submitForm = async () => {
  if (alreadyGenerated.value) {
    alert(t('limit_alert'))
    return
  }

  isLoading.value = true
  generatedMessage.value = ''

  try {
    const res = await fetch('/api/generate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailType: emailType.value,
        full_name: full_name.value,
        company: company.value,
        service: service.value,
        offer_text: offer_text.value,
        tone: tone.value,
        addParagraphs: addParagraphs.value,
      }),
    })

    const data = await res.json()
    generatedMessage.value = data.message

    localStorage.setItem("liveDemoUsed", "true")
    alreadyGenerated.value = true
  } catch (e) {
    generatedMessage.value = t('error_message')
  } finally {
    isLoading.value = false
  }
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}
</script>
