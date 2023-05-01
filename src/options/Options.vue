<script setup lang="ts">
import _ from 'lodash'
import { sendMessage } from 'webext-bridge'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { SummaryTimeentries } from '~/background'
import { storageOptions } from '~/logic/storage'

const groupedTimeentries = ref<SummaryTimeentries>()

const today = dayjs()
const startAt = ref(dayjs(today).format('YYYY-MM-DD'))
const endAt = ref(dayjs(today).add(1, 'day').format('YYYY-MM-DD'))

async function getReport() {
  const response = await sendMessage('get-clockify-timeentries', {
    start: new Date(startAt.value),
    end: new Date(endAt.value),
  })
  groupedTimeentries.value = response
}

async function getDailyReport() {
  startAt.value = dayjs(today).format('YYYY-MM-DD')
  endAt.value = dayjs(today).add(1, 'day').format('YYYY-MM-DD')

  await getReport()
}

async function getWeeklyReport() {
  function getMonday(date: Dayjs) {
    return dayjs(date).add(1 - dayjs(date).day(), 'day')
  }

  startAt.value = getMonday(today).format('YYYY-MM-DD')
  endAt.value = getMonday(today).add(5, 'day').format('YYYY-MM-DD')

  await getReport()
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
            .sortBy(item => item[1].timeInterval.duration)
            .reverse()
            .forEach((item) => {
              // eslint-disable-next-line vue/no-irregular-whitespace, no-irregular-whitespace
              output.push(`　┗ ${formatToHour(item[1].timeInterval.duration)} h ${item[0]}`)
            })
            .value()
        })
        .value()
    })
    .value()

  return output.join('\n')
})
</script>

<template>
  <main class="p-5 flex flex-col items-center">
    <div class="flex flex-col space-y-5" style="width: 40rem">
      <div class="py-5 text-3xl">
        <span class="text-sky-500">Clockify</span><span> to</span><span class="font-bold"> 日報</span>
      </div>
      <div class="flex flex-col space-y-3">
        <div
          class="p-5 rounded-lg bg-sky-100 drop-shadow-md flex flex-col space-y-3"
        >
          <div class="py-1 text-xl text-sky-500">
            Settings
          </div>
          <div class="flex flex-row">
            <div class="font-bold" style="width: 12rem">
              Clockify Access Token
            </div>
            <input
              v-model="storageOptions.clockifyToken"
              class="flex-grow border border-sky-300 rounded px-1"
              type="password"
            >
          </div>
          <div class="flex flex-row">
            <div class="font-bold" style="width: 12rem">
              Clockify Workspace ID
            </div>
            <input
              v-model="storageOptions.clockifyWorkspace"
              class="flex-grow border border-sky-300 rounded px-1"
            >
          </div>
          <div class="flex flex-row">
            <div class="font-bold" style="width: 12rem">
              集計日付
            </div>
            <div class="flex-grow">
              <input
                id="start"
                v-model="startAt"
                type="date"
                class="flex-grow border border-sky-300 rounded px-1"
              >
              <input
                id="end"
                v-model="endAt"
                type="date"
                class="flex-grow border border-sky-300 rounded px-1"
              >
            </div>
          </div>
          <div class="flex flex-row">
            <div class="font-bold" style="width: 12rem">
              最小時間
            </div>
            <div class="flex-grow">
              <input
                id="min"
                class="flex-grow border border-sky-300 rounded px-1"
              >
            </div>
          </div>
        </div>
        <div class="flex flex-row justify-between space-x-3">
          <button
            class="flex-grow rounded bg-sky-500 text-white drop-shadow-md p-2"
            @click="getReport"
          >
            指定期間で取得
          </button>
          <button
            class="flex-grow rounded bg-sky-500 text-white drop-shadow-md p-2"
            @click="getDailyReport"
          >
            日報取得
          </button>
          <button
            class="flex-grow rounded bg-sky-500 text-white drop-shadow-md p-2"
            @click="getWeeklyReport"
          >
            週報取得
          </button>
        </div>
      </div>
      <div
        class="bg-sky-900 rounded-lg text-white text-sm text-sky-100 drop-shadow-md p-7 flex flex-col space-x-3"
      >
        <div class="w-10 h-10 self-end cursor-pointer p-2 flex items-center justify-center hover:bg-sky-100 hover:text-sky-900">
          <pixelarticons-clipboard />
        </div>
        <pre>{{ formattedTimeentries }}</pre>
      </div>
    </div>
  </main>
</template>
