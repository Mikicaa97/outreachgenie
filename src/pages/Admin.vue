<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Sidebar -->
    <div class="w-full md:w-1/4 p-4 border-r bg-gray-50">
      <h2 class="text-lg font-semibold mb-2">Korisnici</h2>
      <ul>
        <li
            v-for="user in users"
            :key="user.id"
            @click="selectUser(user)"
            class="cursor-pointer px-2 py-1 rounded hover:bg-gray-200"
            :class="{ 'bg-blue-100 font-semibold': selectedUser?.id === user.id }"
        >
          {{ user.email || '(nema email)' }}
        </li>
      </ul>

      <h2 class="text-lg font-semibold mb-2 mt-6">Admin akcije</h2>
      <div v-if="selectedUser">
        <p class="text-sm mb-1">Korisnik: {{ selectedUser.email || '(nema email)' }}</p>
        <select v-model="selectedUserPlan" class="w-full mb-2 p-2 border rounded">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="agency">Agency</option>
        </select>
        <button @click="updateUserPlan" class="text-sm px-3 py-2 bg-green-600 text-white rounded w-full">
          Ažuriraj plan
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="w-full md:w-3/4 p-4 bg-white">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Admin Panel</h1>
        <router-link to="/" class="text-blue-600 hover:underline">↩ Nazad u program</router-link>
      </div>

      <!-- Poruke korisnika -->
      <div v-if="selectedUser">
        <h2 class="text-xl font-semibold mb-3">Poruke korisnika</h2>
        <div v-if="loading">Učitavanje poruka...</div>
        <div v-else-if="messages.length === 0">Nema poruka za ovog korisnika.</div>
        <div v-else>
          <div
              v-for="msg in messages"
              :key="msg.id"
              class="border p-4 mb-4 rounded bg-gray-50 shadow-sm"
          >
            <p><strong>Ime:</strong> {{ msg.full_name }}</p>
            <p><strong>Kompanija:</strong> {{ msg.company }}</p>
            <p><strong>Kome je namenjena:</strong> {{ msg.service }}</p>
            <p><strong>Tip mejla:</strong> {{ msg.emailType || '-' }}</p>
            <p><strong>Ton:</strong> {{ msg.tone || '-' }}</p>
            <p><strong>Poruka:</strong> {{ msg.offer_text }}</p>
            <p class="text-sm text-gray-500">Kreirano: {{ new Date(msg.created_at).toLocaleString() }}</p>
            <button @click="deleteMessage(msg.id)" class="mt-2 text-red-500">Obriši</button>
          </div>
        </div>
      </div>

      <!-- ✅ Svi komentari svih korisnika -->
      <div class="mt-8">
        <h2 class="text-xl font-semibold mb-3">Svi komentari korisnika</h2>
        <div v-if="allFeedbacks.length === 0" class="text-gray-500">
          Nema komentara.
        </div>
        <div v-else>
          <div
              v-for="fb in allFeedbacks"
              :key="fb.id"
              class="border p-4 mb-4 rounded bg-gray-50 shadow-sm"
          >
            <p><strong>{{ fb.first_name }} {{ fb.last_name }}</strong></p>
            <p>Komentar: {{ fb.message }}</p>
            <p class="text-sm text-gray-500">
              Kreirano: {{ new Date(fb.created_at).toLocaleString() }}
            </p>
          </div>

        </div>
      </div>

      <div v-if="!selectedUser">
        <p class="text-gray-600 mt-6">Odaberi korisnika sa leve strane da vidiš njegove poruke.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

const users = ref([])
const selectedUser = ref(null)
const selectedUserPlan = ref('')
const messages = ref([])
const loading = ref(false)

const allFeedbacks = ref([])

/** ✅ Povuci sve komentare sa vezanim emailom iz user_profiles */
const fetchAllFeedbacks = async () => {
  const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Greška pri dohvatanju komentara:', error.message)
  } else {
    allFeedbacks.value = data
  }
}


const fetchUsers = async () => {
  const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Greška pri dohvatanju korisnika:', error.message)
  } else {
    users.value = data
  }
}

const fetchMessagesForUser = async (userId) => {
  if (!userId) return
  loading.value = true
  messages.value = []

  const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

  if (!error) {
    messages.value = data
  } else {
    console.error('❌ Greška pri dohvatanju poruka:', error.message)
  }

  loading.value = false
}

const selectUser = (user) => {
  selectedUser.value = user
  selectedUserPlan.value = user.plan || 'free'
  fetchMessagesForUser(user.id)
}

const updateUserPlan = async () => {
  if (!selectedUser.value) return
  const { error } = await supabase
      .from('user_profiles')
      .update({ plan: selectedUserPlan.value })
      .eq('id', selectedUser.value.id)

  if (error) {
    console.error('❌ Greška pri menjanju plana:', error.message)
  } else {
    alert(`✅ Plan ažuriran na "${selectedUserPlan.value}"`)
    fetchUsers()
  }
}

const deleteMessage = async (messageId) => {
  const { error } = await supabase
      .from('outreach_messages')
      .delete()
      .eq('id', messageId)

  if (error) {
    console.error('❌ Greška pri brisanju poruke:', error.message)
  } else {
    messages.value = messages.value.filter(m => m.id !== messageId)
  }
}

onMounted(() => {
  fetchUsers()
  fetchAllFeedbacks()
})
</script>

<style scoped>
@media (max-width: 768px) {
  .flex-col > div {
    width: 100% !important;
  }
}
</style>
