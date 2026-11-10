import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';

import { Skeleton } from '#/components/ui/skeleton';
import { assignmentQueryOptions } from '#/feat/assignments/assignments.functions';

export const Route = createFileRoute('/_protected/assignments/$id')({
  loader: async ({ context, params }) => {
    const assignment = await context.queryClient.query({ ...assignmentQueryOptions(params.id) });
    if (!assignment) throw notFound();
  },
  pendingComponent: AssignmentPending,
  component: Assignment,
});

const dateFormat = new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium' });

function Assignment() {
  const { id } = Route.useParams();
  const { data: assignment } = useSuspenseQuery({
    ...assignmentQueryOptions(id),
    refetchInterval: (query) => (query.state.data?.latestStatus === 'pending' ? 3000 : false),
  });
  if (!assignment) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 pt-0">
      <div>
        <p>Title: {assignment.title}</p>
        <p>Due: {assignment.dueDate ? dateFormat.format(assignment.dueDate) : 'No due date'}</p>
        <p>File: {assignment.fileName}</p>
        <p>Created: {dateFormat.format(assignment.createdAt)}</p>
        <p>Status: {assignment.latestStatus ?? 'none'}</p>
        {assignment.latestStatus === 'failed' && (
          <p>Error: {assignment.latestError ?? 'Generation was interrupted'}</p>
        )}
        {assignment.activeGeneration && <p>Model: {assignment.activeGeneration.model}</p>}
      </div>

      {assignment.activeGeneration ? (
        <div className="flex flex-col gap-3">
          {assignment.activeGeneration.tasks.map((task) => (
            <div key={task.id}>
              <p>
                {task.position + 1}. {task.title} {task.completedAt ? '(done)' : ''}
              </p>
              {task.description && <p>{task.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p>No tasks yet</p>
      )}
    </div>
  );
}

function AssignmentPending() {
  return (
    <div className="grid auto-rows-min gap-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
