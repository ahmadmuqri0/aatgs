import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { RefreshCwIcon } from 'lucide-react';

import { Button } from '#/components/ui/button';
import { Checkbox } from '#/components/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldLabel } from '#/components/ui/field';
import { Skeleton } from '#/components/ui/skeleton';
import {
  assignmentQueryOptions,
  assignmentsQueryOptions,
  retryGeneration,
  setTaskCompleted,
} from '#/feat/assignments/assignments.functions';
import type { SetTaskCompletedSchema } from '#/feat/assignments/schema';
import { cn } from '#/lib/utils';

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

  const queryClient = useQueryClient();
  // refetch this page and the list, whose cards show task progress and generation status
  const refetchAssignment = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: assignmentQueryOptions(id).queryKey }),
      queryClient.invalidateQueries({ queryKey: assignmentsQueryOptions().queryKey }),
    ]);

  const { mutate, isPending, variables } = useMutation({
    mutationFn: (data: SetTaskCompletedSchema) => setTaskCompleted({ data }),
    onSettled: refetchAssignment,
  });

  // the refetch sees the new pending generation, which starts the polling above
  const retry = useMutation({
    mutationFn: () => retryGeneration({ data: { id } }),
    onSuccess: refetchAssignment,
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
          <>
            <p>Error: {assignment.latestError ?? 'Generation was interrupted'}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={retry.isPending}
              onClick={() => retry.mutate()}
            >
              <RefreshCwIcon data-icon="inline-start" />
              Retry
            </Button>
            {retry.isError && <p className="text-destructive">{retry.error.message}</p>}
          </>
        )}
        {assignment.activeGeneration && <p>Model: {assignment.activeGeneration.model}</p>}
      </div>

      {assignment.activeGeneration ? (
        <div className="flex flex-col gap-4">
          {assignment.activeGeneration.tasks.map((task) => {
            const isUpdating = isPending && variables?.taskId === task.id;

            return (
              <Field key={task.id} orientation="horizontal">
                <Checkbox
                  id={task.id}
                  checked={!!task.completedAt}
                  disabled={isUpdating}
                  onCheckedChange={(checked) => mutate({ taskId: task.id, completed: checked })}
                />
                <FieldContent>
                  <FieldLabel htmlFor={task.id} className={cn(task.completedAt && 'line-through')}>
                    {task.position + 1}. {task.title}
                  </FieldLabel>
                  {task.description && <FieldDescription>{task.description}</FieldDescription>}
                </FieldContent>
              </Field>
            );
          })}
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
