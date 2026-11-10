import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';

import { ensureSession } from '#/feat/auth/auth.functions';

import {
  insertAssignment,
  listAssignments,
  updateTaskCompleted,
  viewAssignment,
} from './assignments.server';
import { startGeneration } from './generation.server';
import {
  createAssignmentSchema,
  setTaskCompletedSchema,
  type SetTaskCompletedSchema,
} from './schema';

export const assignmentsQueryOptions = () =>
  queryOptions({
    queryKey: ['assignments'],
    queryFn: () => getAssignments(),
  });

export const assignmentQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['assignment', id],
    queryFn: () => getAssignment({ data: { id } }),
  });

export const getAssignments = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await ensureSession();
  return listAssignments(session.user.id);
});

export const getAssignment = createServerFn({ method: 'GET' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await ensureSession();
    return viewAssignment(data.id, session.user.id);
  });

export const createAssignment = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error('data must be FormData');
    }

    return createAssignmentSchema.parse({
      title: data.get('title'),
      dueDate: data.get('dueDate') ?? '',
      docs: data.get('docs'),
    });
  })
  .handler(async ({ data }) => {
    const session = await ensureSession();

    const { id } = await insertAssignment(session.user.id, data);
    await startGeneration(id);

    return { id };
  });

export const setTaskCompleted = createServerFn({ method: 'POST' })
  .validator((data: SetTaskCompletedSchema) => setTaskCompletedSchema.parse(data))
  .handler(async ({ data }) => {
    const session = await ensureSession();

    await updateTaskCompleted(session.user.id, data);
  });
