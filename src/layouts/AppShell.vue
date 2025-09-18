<template>
  <div class="bg-black text-white min-h-screen">
    <HeaderBar @nav="(v) => currentView = v" />

    <!-- LOADING SPINNER dok se session učitava -->
    <div v-if="session === null" class="flex items-center justify-center h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-white"></div>
    </div>

    <!-- Kada session postoji, prikazuj rute -->
    <router-view v-else :session="session" />
  </div>
</template>


<script setup>
import {ref, onMounted} from 'vue'
import {useRouter} from 'vue-router'
import {supabase} from '@/lib/supabaseClient'
import HeaderBar from "@/components/HeaderBar.vue";

const router = useRouter()
const session = ref(null)

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

// ⬇️ Učitaj sesiju kad se komponenta montira
onMounted(async () => {
  const {data} = await supabase.auth.getSession()
  session.value = data.session
})
</script>
