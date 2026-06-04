<template>
  <div v-if="repairReport" class="mt-6">

    <p class="font-medium mb-3">Auto Repair Report</p>

    <!-- No fixes needed -->
    <div
      v-if="!repairReport.repaired"
      class="text-green-700 bg-green-100 text-sm p-3 rounded"
    >
      ✅ No repairs needed — file is already clean
    </div>

    <!-- Fixes applied -->
    <div v-else class="border border-blue-200 bg-blue-50 rounded-lg p-4">
      <p class="text-sm font-semibold text-blue-800 mb-3">
        {{ repairReport.fixesApplied.length }} fix{{ repairReport.fixesApplied.length === 1 ? '' : 'es' }} applied
      </p>
      <ul class="space-y-1.5">
        <li
          v-for="fix in repairReport.fixesApplied"
          :key="fix"
          class="flex items-center gap-2 text-sm text-blue-900"
        >
          <span class="text-green-600 font-bold shrink-0">✓</span>
          {{ fix }}
        </li>
      </ul>
    </div>

  </div>
</template>

<script setup lang="ts">
import type { RepairReport } from "../types/suggestion";

defineProps<{
  repairReport: RepairReport | null;
}>();
</script>