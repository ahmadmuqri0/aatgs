import { queryOptions } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { auth } from '#/feat/auth/auth.server';

import { ensureSession } from '../auth/auth.functions';
import { insertAssignment, listAssignments } from './assignments.server';
import { createAssignmentSchema } from './schema';

export const assignmentsQueryOptions = () =>
  queryOptions({
    queryKey: ['assignments'],
    queryFn: () => getAssignments(),
  });

export const getAssignments = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw new Error('Unauthorized');
  }

  return listAssignments(session.user.id);
});

export const createAssignment = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData');
    }

    return createAssignmentSchema.parse({
      title: data.get('title'),
      dueDate: data.get('dueDate') ?? '',
      brief: data.get('brief'),
    });
  })
  .handler(async ({ data }) => {
    const session = await ensureSession();

    if (!session) {
      throw new Error('Unauthorized');
    }

    return insertAssignment(session.user.id, data);
  });
