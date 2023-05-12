<script setup lang="ts">
import _ from 'lodash'
import { sendMessage } from 'webext-bridge/options'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { SummaryTimeentries } from '~/background/main'
import { storageOptions } from '~/logic/storage'

const groupedTimeentries = ref<SummaryTimeentries>()

const today = dayjs()
const startAt = ref(dayjs(today).format('YYYY-MM-DD'))
const endAt = ref(dayjs(today).add(1, 'day').format('YYYY-MM-DD'))
const itemSortOrder = ref<'by_time_desc' | 'by_name_asc'>('by_time_desc')
const omitTime = ref(false)
const panel = ref([0, 1, 2])
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

async function onSetToday() {
  startAt.value = dayjs(today).format('YYYY-MM-DD')
  endAt.value = dayjs(today).add(1, 'day').format('YYYY-MM-DD')
}

async function onSetThisWeek() {
  function getMonday(date: Dayjs) {
    return dayjs(date).add(1 - dayjs(date).day(), 'day')
  }

  startAt.value = getMonday(today).format('YYYY-MM-DD')
  endAt.value = getMonday(today).add(5, 'day').format('YYYY-MM-DD')
}

const formattedTimeentries = computed(() => {
  const formatToHour = (num: number) => {
    return (Math.round(num / 3600 * 100) / 100).toFixed(1)
  }

  const output: string[] = []

  _.chain(groupedTimeentries.value)
    .entries()
    .forEach((item) => {
      output.push(`\n■ ${item[0]}`)
      _.chain(item[1])
        .entries()
        .forEach((item) => {
          output.push(`【${item[0]}】`)
          _.chain(item[1])
            .entries()
            .sortBy((item) => {
              if (itemSortOrder.value === 'by_time_desc')
                return -item[1].timeInterval.duration

              if (itemSortOrder.value === 'by_name_asc')
                return item[0]
            })
            .forEach((item) => {
              if (omitTime.value) {
                // eslint-disable-next-line vue/no-irregular-whitespace, no-irregular-whitespace
                output.push(`　┗ ${item[0]}`)
              }
              else {
                // eslint-disable-next-line vue/no-irregular-whitespace, no-irregular-whitespace
                output.push(`　┗ ${formatToHour(item[1].timeInterval.duration)} h ${item[0]}`)
              }
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
  navigator.clipboard.writeText(formattedTimeentries.value)

  copied.value = true

  setTimeout(() => {
    copied.value = false
  }, 1000)
}
</script>

<template>
  <v-layout>
    <v-app-bar scroll-threshold="0">
      <div class="p-5 text-2xl">
        <span class="text-sky-500">Clockify</span><span> to</span><span class="font-bold"> 日報</span>
      </div>
    </v-app-bar>
    <v-main class="flex flex-col items-center">
      <div class="w-full min-w-[20rem] max-w-[40rem] p-5 flex flex-col space-y-3">
        <v-expansion-panels
          v-model="panel"
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
              <div class="flex flex-row space-x-3">
                <v-text-field
                  id="start"
                  v-model="startAt"
                  density="compact"
                  type="date"
                  label="開始日"
                />
                <v-text-field
                  id="end"
                  v-model="endAt"
                  density="compact"
                  type="date"
                  label="終了日"
                />
              </div>
              <div class="flex flex-row space-x-3">
                <v-btn @click="onSetToday">
                  今日
                </v-btn>
                <v-btn @click="onSetThisWeek">
                  今週
                </v-btn>
              </div>
            </template>
          </v-expansion-panel>
          <v-expansion-panel>
            <template #title>
              集計オプション
            </template>
            <template #text>
              <v-select
                v-model="itemSortOrder"
                label="並び順"
                :items="[{ label: '時間で並び替え', value: 'by_time_desc' }, { label: '名前で並び替え', value: 'by_name_asc' }]"
                item-title="label"
                item-value="value"
                density="compact"
              />
              <v-checkbox
                v-model="omitTime"

                density="compact"
                label="時間を表示しない"
              />
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-icon
          icon="mdi-arrow-down"
          class="text-sky-500 self-center"
          size="30"
        />
        <v-btn
          class="bg-sky-500 text-white"
          :loading="loading"
          @click="getReport"
        >
          タイムエントリー取得
        </v-btn>
        <v-icon
          icon="mdi-arrow-down"
          class="text-sky-500 self-center"
          size="30"
        />
        <v-card
          class="relative bg-sky-800 text-white text-sky-100 p-7"
        >
          <v-btn
            class="absolute right-3 top-3"
            variant="plain"
            density="comfortable"
            icon
            @click="copyToClipboard"
          >
            <v-icon :icon="copied ? 'mdi-check' : 'mdi-content-copy'" />
            <v-tooltip
              activator="parent"
              location="bottom"
              theme="light"
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
