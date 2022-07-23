import * as convertKeys from 'convert-keys'
import { z } from 'zod'
import { getOptions } from '~/logic'

async function fetchGitlab(method: 'get' | 'post', path: string, body?: Record<string, string | Date>) {
  const { gitlabToken } = await getOptions()
  const url = `https://gitlab.com/api/v4/${path}`

  const response = await fetch(url, {
    method,
    headers: {
      'Private-Token': gitlabToken,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(convertKeys.toSnake(body)) : undefined,
    credentials: 'include',
  })

  return convertKeys.toCamel(await response.json())
}

/**
 * GET /projects
 */
const projectSchema = z.object({
  id: z.number(),
})

export type GitlabProject = z.infer<typeof projectSchema>

export async function getProjectsByName(projectName: string) {
  const response = await fetchGitlab(
    'get',
    `projects?search_namespaces=true&membership=true&search=${encodeURIComponent(projectName)}`,
  )

  return z.array(projectSchema).parse(response)
}

/**
 * GET /issues
 */
const issueSchema = z.object({
  title: z.string(),
})

export type GitlabIssues = z.infer<typeof issueSchema>

export async function getIssue(projectId: string, issueId: string) {
  const response = await fetchGitlab(
    'get',
    `projects/${projectId}/issues/${issueId}`,
  )

  return issueSchema.parse(response)
}

/**
 * GET /merge_requests
 */
const mergeRequestSchema = z.object({
  title: z.string(),
})
export async function getMergeRequest(projectId: string, mergeRequest: string) {
  const response = await fetchGitlab(
    'get',
    `projects/${projectId}/merge_requests/${mergeRequest}`,
  )
  // throw response

  return mergeRequestSchema.parse(response)
}
