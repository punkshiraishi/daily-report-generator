<script setup lang="ts">
import { mdiCached } from '@mdi/js'

defineEmits(['reset'])
</script>

<template>
  <v-text-field
    density="compact"
  >
    <template #append-inner>
      <v-btn
        density="compact"
        variant="plain"
        icon
        @click="$emit('reset')"
      >
        <v-icon :icon="mdiCached" />
        <v-tooltip
          activator="parent"
          location="bottom"
        >
          リセット
        </v-tooltip>
      </v-btn>
    </template>
  </v-text-field>
</template>
