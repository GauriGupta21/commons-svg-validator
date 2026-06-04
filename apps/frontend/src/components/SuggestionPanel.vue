<template>
  <div v-if="suggestions.length" class="mt-6">

    <!-- Section header -->
    <p class="font-medium mb-3">Smart Fix Suggestions</p>

    <div class="space-y-3">
      <div
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="rounded-lg border p-4 flex gap-3"
        :class="cardClass(suggestion.priority)"
      >
        <!-- Priority icon -->
        <div class="shrink-0 mt-0.5">
          <span class="text-base leading-none" :title="suggestion.priority">
            {{ priorityIcon(suggestion.priority) }}
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-sm font-semibold leading-snug">
              {{ suggestion.title }}
            </p>
            <span
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              :class="badgeClass(suggestion.priority)"
            >
              {{ suggestion.priority }}
            </span>
          </div>
          <p class="text-sm mt-1 leading-relaxed opacity-85">
            {{ suggestion.description }}
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { Suggestion, SuggestionPriority } from "../types/suggestion";

defineProps<{
  suggestions: Suggestion[];
}>();

function priorityIcon(priority: SuggestionPriority): string {
  const map: Record<SuggestionPriority, string> = {
    high:   "🔴",
    medium: "🟡",
    low:    "🟢",
  };
  return map[priority];
}

function cardClass(priority: SuggestionPriority): string {
  const map: Record<SuggestionPriority, string> = {
    high:   "bg-red-50 border-red-200 text-red-900",
    medium: "bg-yellow-50 border-yellow-200 text-yellow-900",
    low:    "bg-green-50 border-green-200 text-green-900",
  };
  return map[priority];
}

function badgeClass(priority: SuggestionPriority): string {
  const map: Record<SuggestionPriority, string> = {
    high:   "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low:    "bg-green-100 text-green-700",
  };
  return map[priority];
}
</script>