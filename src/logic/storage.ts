import { z } from 'zod'
import { useStorageLocal } from '~/composables/useStorageLocal'

export const optionsSchema = z.object({
  gitlabToken: z.string(),
  clockifyToken: z.string(),
  clockifyWorkspace: z.string(),
  panelOpenStatus: z.number().array(),
})

export async function getOptions() {
  return optionsSchema.parse(
    JSON.parse((await browser.storage.local.get('options')).options),
  )
}

type Options = z.infer<typeof optionsSchema>

export const storageOptions = useStorageLocal<Options>(
  'options',
  {
    gitlabToken: '',
    clockifyToken: '',
    clockifyWorkspace: '',
    panelOpenStatus: [],
  },
  { listenToStorageChanges: true },
)
