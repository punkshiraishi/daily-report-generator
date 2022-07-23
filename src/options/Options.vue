<script setup lang="ts">
import { storageOptions } from '~/logic/storage'
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
                type="date"
                class="flex-grow border border-sky-300 rounded px-1"
              >
              <input
                id="end"
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
          >
            指定期間で取得
          </button>
          <button
            class="flex-grow rounded bg-sky-500 text-white drop-shadow-md p-2"
          >
            日報取得
          </button>
          <button
            class="flex-grow rounded bg-sky-500 text-white drop-shadow-md p-2"
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
      </div>
    </div>
  </main>
</template>
