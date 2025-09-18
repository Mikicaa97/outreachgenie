<template>
  <header class="bg-black text-white shadow-md fixed top-0 left-0 w-full z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
      <!-- Logo -->
      <router-link to="/" class="flex items-center">
<!--        <img src="/src/assets/OutreachGenie-Logo.png" class="h-8 w-auto md:h-10" alt="Weboro Logo" />-->
        <span class="ml-3 font-bold text-lg">Weboro</span>
      </router-link>

      <!-- Desktop Menu -->
      <nav class="hidden md:flex space-x-6 text-sm">
        <router-link to="/" class="hover:text-gray-400 transition">Početna</router-link>
        <router-link to="/o-nama" class="hover:text-gray-400 transition">O nama</router-link>
        <router-link to="/usluge" class="hover:text-gray-400 transition">Usluge</router-link>
        <router-link to="/portfolio" class="hover:text-gray-400 transition">Portfolio</router-link>
        <router-link to="/kontakt" class="hover:text-gray-400 transition">Kontakt</router-link>
      </nav>

      <!-- Mobile Menu Button -->
      <button class="md:hidden focus:outline-none" @click="toggleMenu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isOpen" class="md:hidden bg-black px-4 pb-4">
      <router-link to="/" class="block py-2 border-b border-zinc-800" @click="closeMenu">Početna</router-link>
      <router-link to="/o-nama" class="block py-2 border-b border-zinc-800" @click="closeMenu">O nama</router-link>
      <router-link to="/usluge" class="block py-2 border-b border-zinc-800" @click="closeMenu">Usluge</router-link>
      <router-link to="/portfolio" class="block py-2 border-b border-zinc-800" @click="closeMenu">Portfolio</router-link>
      <router-link to="/kontakt" class="block py-2" @click="closeMenu">Kontakt</router-link>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}
</script>

<style scoped>
/* Dodaj prostor ispod headera da sadržaj ne bude prekriven */
body {
  padding-top: 4rem;
}
</style>
