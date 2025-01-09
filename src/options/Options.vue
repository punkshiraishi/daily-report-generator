<script setup lang="ts">
import _ from 'lodash'
import { sendMessage } from 'webext-bridge/options'
import dayjs from 'dayjs'
import { mdiArrowDown, mdiCheck, mdiContentCopy, mdiGithub, mdiLeadPencil, mdiOpenInNew, mdiShopping } from '@mdi/js'
import type { SummaryTimeentries } from '~/background/main'
import { storageOptions } from '~/logic/storage'

const groupedTimeentries = ref<SummaryTimeentries>()

const today = dayjs()
const startAt = ref(dayjs(today).format('YYYY-MM-DD'))
const endAt = ref(dayjs(today).add(1, 'day').format('YYYY-MM-DD'))
const itemSortOrder = ref<'by_time_desc' | 'by_name_asc'>('by_time_desc')
const loading = ref(false)

onMounted(async () => {
  if (storageOptions.value.clockifyToken && storageOptions.value.clockifyWorkspace)
    await getReport()
})

async function getReport() {
  try {
    loading.value = true

    const response = await sendMessage('get-clockify-timeentries', {
      start: new Date(startAt.value),
      end: new Date(endAt.value),
    })
    groupedTimeentries.value = response
  }
  finally {
    loading.value = false
  }
}

async function onSetYesterday() {
  startAt.value = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD')
  endAt.value = dayjs(today).format('YYYY-MM-DD')
}

async function onSetToday() {
  startAt.value = dayjs(today).format('YYYY-MM-DD')
  endAt.value = dayjs(today).add(1, 'day').format('YYYY-MM-DD')
}

async function onSetLastWeek() {
  startAt.value = dayjs(today).subtract(1, 'week').startOf('week').format('YYYY-MM-DD')
  endAt.value = dayjs(today).subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
}

async function onSetThisWeek() {
  startAt.value = dayjs(today).startOf('week').format('YYYY-MM-DD')
  endAt.value = dayjs(today).endOf('week').format('YYYY-MM-DD')
}

async function onSetLastMonth() {
  startAt.value = dayjs(today).subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
  endAt.value = dayjs(today).subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
}

async function onSetThisMonth() {
  startAt.value = dayjs(today).startOf('month').format('YYYY-MM-DD')
  endAt.value = dayjs(today).endOf('month').format('YYYY-MM-DD')
}

function formatClientName(clientName: string) {
  return storageOptions.value.clientNameFormat
    .replace('{value}', clientName)
}

function formatProjectName(projectName: string) {
  return storageOptions.value.projectNameFormat
    .replace('{value}', projectName)
}

function formatTaskName(taskName: string, time: number, tags?: any[]) {
  return storageOptions.value.taskNameFormat
    .replace('{value}', taskName)
    .replace('{time}', (Math.round(time / 3600 * 100) / 100).toFixed(1).toString())
    .replace('{tags}', tags?.map(tag => `[${tag.name}]`).join('') || '')
}

function resetClientNameFormat() {
  storageOptions.value.clientNameFormat = '■ {value}'
}

function resetProjectNameFormat() {
  storageOptions.value.projectNameFormat = '【{value}】'
}

function resetTaskNameFormat() {
  storageOptions.value.taskNameFormat = '　┗ {time} h {value} {tags}'
}

const formattedTimeentries = computed(() => {
  const output: string[] = []

  _.chain(groupedTimeentries.value)
    .entries()
    .forEach((item, index) => {
      if (index > 0) {
        output.push('')
      }
      output.push(formatClientName(item[0]))
      _.chain(item[1])
        .entries()
        .forEach((item) => {
          output.push(formatProjectName(item[0]))
          _.chain(item[1])
            .entries()
            .sortBy((item) => {
              if (itemSortOrder.value === 'by_time_desc')
                return -item[1].timeInterval.duration

              if (itemSortOrder.value === 'by_name_asc')
                return item[0]
            })
            .forEach((item) => {
              output.push(formatTaskName(item[0], item[1].timeInterval.duration, item[1].tags))
            })
            .value()
        })
        .value()
    })
    .value()

  return output.join('\n')
})

const copied = ref(false)

function copyToClipboard() {
  navigator.clipboard.writeText(formattedTimeentries.value.trim())

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1000)
}
</script>

<template>
  <v-layout>
    <v-app-bar scroll-threshold="0">
      <v-app-bar-title class="pa-5">
        <a
          href="https://app.clockify.me/tracker"
          target="_blank"
          class="text-light-blue mr-2"
        >
          Clockify
        </a>
        <span class="font-weight-bold">Daily Report Generator</span>
      </v-app-bar-title>
      <template #append>
        <v-btn icon href="https://chrome.google.com/webstore/detail/daily-report-generator/bmdlandlljfpmfdifcdfbkodjdndipmg?hl=ja&authuser=0">
          <v-icon :icon="mdiShopping" color="light-blue-darken-4" />
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Chrome ウェブストアを開く <v-icon :icon="mdiOpenInNew" />
          </v-tooltip>
        </v-btn>
        <v-btn icon href="https://github.com/punkshiraishi/daily-report-generator">
          <v-icon :icon="mdiGithub" color="light-blue-darken-4" />
          <v-tooltip
            activator="parent"
            location="bottom"
          >
            Github リポジトリページを開く <v-icon :icon="mdiOpenInNew" />
          </v-tooltip>
        </v-btn>
      </template>
      <v-spacer />
    </v-app-bar>
    <v-main class="d-flex flex-column align-center">
      <div class="w-100 pa-5 d-flex flex-column" style="min-width: 20rem; max-width: 40rem;">
        <v-expansion-panels
          v-model="storageOptions.panelOpenStatus"
          class="mb-3"
          multiple
        >
          <v-expansion-panel>
            <template #title>
              設定
            </template>
            <template #text>
              <v-text-field
                v-model="storageOptions.clockifyToken"
                density="compact"
                type="password"
                label="Clockify API Key"
              />
              <v-text-field
                v-model="storageOptions.clockifyWorkspace"
                density="compact"
                label="Clockify Workspace ID"
              />
            </template>
          </v-expansion-panel>
          <v-expansion-panel>
            <template #title>
              集計期間
            </template>
            <template #text>
              <div class="d-flex flex-row">
                <v-text-field
                  v-model="startAt"
                  class="mr-3"
                  density="compact"
                  type="date"
                  label="開始日"
                />
                <v-text-field
                  v-model="endAt"
                  density="compact"
                  type="date"
                  label="終了日"
                />
              </div>
              <div class="d-flex flex-row">
                <v-btn
                  class="mr-3"
                  @click="onSetYesterday"
                >
                  昨日
                </v-btn>
                <v-btn
                  class="mr-3"
                  @click="onSetToday"
                >
                  今日
                </v-btn>
                <v-btn
                  class="mr-3"
                  @click="onSetLastWeek"
                >
                  先週
                </v-btn>
                <v-btn
                  class="mr-3"
                  @click="onSetThisWeek"
                >
                  今週
                </v-btn>
                <v-btn
                  class="mr-3"
                  @click="onSetLastMonth"
                >
                  先月
                </v-btn>
                <v-btn
                  class="mr-3"
                  @click="onSetThisMonth"
                >
                  今月
                </v-btn>
              </div>
            </template>
          </v-expansion-panel>
          <v-expansion-panel>
            <template #title>
              集計オプション
            </template>
            <template #text>
              <ResetableTextField
                v-model="storageOptions.clientNameFormat"
                label="見出し 1 のフォーマット"
                @reset="resetClientNameFormat"
              />
              <ResetableTextField
                v-model="storageOptions.projectNameFormat"
                label="見出し 2 のフォーマット"
                @reset="resetProjectNameFormat"
              />
              <ResetableTextField
                v-model="storageOptions.taskNameFormat"
                label="タスク名のフォーマット"
                @reset="resetTaskNameFormat"
              />
              <v-select
                v-model="itemSortOrder"
                label="並び順"
                :items="[{ label: '合計時間 降順', value: 'by_time_desc' }, { label: '名前 昇順', value: 'by_name_asc' }]"
                item-title="label"
                item-value="value"
                density="compact"
              />
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-icon
          :icon="mdiArrowDown"
          color="light-blue"
          class="align-self-center mb-3"
          size="30"
        />
        <v-btn
          color="light-blue"
          class="mb-3"
          :loading="loading"
          @click="getReport"
        >
          <v-icon :icon="mdiLeadPencil" />レポート作成
        </v-btn>
        <v-icon
          :icon="mdiArrowDown"
          class="align-self-center mb-3"
          color="light-blue"
          size="30"
        />
        <v-card
          color="light-blue-darken-3 pa-7"
          style="position: relative;"
        >
          <v-btn
            style="position: absolute; right: 0.75rem; top: 0.75rem;"
            variant="plain"
            density="comfortable"
            icon
            @click="copyToClipboard"
          >
            <v-icon :icon="copied ? mdiCheck : mdiContentCopy" />
            <v-tooltip
              activator="parent"
              location="bottom"
            >
              {{ copied ? 'Copied!' : 'Copy text' }}
            </v-tooltip>
          </v-btn>
          <pre>{{ formattedTimeentries }}</pre>
        </v-card>
      </div>
    </v-main>
  </v-layout>
</template>
