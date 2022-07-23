import { z } from 'zod'

export const timeentrySchema = z.object({
  _id: z.string(),
  description: z.string(),
  userId: z.string(),
  billable: z.boolean(),
  taskId: z.string(),
  projectId: z.string(),
  clientId: z.string(),
  timeInterval: z.object({
    start: z.string(),
    end: z.string(),
    duration: z.number(),
  }),
  approvalRequestId: z.string(),
  tags: z.string().array(),
  isLocked: z.boolean(),
  customFields: z.object({
    customFieldId: z.string(),
    value: z.string(),
  }).array(),
  amount: z.number(),
  rate: z.number(),
  userName: z.string(),
  userEmail: z.string(),
  projectName: z.string(),
  projectColor: z.string(),
  clientName: z.string(),
})

export type ClockifyTimeentry = z.infer<typeof timeentrySchema>

