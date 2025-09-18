<template>
  <section class="relative h-screen bg-[#0d0b0a] overflow-hidden">
    <canvas ref="canvas" class="absolute inset-0 w-full h-full block"></canvas>
    <!-- Sadržaj -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
      <!-- Naziv brenda -->
      <h1 class="text-6xl md:text-5xl font-extrabold tracking-[0.25em] uppercase mb-2">
        Weboro
      </h1>
      <p class="text-xl md:text-2xl text-yellow-400 mb-10 tracking-widest uppercase">
        Smart Digital Solutions
      </p>

      <!-- Glavni naslov / slogan -->
      <h2 class="text-4xl md:text-4xl font-bold max-w-4xl leading-tight mb-6">
        Transformišemo ideje u <span class="text-yellow-400">digitalne proizvode</span>
      </h2>

      <!-- Podnaslov -->
      <p class="text-lg md:text-xl max-w-2xl text-gray-300 mb-10">
        SaaS platforme, eCommerce sistemi, branding, video produkcija i growth strategije —
        sve što ti treba da tvoj biznis postane globalan.
      </p>

      <!-- CTA dugmad -->
      <div class="flex flex-col sm:flex-row gap-4">
        <button
            class="px-8 py-4 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-300 transition">
          Započni projekat
        </button>
        <button
            class="px-8 py-4 border border-gray-600 text-gray-200 rounded-xl hover:border-yellow-400 hover:text-yellow-400 transition">
          Pogledaj portfolio
        </button>
      </div>
    </div>
  </section>
</template>


<script setup>
import {onMounted, onBeforeUnmount, ref} from 'vue'

const canvas = ref(null)
let ctx, ro, animId
const lines = []

function spawnLine() {
  const el = canvas.value
  const w = el.clientWidth
  const h = el.clientHeight
  const side = Math.floor(Math.random() * 4)
  let x, y

  if (side === 0) {
    x = Math.random() * w;
    y = 0
  }
  if (side === 1) {
    x = w;
    y = Math.random() * h
  }
  if (side === 2) {
    x = Math.random() * w;
    y = h
  }
  if (side === 3) {
    x = 0;
    y = Math.random() * h
  }

  const angle = Math.atan2(h / 2 - y, w / 2 - x) + (Math.random() * 0.8 - 0.4)
  const speed = 20 + Math.random() * 40
  const length = 50 + Math.random() * 100

  lines.push({x, y, angle, speed, length, life: 1})
}

onMounted(() => {
  const el = canvas.value
  ctx = el.getContext('2d', {alpha: true})

  function resize() {
    const {clientWidth: w, clientHeight: h} = el
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    el.width = w * dpr
    el.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  ro = new ResizeObserver(resize)
  ro.observe(el)

  // odmah napravi 15 početnih linija da se odmah vidi efekat
  for (let i = 0; i < 15; i++) spawnLine()

  let last = performance.now()
  let spawnTimer = 0

  function draw() {
    const now = performance.now()
    const dt = (now - last) / 1000
    last = now
    spawnTimer += dt

    const w = el.clientWidth
    const h = el.clientHeight

    // očisti ekran (normalni mod)
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(13,11,10,0.25)' // blagi fade crne pozadine
    ctx.fillRect(0, 0, w, h)

    // sad pređi na blend za linije
    ctx.globalCompositeOperation = 'lighter'
    ctx.lineCap = 'round'

    if (spawnTimer > 0.2) {
      spawnLine()
      spawnTimer = 0
    }

    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i]
      l.x += Math.cos(l.angle) * l.speed * dt
      l.y += Math.sin(l.angle) * l.speed * dt
      l.life -= dt * 0.25

      if (l.life <= 0) {
        lines.splice(i, 1)
        continue
      }

      ctx.strokeStyle = `rgba(255,215,0,${0.2 * l.life})`
      ctx.lineWidth = 1.2
      ctx.shadowColor = `rgba(255,200,80,${0.3 * l.life})`
      ctx.shadowBlur = 15

      const dx = Math.cos(l.angle) * l.length
      const dy = Math.sin(l.angle) * l.length

      ctx.beginPath()
      ctx.moveTo(l.x, l.y)
      ctx.lineTo(l.x - dx, l.y - dy)
      ctx.stroke()
    }

    ctx.shadowBlur = 0

    animId = requestAnimationFrame(draw)
  }


  resize()
  animId = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  cancelAnimationFrame(animId)
})
</script>
