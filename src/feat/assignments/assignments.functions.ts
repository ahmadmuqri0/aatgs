import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';

import { ensureSession } from '#/feat/auth/auth.functions';

import { insertAssignment, listAssignments } from './assignments.server';
import { createAssignmentSchema } from './schema';

export const assignmentsQueryOptions = () =>
  queryOptions({
    queryKey: ['assignments'],
    queryFn: () => getAssignments(),
  });

export const getAssignments = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await ensureSession();
  return listAssignments(session.user.id);
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

    return insertAssignment(session.user.id, data);
  });
