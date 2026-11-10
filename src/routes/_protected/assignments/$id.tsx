import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { AlertCircleIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Badge } from '#/components/ui/badge';
import { Button } from '#/components/ui/button';
import { Checkbox } from '#/components/ui/checkbox';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty';
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

    return { crumb: assignment.title };
  },
  pendingComponent: AssignmentPending,
  component: Assignment,
});

const dateFormat = new Intl.DateTimeFormat('en-MY', { dateStyle: 'long' });

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

  const tasks = assignment.activeGeneration?.tasks ?? [];
  const completedCount = tasks.filter((task) => task.completedAt).length;
  const percent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    // fill the window below the 4rem (h-16) layout header, so the task list scrolls on its own
    <div className="flex h-[calc(100svh-4rem)] flex-col gap-6 p-4 pt-0">
      <div className="flex shrink-0 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <h1 className="font-heading text-2xl font-semibold">{assignment.title}</h1>
            {assignment.latestStatus === 'pending' && (
              <Badge variant="secondary">Generating…</Badge>
            )}
            {assignment.latestStatus === 'failed' && (
              <Badge variant="destructive">Generation failed</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {assignment.dueDate ? `Due by ${dateFormat.format(assignment.dueDate)}` : 'No due date'}
          </p>
        </div>

        {tasks.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              role="progressbar"
              aria-label="Tasks completed"
              aria-valuemin={0}
              aria-valuemax={tasks.length}
              aria-valuenow={completedCount}
              className="bg-muted flex h-3 overflow-hidden rounded-sm"
            >
              {/* one segment per task, filled from the left by count rather than by which tasks are checked */}
              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex-1 transition-colors duration-300',
                    i < completedCount ? 'bg-primary' : 'bg-transparent',
                  )}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium">{percent}%</span> complete ·{' '}
              {completedCount} of {tasks.length} tasks done
            </p>
          </div>
        )}

        {assignment.latestStatus === 'failed' && (
          <Alert variant="destructive" className="max-w-lg">
            <AlertCircleIcon />
            <AlertTitle>Couldn't generate the task list</AlertTitle>
            <AlertDescription className="flex flex-col items-start">
              <p>{assignment.latestError ?? 'Generation was interrupted'}</p>
              {retry.isError && <p>{retry.error.message}</p>}
              <Button
                variant="outline"
                size="sm"
                className="mb-2"
                disabled={retry.isPending}
                onClick={() => retry.mutate()}
              >
                <RefreshCwIcon data-icon="inline-start" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="flex min-h-0 flex-col gap-2">
          <div className="min-h-0 divide-y overflow-y-auto rounded-lg border">
            {tasks.map((task) => {
              const isUpdating = isPending && variables?.taskId === task.id;

              return (
                <Field key={task.id} orientation="horizontal" className="px-4 py-3">
                  <Checkbox
                    id={task.id}
                    checked={!!task.completedAt}
                    disabled={isUpdating}
                    onCheckedChange={(checked) => mutate({ taskId: task.id, completed: checked })}
                  />
                  <FieldContent>
                    <FieldLabel
                      htmlFor={task.id}
                      className={cn(task.completedAt && 'text-muted-foreground line-through')}
                    >
                      {task.position + 1}. {task.title}
                    </FieldLabel>
                    {task.description && <FieldDescription>{task.description}</FieldDescription>}
                  </FieldContent>
                </Field>
              );
            })}
          </div>
        </div>
      ) : assignment.latestStatus === 'pending' ? (
        <Empty className="rounded-lg border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Loader2Icon className="animate-spin" />
            </EmptyMedia>
            <EmptyTitle>Generating your task list…</EmptyTitle>
            <EmptyDescription>This usually takes under a minute.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        assignment.latestStatus !== 'failed' && (
          <Empty className="rounded-lg border">
            <EmptyHeader>
              <EmptyTitle>No tasks yet</EmptyTitle>
            </EmptyHeader>
          </Empty>
        )
      )}
    </div>
  );
}

function AssignmentPending() {
  return (
    <div className="flex flex-col gap-6 p-4 pt-0">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-4 w-64" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
