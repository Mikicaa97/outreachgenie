<template>
  <section class="max-w-5xl mx-auto py-10 px-6 text-gray-300">
    <h1 class="text-2xl font-bold mb-6">Send Campaign</h1>

    <div class="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
      <label class="block text-sm mb-2">Select Campaign</label>
      <select v-model="selectedCampaign" class="bg-gray-800 w-full p-2 rounded mb-4">
        <option v-for="c in campaigns" :value="c.id" :key="c.id">{{ c.name }}</option>
      </select>

      <label class="block text-sm mb-2">Subject</label>
      <input v-model="subject" placeholder="Subject" class="bg-gray-800 w-full p-2 rounded mb-4" />

      <label class="block text-sm mb-2">Email Body</label>
      <textarea
          v-model="body"
          placeholder="Write your email here... Use {{first_name}} or {{last_name}}"
          class="bg-gray-800 w-full p-2 rounded h-40 mb-4"
      ></textarea>

      <button
          @click="sendCampaign"
          class="bg-purple-600 w-full py-2 rounded font-semibold hover:bg-purple-700 transition"
          :disabled="loading"
      >
        {{ loading ? 'Sending...' : 'Send Campaign' }}
      </button>

      <p v-if="successMsg" class="text-green-400 mt-3 text-center">{{ successMsg }}</p>
      <p v-if="errorMsg" class="text-red-400 mt-3 text-center">{{ errorMsg }}</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

const campaigns = ref([])
const selectedCampaign = ref('')
const subject = ref('')
const body = ref('')
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const loadCampaigns = async () => {
  const user = (await supabase.auth.getUser()).data.user
  const { data } = await supabase.from('campaigns').select('*').eq('user_id', user.id)
  campaigns.value = data || []
}

const sendCampaign = async () => {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  const user = (await supabase.auth.getUser()).data.user

  try {
    const resp = await fetch('https://outreachgenie-production.up.railway.app/api/campaigns/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        campaignId: selectedCampaign.value,
        subject: subject.value,
        body: body.value
      })
    })
    const data = await resp.json()

    if (data.success) {
      successMsg.value = 'Campaign sent successfully!'
    } else {
      throw new Error(data.error || 'Unknown error')
    }
  } catch (e) {
    errorMsg.value = 'Error sending campaign: ' + e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadCampaigns)
</script>
