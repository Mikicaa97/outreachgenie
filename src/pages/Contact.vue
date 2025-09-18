<template>
  <HeaderLanding/>
  <div class="min-h-screen bg-black text-white pt-28 px-6 py-16">
    <div class="max-w-3xl mx-auto bg-gray-900 rounded-lg shadow-lg p-8">
      <h1 class="text-3xl font-bold mb-8 text-center">{{ t('contact_title') }}</h1>

      <form @submit.prevent="submitForm" class="space-y-6">
        <!-- Ime i prezime -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('contact_name_label') }}</label>
          <input
              v-model="name"
              type="text"
              :placeholder="t('contact_placeholder_name')"
              class="w-full p-3 rounded bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('contact_email_label') }}</label>
          <input
              v-model="email"
              type="email"
              :placeholder="t('contact_placeholder_email')"
              class="w-full p-3 rounded bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <!-- Poruka -->
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('contact_message_label') }}</label>
          <textarea
              v-model="message"
              rows="5"
              :placeholder="t('contact_placeholder_message')"
              class="w-full p-3 rounded bg-black border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          ></textarea>
        </div>

        <!-- Dugme -->
        <button
            type="submit"
            class="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold transition"
        >
          {{ t('contact_send') }}
        </button>
      </form>

      <!-- Status -->
      <p v-if="status" class="text-center mt-6 text-sm" :class="statusColor">{{ status }}</p>
    </div>
  </div>
  <Footer/>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import HeaderLanding from "@/components/HeaderLanding.vue";
import Footer from "@/components/Footer.vue";

const { t } = useI18n()

const name = ref('')
const email = ref('')
const message = ref('')
const status = ref('')
const statusColor = ref('text-green-400')

const submitForm = () => {
  if (!name.value || !email.value || !message.value) {
    status.value = t('contact_error')
    statusColor.value = 'text-red-400'
    return
  }

  // Ovde može ići tvoj backend/EmailJS/Airtable poziv
  console.log({ name: name.value, email: email.value, message: message.value })

  status.value = t('contact_success')
  statusColor.value = 'text-green-400'

  name.value = ''
  email.value = ''
  message.value = ''
}
</script>
