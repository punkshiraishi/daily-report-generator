import browser from 'webextension-polyfill'
import { onMessage } from 'webext-bridge/background'
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
