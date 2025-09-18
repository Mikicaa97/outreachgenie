<template>
  <!-- Scroll Progress Bar -->
  <div
      v-show="scrollProgress > 0"
      class="fixed top-0 left-0 h-1 bg-yellow-400 z-[9999] transition-all duration-200 ease-out"
      :style="{ width: scrollProgress + '%' }"
  ></div>

  <!-- Scroll to Top Button -->
  <button
      v-show="showButton"
      @click="scrollTop"
      class="fixed bottom-12 right-6 bg-purple-600 text-white px-4 py-2 rounded cursor-pointer p-3 rounded-full shadow-lg hover:bg-white hover:text-black transition z-[9999]"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  </button>

  <!-- Mobile hamburger -->
  <div class="md:hidden">
<!--    <button-->
<!--        @click="open = !open"-->
<!--        class="fixed bottom-6 right-6 bg-white text-black cursor-pointer p-3 rounded-full shadow-lg hover:bg-yellow-400 hover:text-white transition z-[9999]"-->
<!--        aria-label="Menu"-->
<!--    >-->
<!--      <span v-if="!open">↓</span>-->
<!--      <span v-else>↑</span>-->
<!--    </button>-->
  </div>

  <CookiesBanner/>

  <router-view />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CookiesBanner from "@/components/CookiesBanner.vue";

const showButton = ref(false)
const scrollProgress = ref(0)

const onScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
  showButton.value = scrollTop > 300
}

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style>

</style>
