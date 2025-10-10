<template>
  <section class="max-w-6xl mx-auto py-10 px-6 text-gray-300">
    <h1 class="text-2xl font-bold mb-6">Contacts</h1>

    <form @submit.prevent="addContact" class="flex flex-wrap gap-3 mb-6">
      <input v-model="first_name" placeholder="First name" class="bg-gray-800 p-2 rounded" />
      <input v-model="last_name" placeholder="Last name" class="bg-gray-800 p-2 rounded" />
      <input v-model="email" placeholder="Email" class="bg-gray-800 p-2 rounded" />
      <input v-model="company" placeholder="Company" class="bg-gray-800 p-2 rounded" />
      <button class="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700">Add</button>
    </form>

    <div class="overflow-x-auto">
      <table class="min-w-full border border-gray-700 rounded">
        <thead class="bg-gray-800 text-gray-400">
        <tr>
          <th class="py-3 px-4 text-left">Name</th>
          <th class="py-3 px-4 text-left">Email</th>
          <th class="py-3 px-4 text-left">Company</th>
          <th class="py-3 px-4 text-left">Tags</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="c in contacts" :key="c.id" class="border-t border-gray-700 hover:bg-gray-800">
          <td class="py-2 px-4">{{ c.first_name }} {{ c.last_name }}</td>
          <td class="py-2 px-4">{{ c.email }}</td>
          <td class="py-2 px-4">{{ c.company }}</td>
          <td class="py-2 px-4">{{ c.tags?.join(', ') || '-' }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase.js'

const contacts = ref([])
const first_name = ref('')
const last_name = ref('')
const email = ref('')
const company = ref('')

const loadContacts = async () => {
  const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user.id)
  contacts.value = data || []
}

const addContact = async () => {
  const user = (await supabase.auth.getUser()).data.user
  await supabase.from('contacts').insert([
    {
      user_id: user.id,
      first_name: first_name.value,
      last_name: last_name.value,
      email: email.value,
      company: company.value,
    },
  ])
  await loadContacts()
  first_name.value = last_name.value = email.value = company.value = ''
}

onMounted(loadContacts)
</script>
