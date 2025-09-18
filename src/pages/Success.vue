<!-- src/pages/Success.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-black text-white text-center p-6">
    <div>
      <h1 class="text-3xl font-bold mb-4 text-green-400">Uspešna pretplata!</h1>
      <p class="text-lg mb-4">Tvoja pretplata je uspešno aktivirana.</p>
      <router-link to="/dashboard" class="text-blue-400 underline">
        Idi na Dashboard →
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Ovde možeš dodati refetch logiku ako želiš da odmah povučeš novi plan

import { onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  // REFRESH session da povuče nov plan iz Supabase-a
  await supabase.auth.refreshSession()

  // Možeš odmah da preusmeriš na dashboard
  router.push('/dashboard')
})

</script>
