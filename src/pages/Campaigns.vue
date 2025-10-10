<template>
  <section class="max-w-6xl mx-auto py-10 px-6 text-gray-300">
    <h1 class="text-2xl font-bold mb-6">Campaigns</h1>

    <!-- Forma za dodavanje kampanje -->
    <form @submit.prevent="addCampaign" class="flex flex-wrap gap-3 mb-6">
      <input
          v-model="name"
          placeholder="Campaign name"
          class="bg-gray-800 p-2 rounded flex-1 min-w-[200px]"
      />
      <input
          v-model="description"
          placeholder="Description"
          class="bg-gray-800 p-2 rounded flex-1 min-w-[200px]"
      />
      <button class="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">
        Add
      </button>
    </form>

    <!-- Lista kampanja -->
    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-700 rounded">
        <thead class="bg-gray-800 text-gray-400">
        <tr>
          <th class="py-3 px-4 text-left">Name</th>
          <th class="py-3 px-4 text-left">Description</th>
          <th class="py-3 px-4 text-left">Status</th>
          <th class="py-3 px-4 text-left">Created</th>
          <th class="py-3 px-4 text-center">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="c in campaigns"
            :key="c.id"
            class="border-t border-gray-700 hover:bg-gray-800 transition"
        >
          <td class="py-2 px-4 font-semibold">{{ c.name }}</td>
          <td class="py-2 px-4">{{ c.description || '—' }}</td>
          <td class="py-2 px-4 capitalize">
              <span
                  :class="{
                  'text-yellow-400': c.status === 'draft',
                  'text-green-400': c.status === 'active',
                  'text-gray-400': c.status === 'completed'
                }"
              >
                {{ c.status || 'draft' }}
              </span>
          </td>
          <td class="py-2 px-4 text-gray-400 text-sm">
            {{ new Date(c.created_at).toLocaleString() }}
          </td>
          <td class="py-2 px-4 text-center">
            <button
                @click="sendCampaign(c)"
                class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              🚀 Send
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Poruke -->
    <p v-if="successMsg" class="text-green-400 mt-4">{{ successMsg }}</p>
    <p v-if="errorMsg" class="text-red-400 mt-4">{{ errorMsg }}</p>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

const campaigns = ref([])
const name = ref('')
const description = ref('')
const successMsg = ref('')
const errorMsg = ref('')

// učitaj sve kampanje
const loadCampaigns = async () => {
  const user = (await supabase.auth.getUser()).data.user
  const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  campaigns.value = data || []
}

// dodaj kampanju
const addCampaign = async () => {
  const user = (await supabase.auth.getUser()).data.user
  await supabase.from('campaigns').insert([
    {
      user_id: user.id,
      name: name.value,
      description: description.value
    }
  ])
  await loadCampaigns()
  name.value = ''
  description.value = ''
}

// pošalji kampanju kroz backend API
const sendCampaign = async (campaign) => {
  const user = (await supabase.auth.getUser()).data.user

  try {
    const resp = await fetch(
        'https://outreachgenie-production.up.railway.app/api/campaigns/send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            userId: user.id,
            subject: `Follow-up: ${campaign.name}`,
            body: campaign.description || 'Hello, this is your outreach campaign!'
          })
        }
    )

    if (!resp.ok) throw new Error(`API error: ${resp.status}`)
    const data = await resp.json()
    if (data.success) {
      successMsg.value = `✅ Campaign "${campaign.name}" successfully sent!`
    } else {
      throw new Error(data.error || 'Failed to send campaign.')
    }
  } catch (e) {
    console.error('❌ Error sending campaign:', e)
    errorMsg.value = 'Error sending campaign. Check server logs.'
  }
}

onMounted(loadCampaigns)
</script>
