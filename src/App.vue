<script setup lang="ts">
import EventCalendar from "./components/EventCalendar.vue";
import { eventCategories, events } from "./data.ts";
</script>

<template>
  <div class="app-shell">
    <header class="hero">
      <div class="hero__copy">
        <p class="hero__eyebrow">Hand-maintained launch tracker</p>
        <h1>AI and developer event calendar</h1>
        <p class="hero__body">
          Track conference dates, DevDay-style launches, and major platform announcements without
          waiting for an API.
        </p>
      </div>
    </header>

    <EventCalendar :events="events" :categories="eventCategories" />
  </div>
</template>
