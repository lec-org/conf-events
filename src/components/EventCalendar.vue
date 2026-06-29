<script setup lang="ts">
import { Calendar } from "@fullcalendar/core";
import type { DateClickArg, EventClickArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { CalendarEvent } from "../data.ts";

const props = defineProps<{
  events: CalendarEvent[];
}>();

const today = new Date();
const calendarHost = ref<HTMLDivElement | null>(null);
const currentTitle = ref("");
const selectedDate = ref(toDateKey(today));
const activeEvent = ref<CalendarEvent | null>(null);

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

function formatDateTimeLabel(date: string, time?: string, timezone = "UTC+8") {
  const dateLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(date));

  if (!time) {
    return `${dateLabel}, time TBA (${timezone} display default)`;
  }

  const [hourText = "09", minuteText = "00"] = time.split(":");
  const hourNumber = Number.parseInt(hourText, 10);
  const normalizedHour = ((hourNumber + 11) % 12) + 1;
  const period = hourNumber >= 12 ? "PM" : "AM";
  const hourLabel = `${normalizedHour}`.padStart(2, "0");

  return `${dateLabel}, ${hourLabel}:${minuteText} ${period} ${timezone}`;
}

function formatRangeLabel(start: string, end?: string) {
  const startDate = parseDate(start);
  const endDate = end ? parseDate(end) : null;
  const sameMonth = endDate ? startDate.getMonth() === endDate.getMonth() : true;

  if (!endDate) {
    return formatDisplayDate(start);
  }

  if (sameMonth) {
    return `${formatDisplayDate(start)} to ${endDate.getDate()}`;
  }

  return `${formatDisplayDate(start)} to ${formatDisplayDate(end)}`;
}

function formatCalendarDateRange(start: string, end?: string) {
  const startDate = parseDate(start);
  const endDate = end ? parseDate(end) : null;

  if (!endDate) {
    return formatDisplayDate(start);
  }

  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  if (sameMonth && sameYear) {
    return `${formatDisplayDate(start)} to ${endDate.getDate()}`;
  }

  return `${formatDisplayDate(start)} to ${formatDisplayDate(end)}`;
}

function eventOccursOnDate(event: CalendarEvent, dateKey: string) {
  const endDate = event.end ?? event.start;
  return dateKey >= event.start && dateKey <= endDate;
}

function openEventModal(eventId: string) {
  activeEvent.value = props.events.find((event) => event.id === eventId) ?? null;
}

function closeEventModal() {
  activeEvent.value = null;
}

const activeEventTimeRange = computed(() => {
  if (!activeEvent.value) {
    return "";
  }

  const timezone = activeEvent.value.timezone ?? "UTC+8";
  const startLabel = formatDateTimeLabel(
    activeEvent.value.start,
    activeEvent.value.startTime,
    timezone,
  );

  if (!activeEvent.value.end) {
    return startLabel;
  }

  const endLabel = formatDateTimeLabel(activeEvent.value.end, activeEvent.value.endTime, timezone);
  return `${startLabel} to ${endLabel}`;
});

const upcomingEvents = computed(() => {
  const todayKey = toDateKey(today);
  const weekAhead = new Date(today);
  weekAhead.setDate(weekAhead.getDate() + 7);
  const weekAheadKey = toDateKey(weekAhead);

  return props.events
    .filter((event) => event.start >= todayKey && event.start <= weekAheadKey)
    .sort((left, right) => left.start.localeCompare(right.start));
});

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
}

function renderCalendar() {
  if (!calendarHost.value) {
    return;
  }

  calendar?.destroy();
  calendar = new Calendar(calendarHost.value, {
    plugins: [dayGridPlugin, listPlugin],
    initialView: "dayGridMonth",
    initialDate: selectedDate.value,
    headerToolbar: false,
    height: "auto",
    dayMaxEvents: 2,
    fixedWeekCount: true,
    events: toCalendarEvents(props.events),
    dateClick: (info: DateClickArg) => {
      selectedDate.value = info.dateStr;
    },
    eventClick: (info: EventClickArg) => {
      info.jsEvent.preventDefault();
      selectedDate.value = info.event.startStr.slice(0, 10);
      openEventModal(info.event.id);
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
      <div class="toolbar__primary">
        <div class="toolbar__title">
          <div class="toolbar__meta">
            <p class="toolbar__eyebrow">Launch calendar</p>

            <div class="toolbar__group toolbar__group--calendar-nav">
              <button
                class="toolbar__button toolbar__button--nav"
                type="button"
                @click="shiftMonth(-1)"
              >
                Prev
              </button>
              <button
                class="toolbar__button toolbar__button--nav"
                type="button"
                @click="shiftMonth(1)"
              >
                Next
              </button>
            </div>
          </div>

          <h1>{{ currentTitle || "Loading calendar" }}</h1>
        </div>
      </div>
    </div>

    <div class="layout">
      <div class="calendar-shell">
        <div ref="calendarHost"></div>
      </div>

      <aside class="event-panel">
        <p class="event-panel__eyebrow">Starting in 7 days</p>
        <h2>Upcoming</h2>

        <div v-if="upcomingEvents.length" class="event-list">
          <button
            v-for="event in upcomingEvents"
            :key="event.id"
            class="event-card"
            type="button"
            @click="openEventModal(event.id)"
          >
            <div class="event-card__meta">
              <span class="event-card__category">{{ event.category }}</span>
              <span class="event-card__status">{{ event.status }}</span>
            </div>
            <h3>{{ event.title }}</h3>
            <p>{{ event.organizer }} · {{ event.location }}</p>
            <p>{{ formatRangeLabel(event.start, event.end) }}</p>
            <p v-if="event.notes">{{ event.notes }}</p>
          </button>
        </div>

        <p v-else class="event-panel__empty">
          No launches or conferences are starting in the next 7 days.
        </p>
      </aside>
    </div>

    <div v-if="activeEvent" class="event-modal-backdrop" @click.self="closeEventModal">
      <section class="event-modal" aria-modal="true" role="dialog">
        <div class="event-modal__header">
          <div>
            <p class="event-panel__eyebrow">{{ activeEvent.category }}</p>
            <h3>{{ activeEvent.title }}</h3>
          </div>
          <button
            aria-label="Close dialog"
            class="event-modal__close"
            type="button"
            @click="closeEventModal"
          >
            ×
          </button>
        </div>

        <div class="event-modal__content">
          <div class="event-modal__main">
            <p class="event-modal__lede">
              {{
                activeEvent.summary ??
                "No summary yet. Keep the official page as the source of truth."
              }}
            </p>

            <p v-if="activeEvent.notes" class="event-modal__note">{{ activeEvent.notes }}</p>

            <div v-if="activeEvent.highlights?.length" class="event-modal__section">
              <p class="event-modal__section-label">Highlights</p>
              <ul class="event-modal__list">
                <li v-for="highlight in activeEvent.highlights" :key="highlight">
                  {{ highlight }}
                </li>
              </ul>
            </div>
          </div>

          <aside class="event-modal__meta-panel">
            <div class="event-modal__section">
              <p class="event-modal__section-label">Schedule</p>
              <p>{{ activeEventTimeRange }}</p>
              <p class="event-modal__subtle">
                {{ formatCalendarDateRange(activeEvent.start, activeEvent.end) }}
              </p>
            </div>

            <div class="event-modal__section">
              <p class="event-modal__section-label">Organizer</p>
              <p>{{ activeEvent.organizer }}</p>
            </div>

            <div class="event-modal__section">
              <p class="event-modal__section-label">Location</p>
              <p>{{ activeEvent.location }}</p>
            </div>

            <div class="event-modal__section">
              <p class="event-modal__section-label">Status</p>
              <p>{{ activeEvent.status }}</p>
            </div>

            <div class="event-modal__section">
              <p class="event-modal__section-label">Tags</p>
              <div class="event-modal__tags">
                <span v-for="tag in activeEvent.tags" :key="tag" class="event-modal__tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </aside>
        </div>

        <div class="event-modal__actions">
          <button class="toolbar__button" type="button" @click="closeEventModal">Back</button>
          <a
            class="toolbar__button toolbar__button--primary"
            :href="activeEvent.url"
            target="_blank"
            rel="noreferrer"
          >
            Visit official page
          </a>
        </div>
      </section>
    </div>
  </section>
</template>
