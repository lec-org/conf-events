<script setup lang="ts">
import { Calendar } from "@fullcalendar/core";
import type { DateClickArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { CalendarEvent, EventCategory } from "../data.ts";

const props = defineProps<{
  events: CalendarEvent[];
  categories: EventCategory[];
}>();

type EventView = "dayGridMonth" | "listMonth";

const today = new Date();
const calendarHost = ref<HTMLDivElement | null>(null);
const currentTitle = ref("");
const selectedCategory = ref<EventCategory | "All">("All");
const selectedDate = ref(toDateKey(today));
const currentView = ref<EventView>("dayGridMonth");

let calendar: Calendar | null = null;

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(input: string) {
  return new Date(`${input}T00:00:00`);
}

function formatDisplayDate(input: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(parseDate(input));
}

function eventOccursOnDate(event: CalendarEvent, dateKey: string) {
  const endDate = event.end ?? event.start;
  return dateKey >= event.start && dateKey <= endDate;
}

const filteredEvents = computed(() =>
  selectedCategory.value === "All"
    ? props.events
    : props.events.filter((event) => event.category === selectedCategory.value),
);

const selectedEvents = computed(() =>
  filteredEvents.value
    .filter((event) => eventOccursOnDate(event, selectedDate.value))
    .sort((left, right) => left.start.localeCompare(right.start)),
);

function toCalendarEvents(sourceEvents: CalendarEvent[]): EventInput[] {
  return sourceEvents.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end ? toDateKey(new Date(parseDate(event.end).getTime() + 86400000)) : undefined,
    allDay: true,
    extendedProps: {
      url: event.url,
    },
  }));
}

function syncCalendarMeta() {
  if (!calendar) {
    return;
  }

  currentTitle.value = calendar.view.title;
  currentView.value = calendar.view.type as EventView;
}

function renderCalendar() {
  if (!calendarHost.value) {
    return;
  }

  calendar?.destroy();
  calendar = new Calendar(calendarHost.value, {
    plugins: [dayGridPlugin, listPlugin],
    initialView: currentView.value,
    initialDate: selectedDate.value,
    headerToolbar: false,
    height: "auto",
    dayMaxEvents: 2,
    fixedWeekCount: true,
    events: toCalendarEvents(filteredEvents.value),
    dateClick: (info: DateClickArg) => {
      selectedDate.value = info.dateStr;
    },
    eventClick: (info: EventClickArg) => {
      info.jsEvent.preventDefault();
      selectedDate.value = info.event.startStr.slice(0, 10);
      window.open(info.event.extendedProps.url as string, "_blank", "noopener");
    },
    datesSet: () => {
      syncCalendarMeta();
    },
  });

  calendar.render();
  syncCalendarMeta();
}

function shiftMonth(step: number) {
  calendar?.incrementDate({ months: step });
  syncCalendarMeta();
}

function switchView(nextView: EventView) {
  currentView.value = nextView;
  calendar?.changeView(nextView);
  syncCalendarMeta();
}

watch(filteredEvents, (nextEvents) => {
  if (!calendar) {
    return;
  }

  calendar.removeAllEvents();
  for (const calendarEvent of toCalendarEvents(nextEvents)) {
    calendar.addEvent(calendarEvent);
  }
  syncCalendarMeta();
});

onMounted(() => {
  renderCalendar();
});

onBeforeUnmount(() => {
  calendar?.destroy();
});
</script>

<template>
  <section class="event-board">
    <div class="toolbar">
      <div class="toolbar__title">
        <p class="toolbar__eyebrow">Launch calendar</p>
        <h1>{{ currentTitle || "Loading calendar" }}</h1>
      </div>

      <div class="toolbar__actions">
        <div class="toolbar__group">
          <button class="toolbar__button" type="button" @click="shiftMonth(-1)">Prev</button>
          <button class="toolbar__button" type="button" @click="shiftMonth(1)">Next</button>
        </div>

        <div class="toolbar__group">
          <button
            class="toolbar__button"
            :class="{ active: currentView === 'dayGridMonth' }"
            type="button"
            @click="switchView('dayGridMonth')"
          >
            Month
          </button>
          <button
            class="toolbar__button"
            :class="{ active: currentView === 'listMonth' }"
            type="button"
            @click="switchView('listMonth')"
          >
            List
          </button>
        </div>

        <div class="toolbar__group toolbar__group--wrap">
          <button
            class="toolbar__button"
            :class="{ active: selectedCategory === 'All' }"
            type="button"
            @click="selectedCategory = 'All'"
          >
            All
          </button>
          <button
            v-for="category in categories"
            :key="category"
            class="toolbar__button"
            :class="{ active: selectedCategory === category }"
            type="button"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>
      </div>
    </div>

    <div class="layout">
      <div class="calendar-shell">
        <div ref="calendarHost"></div>
      </div>

      <aside class="event-panel">
        <p class="event-panel__eyebrow">Selected day</p>
        <h2>{{ formatDisplayDate(selectedDate) }}</h2>

        <div v-if="selectedEvents.length" class="event-list">
          <a
            v-for="event in selectedEvents"
            :key="event.id"
            class="event-card"
            :href="event.url"
            target="_blank"
            rel="noreferrer"
          >
            <div class="event-card__meta">
              <span class="event-card__category">{{ event.category }}</span>
              <span class="event-card__status">{{ event.status }}</span>
            </div>
            <h3>{{ event.title }}</h3>
            <p>{{ event.organizer }} · {{ event.location }}</p>
            <p>
              {{ formatDisplayDate(event.start) }}
              <template v-if="event.end"> to {{ formatDisplayDate(event.end) }}</template>
            </p>
            <p v-if="event.notes">{{ event.notes }}</p>
          </a>
        </div>

        <p v-else class="event-panel__empty">No launches or conferences on this day yet.</p>
      </aside>
    </div>
  </section>
</template>
