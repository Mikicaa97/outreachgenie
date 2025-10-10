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
                {{ c.status }}
              </span>
          </td>
          <td class="py-2 px-4 text-gray-400 text-sm">
            {{ new Date(c.created_at).toLocaleString() }}
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

const campaigns = ref([])
const name = ref('')
const description = ref('')

const loadCampaigns = async () => {
  const user = (await supabase.auth.getUser()).data.user
  const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  campaigns.value = data || []
}

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

onMounted(loadCampaigns)
</script>
