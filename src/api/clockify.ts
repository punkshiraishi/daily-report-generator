import * as convertKeys from 'convert-keys'
import { z } from 'zod'
import browser from 'webextension-polyfill'
import { timeentrySchema } from '~/types/clockify_timeentry'

async function fetchClocify(method: 'get' | 'post', path: string, body?: Record<string, string | number | Date | object>) {
  const optionsSchema = z.object({
    gitlabToken: z.string(),
    clockifyToken: z.string(),
    clockifyWorkspace: z.string(),
  })

  const { clockifyToken, clockifyWorkspace } = optionsSchema.parse(
    JSON.parse((await browser.storage.local.get('options')).options),
  )

  const url = `https://reports.api.clockify.me/v1/workspaces/${clockifyWorkspace}/${path}`

  const response = await fetch(url, {
    method,
    headers: {
      'X-Api-Key': clockifyToken,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  return convertKeys.toCamel(await response.json())
}

export async function getTimeentries(dateRangeStart: Date, dateRangeEnd: Date) {
  const response = await fetchClocify(
    'post',
    'reports/detailed',
    {
      dateRangeStart,
      dateRangeEnd,
      detailedFilter: {
        page: 1,
        pageSize: 1000,
      },
    },
  )

  const { timeentries } = z.object({
    timeentries: z.array(timeentrySchema),
  }).parse(response)

  return timeentries
}
