import type { Tabs } from 'webextension-polyfill'
import browser from 'webextension-polyfill'
import { onMessage, sendMessage } from 'webext-bridge'
import _ from 'lodash'
import { getTimeentries } from '~/api/clockify'
import type { ClockifyTimeentry } from '~/types/clockify_timeentry'

browser.action.onClicked.addListener(() => {
  browser.tabs.create({ url: 'dist/options/index.html' })
})

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

function summaryTimeentries(timeentries: ClockifyTimeentry[]) {
  return _.chain(timeentries)
    .groupBy('clientName')
    .mapValues((entries) => {
      return _.chain(entries)
        .groupBy('projectName')
        .mapValues((items) => {
          return _.chain(items)
            .groupBy('description')
            .mapValues((values) => {
              return values
                .reduce((previous, current) => {
                  return {
                    ...previous,
                    timeInterval: {
                      start: _.min([previous.timeInterval.start, current.timeInterval.start]) || '',
                      end: _.max([previous.timeInterval.end, current.timeInterval.end]) || '',
                      duration: previous.timeInterval.duration + current.timeInterval.duration,
                    },
                  }
                })
            })
            .value()
        })
        .pickBy(value => Object.entries(value).length > 0)
        .value()
    })
    .pickBy(value => Object.entries(value).length > 0)
    .value()
}

export type SummaryTimeentries = ReturnType<typeof summaryTimeentries>

onMessage('get-clockify-timeentries', async ({ data }) => {
  const timeentries = await getTimeentries(data.start, data.end)
  return summaryTimeentries(timeentries)
})
