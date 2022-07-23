import * as convertKeys from 'convert-keys'
import { z } from 'zod'
import { getOptions } from '~/logic'

async function fetchClocify(method: 'get' | 'post', path: string, body?: Record<string, string | Date>) {
  const { clockifyToken, clockifyWorkspace } = await getOptions()
  const url = `https://api.clockify.me/api/v1/workspaces/${clockifyWorkspace}/${path}`

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

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  clientName: z.string(),
  color: z.string(),
})

export type ClockifyProject = z.infer<typeof projectSchema>

export async function getProjects(projectName: string) {
  const response = await fetchClocify(
    'get',
    `projects?name=${projectName}`,
  )

  return z.array(projectSchema).parse(response)
}

export async function postTimeentries(projectId: string, description: string) {
  const response = await fetchClocify(
    'post',
    'time-entries',
    {
      start: new Date(),
      projectId,
      description,
    },
  )

  return response
}
