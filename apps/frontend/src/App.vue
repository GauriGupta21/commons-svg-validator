<template>
  <main class="app-shell">

    <!-- ── Top Bar ─────────────────────────────────────────────────────────── -->
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <span class="brand-icon">⬡</span>
          <div>
            <p class="brand-title">Commons SVG Validator</p>
            <p class="brand-sub">Wikimedia Commons · Media Quality Engine</p>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-badges">
            <span class="badge-pill">SVG</span>
            <span class="badge-pill">PNG</span>
            <span class="badge-pill">GIF</span>
          </div>
          <button v-if="results.length" class="reset-btn" @click="resetAll">
            + New Batch
          </button>
        </div>
      </div>
    </header>

    <!-- ── Upload View (no results) ────────────────────────────────────────── -->
    <div v-if="!results.length" class="upload-view">
      <div class="dropzone" :class="{ 'dropzone--active': isDragging }" @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="triggerInput">
        <input ref="fileInput" type="file" accept=".svg,.png,.gif" multiple class="hidden-input"
          @change="handleFiles" />

        <div v-if="!uploading" class="dropzone-idle">
          <div class="drop-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="1" y="1" width="38" height="38" rx="4" stroke="currentColor" stroke-width="1.5"
                stroke-dasharray="4 3" />
              <path d="M20 26V14M20 14L15 19M20 14L25 19" stroke="currentColor" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <p class="drop-title">Drop files to validate</p>
          <p class="drop-sub">SVG · PNG · GIF &nbsp;·&nbsp; Multiple files supported</p>
          <button class="drop-btn">Browse Files</button>
        </div>

        <div v-if="uploading" class="dropzone-loading">
          <div class="loader-ring">
            <svg class="spin" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" stroke="#e2e8f0" stroke-width="3" fill="none" />
              <circle cx="24" cy="24" r="20" stroke="#0f172a" stroke-width="3" fill="none" stroke-dasharray="60 66"
                stroke-linecap="round" />
            </svg>
          </div>
          <p class="loading-label">Analyzing <span class="loading-count">{{ processingIndex }} / {{ totalFiles }}</span>
          </p>
          <p class="loading-file">{{ currentFilename }}</p>
        </div>
      </div>
    </div>

    <!-- ── Results View (split pane) ───────────────────────────────────────── -->
    <div v-if="results.length" class="results-view">

      <!-- LEFT: File List Sidebar -->
      <aside class="file-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">Files</span>
          <span class="sidebar-count">{{ results.length }}</span>
        </div>

        <!-- Summary bar -->
        <div class="summary-bar">
          <div class="summary-stat summary-stat--good">
            <span class="summary-num">{{results.filter(r => !r._error && scoreGrade(r.compatibility?.score) ===
              'good').length }}</span>
            <span class="summary-lbl">Ready</span>
          </div>
          <div class="summary-stat summary-stat--warn">
            <span class="summary-num">{{results.filter(r => !r._error && scoreGrade(r.compatibility?.score) ===
              'warn').length }}</span>
            <span class="summary-lbl">Warning</span>
          </div>
          <div class="summary-stat summary-stat--bad">
            <span class="summary-num">{{results.filter(r => !r._error && scoreGrade(r.compatibility?.score) ===
              'bad').length }}</span>
            <span class="summary-lbl">Error</span>
          </div>
          <div v-if="results.filter(r => r._error).length" class="summary-stat summary-stat--err">
            <span class="summary-num">{{results.filter(r => r._error).length}}</span>
            <span class="summary-lbl">Failed</span>
          </div>
        </div>

        <!-- File rows -->
        <div class="file-list">
          <button v-for="(item, idx) in results" :key="idx" class="file-row" :class="{
            'file-row--active': selectedIdx === idx,
            'file-row--error': item._error,
            [`file-row--${scoreGrade(item.compatibility?.score)}`]: !item._error,
          }" @click="selectedIdx = idx">
            <span class="file-row-dot"
              :class="item._error ? 'dot--err' : `dot--${scoreGrade(item.compatibility?.score)}`"></span>
            <span class="file-row-name">{{ shortName(item) }}</span>
            <span class="file-row-score">
              {{ item._error ? '!' : (item.compatibility?.score ?? '—') }}
            </span>
          </button>
        </div>

        <!-- Add more files -->
        <div class="sidebar-footer">
          <button class="add-more-btn" @click="triggerInput">
            <input ref="fileInput" type="file" accept=".svg,.png,.gif" multiple class="hidden-input"
              @change="handleFiles" />
            + Add More Files
          </button>
        </div>
      </aside>

      <!-- RIGHT: Detail Panel -->
      <main class="detail-panel" v-if="selected">

        <!-- Error state -->
        <div v-if="selected._error" class="detail-error">
          <div class="error-icon-big">✕</div>
          <p class="detail-error-file">{{ selected.filename }}</p>
          <p class="detail-error-msg">{{ selected._errorMessage }}</p>
        </div>

        <!-- Normal detail -->
        <div v-else>

          <!-- Detail Header -->
          <div class="detail-header">
            <div class="detail-header-left">
              <span class="file-type-badge">{{ selected.type?.toUpperCase() }}</span>
              <p class="detail-filename">{{ cleanFilename(selected) }}</p>
            </div>
            <div class="detail-header-right">
              <div class="score-ring" :class="`score-ring--${scoreGrade(selected.compatibility?.score)}`">
                <span class="score-number">{{ selected.compatibility?.score ?? '—' }}</span>
                <span class="score-denom">/100</span>
              </div>
            </div>
          </div>

          <!-- Score Bar -->
          <div class="score-bar-track">
            <div class="score-bar-fill" :class="`score-bar-fill--${scoreGrade(selected.compatibility?.score)}`"
              :style="{ width: (selected.compatibility?.score ?? 0) + '%' }" />
          </div>

          <!-- Meta Row -->
          <div class="meta-row">
            <span v-if="selected.commonsStatus" class="status-chip"
              :class="`status-chip--${selected.commonsStatus.color}`">
              {{ selected.commonsStatus.color === 'green' ? '✓' : selected.commonsStatus.color === 'yellow' ? '!' : '✕'
              }}
              {{ selected.commonsStatus.status }}
            </span>
            <span class="meta-size">Original: {{ formatBytes(selected.originalSize) }}</span>
            <span v-if="selected.sanitizedSize" class="meta-size">Sanitized: {{ formatBytes(selected.sanitizedSize)
              }}</span>
            <span v-if="selected.repairedSize" class="meta-size">Repaired: {{ formatBytes(selected.repairedSize)
              }}</span>
          </div>

          <!-- Sections -->
          <div class="sections">

            <!-- Validation Issues -->
            <details class="section" open>
              <summary class="section-title">
                <span>Validation Issues</span>
                <span class="issue-count"
                  :class="selected.validation?.issues?.length ? 'issue-count--has' : 'issue-count--none'">
                  {{ selected.validation?.issues?.length ?? 0 }}
                </span>
              </summary>
              <div class="section-body">
                <div v-if="!selected.validation?.issues?.length" class="no-issues">✓ No issues detected</div>
                <div v-for="(issues, category) in getGroupedIssues(selected)" :key="category" class="issue-group">
                  <div class="issue-category-label">
                    <span class="cat-icon">{{ categoryIcon(category) }}</span>
                    <span class="cat-name">{{ category }}</span>
                    <span class="cat-count">{{ issues.length }}</span>
                  </div>
                  <div v-for="issue in issues" :key="issue.message" class="issue-row"
                    :class="`issue-row--${issue.severity}`">
                    <span class="issue-sev">{{ issue.severity === 'error' ? '✕' : issue.severity === 'warning' ? '!' :
                      'i' }}</span>
                    <span class="issue-msg">{{ issue.message }}</span>
                  </div>
                </div>
              </div>
            </details>

            <!-- Smart Suggestions -->
            <details v-if="selected.validation?.suggestions?.length" class="section">
              <summary class="section-title">
                <span>Smart Fix Suggestions</span>
                <span class="issue-count issue-count--suggest">{{ selected.validation.suggestions.length }}</span>
              </summary>
              <div class="section-body">
                <div v-for="s in selected.validation.suggestions" :key="s.title" class="suggestion-row"
                  :class="`suggestion-row--${s.priority}`">
                  <div class="suggestion-header">
                    <span class="sug-dot" :class="`sug-dot--${s.priority}`"></span>
                    <span class="sug-title">{{ s.title }}</span>
                    <span class="sug-priority">{{ s.priority }}</span>
                  </div>
                  <p class="sug-desc">{{ s.description }}</p>
                </div>
              </div>
            </details>

            <!-- Auto Repair Report -->
            <details v-if="selected.type === 'svg' && selected.repairReport" class="section">
              <summary class="section-title">
                <span>Auto Repair Report</span>
                <span class="issue-count"
                  :class="selected.repairReport.repaired ? 'issue-count--has' : 'issue-count--none'">
                  {{ selected.repairReport.fixesApplied?.length ?? 0 }} fixes
                </span>
              </summary>
              <div class="section-body">
                <div v-if="!selected.repairReport.repaired" class="no-issues">✓ No repairs needed</div>
                <div v-else class="repair-list">
                  <div v-for="fix in selected.repairReport.fixesApplied" :key="fix" class="repair-row">
                    <span class="repair-check">✓</span><span>{{ fix }}</span>
                  </div>
                </div>
              </div>
            </details>

            <!-- Sanitization Report -->
            <details v-if="selected.report" class="section">
              <summary class="section-title">Sanitization Report</summary>
              <div class="section-body">
                <div class="kv-grid">
                  <div class="kv-row"><span class="kv-key">Removed Scripts</span><span class="kv-val"
                      :class="selected.report.removedScripts ? 'kv-val--yes' : ''">{{ selected.report.removedScripts ?
                      'Yes':'No' }}</span></div>
                  <div class="kv-row"><span class="kv-key">Removed foreignObject</span><span class="kv-val"
                      :class="selected.report.removedForeignObjects ? 'kv-val--yes' : ''">{{
                        selected.report.removedForeignObjects ? 'Yes':'No' }}</span></div>
                  <div class="kv-row"><span class="kv-key">Removed Metadata</span><span class="kv-val"
                      :class="selected.report.removedMetadata ? 'kv-val--yes' : ''">{{ selected.report.removedMetadata ?
                      'Yes':'No' }}</span></div>
                  <div class="kv-row"><span class="kv-key">Size Reduction</span><span class="kv-val">{{
                    selected.report.reductionPercent }}%</span></div>
                </div>
              </div>
            </details>

            <!-- Optimization Report -->
            <details v-if="selected.optimizationReport" class="section">
              <summary class="section-title">Optimization Report</summary>
              <div class="section-body">
                <div class="kv-grid">
                  <div class="kv-row"><span class="kv-key">Paths</span><span class="kv-val">{{
                    selected.optimizationReport.pathCount }}</span></div>
                  <div class="kv-row"><span class="kv-key">Groups</span><span class="kv-val">{{
                    selected.optimizationReport.groupCount }}</span></div>
                  <div class="kv-row"><span class="kv-key">Images</span><span class="kv-val">{{
                    selected.optimizationReport.imageCount }}</span></div>
                  <div class="kv-row"><span class="kv-key">Text Elements</span><span class="kv-val">{{
                    selected.optimizationReport.textCount }}</span></div>
                  <div class="kv-row"><span class="kv-key">Definitions</span><span class="kv-val">{{
                    selected.optimizationReport.defsCount }}</span></div>
                  <div class="kv-row"><span class="kv-key">Metadata Present</span><span class="kv-val">{{
                    selected.optimizationReport.metadataPresent ? 'Yes':'No' }}</span></div>
                  <div class="kv-row"><span class="kv-key">Est. Optimization</span><span
                      class="kv-val kv-val--accent">{{ selected.optimizationReport.estimatedOptimizationPercent
                      }}%</span></div>
                </div>
              </div>
            </details>

            <!-- SVG Preview -->
            <details v-if="selected.type === 'svg' && selected.originalContent && selected.sanitizedContent"
              class="section">
              <summary class="section-title">SVG Preview Comparison</summary>
              <div class="section-body">
                <div class="preview-grid">
                  <div class="preview-panel">
                    <p class="preview-label">Original</p>
                    <div class="preview-box" v-html="selected.originalContent" />
                  </div>
                  <div class="preview-panel">
                    <p class="preview-label">Sanitized</p>
                    <div class="preview-box" v-html="selected.sanitizedContent" />
                  </div>
                </div>
              </div>
            </details>

          </div>

          <!-- ── Download Buttons ──────────────────────────────────────────── -->
          <!-- /download/:filename route use karta hai — Content-Disposition: attachment -->
          <!-- force download hoga, browser SVG open nahi karega                        -->
          <div v-if="selected.type === 'svg'" class="detail-footer">
            <a
              :href="`/download/${selected.filename}`"
              class="dl-btn dl-btn--secondary"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M7 9l-3-3M7 9l3-3M1 12h12" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Sanitized SVG
            </a>
            <a
              v-if="selected.repairedFilename"
              :href="`/download/${selected.repairedFilename}`"
              class="dl-btn dl-btn--primary"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M7 9l-3-3M7 9l3-3M1 12h12" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Auto-Repaired SVG
            </a>
          </div>

        </div>
      </main>

      <!-- Empty detail state -->
      <main class="detail-panel detail-panel--empty" v-else>
        <p class="empty-hint">← Select a file to view details</p>
      </main>

    </div>

  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import api from "./services/api";

const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const isDragging = ref(false);
const results = ref<any[]>([]);
const processingIndex = ref(0);
const totalFiles = ref(0);
const currentFilename = ref("");
const selectedIdx = ref(0);

const selected = computed(() => results.value[selectedIdx.value] ?? null);

function triggerInput() {
  fileInput.value?.click();
}

function resetAll() {
  results.value = [];
  selectedIdx.value = 0;
  processingIndex.value = 0;
  totalFiles.value = 0;
  currentFilename.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

function shortName(item: any): string {
  const name = item.repairedFilename?.replace("repaired_", "") ?? item.filename ?? "Unknown";
  return name.length > 22 ? name.slice(0, 20) + "…" : name;
}

function cleanFilename(item: any): string {
  return item.repairedFilename?.replace("repaired_", "") ?? item.filename ?? "Unknown";
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function scoreGrade(score: number): string {
  if (score == null) return "unknown";
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

function getGroupedIssues(item: any): Record<string, any[]> {
  if (!item.validation?.issues) return {};
  const ORDER = ["Security", "Structure", "Compatibility", "Metadata", "Optimization"];
  const groups: Record<string, any[]> = {};
  for (const issue of item.validation.issues) {
    const cat = issue.category || "Other";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(issue);
  }
  const sorted: Record<string, any[]> = {};
  for (const key of ORDER) { if (groups[key]) sorted[key] = groups[key]; }
  for (const key of Object.keys(groups)) { if (!sorted[key]) sorted[key] = groups[key]; }
  return sorted;
}

function categoryIcon(category: string): string {
  return ({ Security: "🔒", Structure: "🏗", Compatibility: "🔧", Metadata: "🏷", Optimization: "⚡" } as any)[category] ?? "📋";
}

const uploadFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData);
  return response.data;
};

const processFiles = async (files: File[]) => {
  uploading.value = true;
  isDragging.value = false;
  if (results.value.length === 0) selectedIdx.value = 0;
  totalFiles.value = files.length;
  processingIndex.value = 0;

  try {
    for (const file of files) {
      processingIndex.value += 1;
      currentFilename.value = file.name;
      try {
        const result = await uploadFile(file);
        results.value.push(result);
        if (results.value.length === 1) selectedIdx.value = 0;
      } catch (err: any) {
        results.value.push({
          filename: file.name,
          type: file.name.split(".").pop()?.toLowerCase() ?? "unknown",
          _error: true,
          _errorMessage: err?.response?.data?.error ?? err?.message ?? "Upload failed",
        });
      }
    }
  } finally {
    uploading.value = false;
    currentFilename.value = "";
  }
};

const handleFiles = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  await processFiles(Array.from(input.files));
};

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false;
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  await processFiles(Array.from(files));
};
</script>

<style scoped>

/* ── Base ──────────────────────────────────────────────────────────────────── */
* {
  box-sizing: border-box;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f7f4;
  font-family: 'IBM Plex Sans', sans-serif;
  color: #0f172a;
}

/* ── Topbar ────────────────────────────────────────────────────────────────── */
.topbar {
  background: #0f172a;
  border-bottom: 1px solid #1e293b;
  position: sticky;
  top: 0;
  z-index: 50;
  flex-shrink: 0;
}

.topbar-inner {
  max-width: 100%;
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 20px;
  color: #94a3b8;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  letter-spacing: -0.01em;
}

.brand-sub {
  font-size: 11px;
  color: #64748b;
  font-family: 'IBM Plex Mono', monospace;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-badges {
  display: flex;
  gap: 5px;
}

.badge-pill {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 3px;
  background: #1e293b;
  color: #94a3b8;
  letter-spacing: 0.04em;
}

.reset-btn {
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 4px;
  background: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
  cursor: pointer;
  font-family: 'IBM Plex Sans', sans-serif;
  transition: background 0.15s;
}

.reset-btn:hover {
  background: #334155;
}

/* ── Upload View ───────────────────────────────────────────────────────────── */
.upload-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.dropzone {
  width: 100%;
  max-width: 560px;
  border: 1.5px dashed #cbd5e1;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dropzone--active {
  border-color: #0f172a;
  background: #f8fafc;
}

.hidden-input {
  display: none;
}

.dropzone-idle {
  text-align: center;
  padding: 48px 32px;
}

.drop-icon {
  color: #94a3b8;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.drop-title {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 6px;
}

.drop-sub {
  font-size: 12px;
  color: #94a3b8;
  font-family: 'IBM Plex Mono', monospace;
  margin-bottom: 24px;
}

.drop-btn {
  background: #0f172a;
  color: #f1f5f9;
  font-size: 13px;
  font-weight: 500;
  padding: 9px 22px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  font-family: inherit;
}

.drop-btn:hover {
  background: #1e293b;
}

.dropzone-loading {
  text-align: center;
  padding: 48px 32px;
}

.loader-ring {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-label {
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 6px;
}

.loading-count {
  font-family: 'IBM Plex Mono', monospace;
  color: #64748b;
}

.loading-file {
  font-size: 12px;
  font-family: 'IBM Plex Mono', monospace;
  color: #94a3b8;
}

/* ── Results View (split) ──────────────────────────────────────────────────── */
.results-view {
  flex: 1;
  display: flex;
  overflow: hidden;
  height: calc(100vh - 52px);
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */
.file-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94a3b8;
}

.sidebar-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  background: #f1f5f9;
  color: #64748b;
  padding: 1px 7px;
  border-radius: 10px;
}

/* Summary bar */
.summary-bar {
  display: flex;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.summary-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-right: 1px solid #f1f5f9;
  cursor: default;
}

.summary-stat:last-child {
  border-right: none;
}

.summary-num {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.summary-lbl {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  margin-top: 2px;
}

.summary-stat--good .summary-num {
  color: #16a34a;
}

.summary-stat--warn .summary-num {
  color: #d97706;
}

.summary-stat--bad .summary-num {
  color: #dc2626;
}

.summary-stat--err .summary-num {
  color: #7c3aed;
}

/* File list */
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.file-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  border-left: 3px solid transparent;
}

.file-row:hover {
  background: #f8fafc;
}

.file-row--active {
  background: #f1f5f9 !important;
  border-left-color: #0f172a;
}

.file-row--active.file-row--good {
  border-left-color: #16a34a;
}

.file-row--active.file-row--warn {
  border-left-color: #d97706;
}

.file-row--active.file-row--bad {
  border-left-color: #dc2626;
}

.file-row--active.file-row--error {
  border-left-color: #7c3aed;
}

.file-row-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot--good {
  background: #16a34a;
}

.dot--warn {
  background: #d97706;
}

.dot--bad {
  background: #dc2626;
}

.dot--err {
  background: #7c3aed;
}

.dot--unknown {
  background: #94a3b8;
}

.file-row-name {
  flex: 1;
  font-size: 12.5px;
  font-family: 'IBM Plex Mono', monospace;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-row--active .file-row-name {
  color: #0f172a;
  font-weight: 500;
}

.file-row-score {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #94a3b8;
  flex-shrink: 0;
}

.file-row--active .file-row-score {
  color: #475569;
}

.sidebar-footer {
  padding: 10px 12px;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.add-more-btn {
  width: 100%;
  padding: 7px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background: #f8fafc;
  border: 1.5px dashed #cbd5e1;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}

.add-more-btn:hover {
  border-color: #94a3b8;
  color: #334155;
  background: #f1f5f9;
}

/* ── Detail Panel ──────────────────────────────────────────────────────────── */
.detail-panel {
  flex: 1;
  overflow-y: auto;
  background: #f8f7f4;
  min-width: 0;
}

.detail-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hint {
  font-size: 13px;
  color: #cbd5e1;
  font-family: 'IBM Plex Mono', monospace;
}

/* Detail Error */
.detail-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  text-align: center;
  gap: 12px;
}

.error-icon-big {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-error-file {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.detail-error-msg {
  font-size: 13px;
  color: #b91c1c;
}

/* Detail Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 14px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}

.detail-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.file-type-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 7px;
  border-radius: 3px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
  letter-spacing: 0.04em;
}

.detail-filename {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  font-family: 'IBM Plex Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.score-ring {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.score-ring--good {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.score-ring--warn {
  background: #fffbeb;
  border-color: #fde68a;
}

.score-ring--bad {
  background: #fef2f2;
  border-color: #fecaca;
}

.score-number {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 24px;
  font-weight: 500;
  line-height: 1;
}

.score-ring--good .score-number {
  color: #15803d;
}

.score-ring--warn .score-number {
  color: #b45309;
}

.score-ring--bad .score-number {
  color: #b91c1c;
}

.score-denom {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'IBM Plex Mono', monospace;
}

.score-bar-track {
  height: 3px;
  background: #f1f5f9;
}

.score-bar-fill {
  height: 100%;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.score-bar-fill--good {
  background: #16a34a;
}

.score-bar-fill--warn {
  background: #d97706;
}

.score-bar-fill--bad {
  background: #dc2626;
}

.score-bar-fill--unknown {
  background: #94a3b8;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  flex-wrap: wrap;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.status-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}

.status-chip--green {
  background: #dcfce7;
  color: #15803d;
}

.status-chip--yellow {
  background: #fef9c3;
  color: #a16207;
}

.status-chip--red {
  background: #fee2e2;
  color: #b91c1c;
}

.meta-size {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  color: #94a3b8;
}

/* Sections */
.sections {
  padding: 12px 16px 8px;
}

.section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  margin-bottom: 8px;
  overflow: hidden;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: background 0.1s;
}

.section-title:hover {
  background: #f8fafc;
}

.section-title::-webkit-details-marker {
  display: none;
}

.section[open]>.section-title {
  color: #0f172a;
  border-bottom: 1px solid #f1f5f9;
}

.issue-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 20px;
}

.issue-count--has {
  background: #fee2e2;
  color: #b91c1c;
}

.issue-count--none {
  background: #dcfce7;
  color: #15803d;
}

.issue-count--suggest {
  background: #eff6ff;
  color: #2563eb;
}

.section-body {
  padding: 10px 16px 14px;
}

.no-issues {
  font-size: 13px;
  color: #16a34a;
  font-family: 'IBM Plex Mono', monospace;
  padding: 4px 0;
}

.issue-group {
  margin-bottom: 10px;
}

.issue-category-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.cat-icon {
  font-size: 12px;
}

.cat-name {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #475569;
}

.cat-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: #94a3b8;
  margin-left: auto;
}

.issue-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 4px;
  font-size: 12.5px;
  margin-bottom: 3px;
}

.issue-row--error {
  background: #fef2f2;
  color: #7f1d1d;
}

.issue-row--warning {
  background: #fffbeb;
  color: #78350f;
}

.issue-row--info {
  background: #eff6ff;
  color: #1e3a5f;
}

.issue-sev {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

.issue-msg {
  line-height: 1.5;
}

.suggestion-row {
  padding: 10px 12px;
  border-radius: 5px;
  margin-bottom: 7px;
  border: 1px solid transparent;
}

.suggestion-row--high {
  background: #fef2f2;
  border-color: #fecaca;
}

.suggestion-row--medium {
  background: #fffbeb;
  border-color: #fde68a;
}

.suggestion-row--low {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.sug-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sug-dot--high {
  background: #dc2626;
}

.sug-dot--medium {
  background: #d97706;
}

.sug-dot--low {
  background: #16a34a;
}

.sug-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.sug-priority {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
}

.sug-desc {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  padding-left: 15px;
}

.repair-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.repair-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0f172a;
  padding: 4px 0;
}

.repair-check {
  font-size: 11px;
  color: #16a34a;
  font-weight: 700;
  flex-shrink: 0;
}

.kv-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #f1f5f9;
  border: 1px solid #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #fff;
}

.kv-key {
  font-size: 12px;
  color: #64748b;
}

.kv-val {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  color: #0f172a;
  font-weight: 500;
}

.kv-val--yes {
  color: #16a34a;
}

.kv-val--accent {
  color: #2563eb;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.preview-panel {
  border: 1px solid #e2e8f0;
  border-radius: 5px;
  overflow: hidden;
}

.preview-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  padding: 7px 12px;
  border-bottom: 1px solid #f1f5f9;
  font-family: 'IBM Plex Mono', monospace;
  background: #fafafa;
}

.preview-box {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #fff;
}

.preview-box :deep(svg) {
  max-width: 100%;
  max-height: 136px;
  object-fit: contain;
}

/* Detail Footer */
.detail-footer {
  display: flex;
  gap: 8px;
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  position: sticky;
  bottom: 0;
}

.dl-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.15s;
  font-family: 'IBM Plex Sans', sans-serif;
}

.dl-btn--secondary {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.dl-btn--secondary:hover {
  background: #e2e8f0;
}

.dl-btn--primary {
  background: #0f172a;
  color: #f1f5f9;
  border: 1px solid #0f172a;
}

.dl-btn--primary:hover {
  background: #1e293b;
}
</style>