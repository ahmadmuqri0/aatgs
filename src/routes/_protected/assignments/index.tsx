import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FileTextIcon } from 'lucide-react';

import { CreateAssignmentDialog } from '#/components/create-assignment-dialog';
import { Badge } from '#/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '#/components/ui/empty';
import { Progress, ProgressLabel, ProgressValue } from '#/components/ui/progress';
import { Skeleton } from '#/components/ui/skeleton';
import { assignmentsQueryOptions } from '#/feat/assignments/assignments.functions';

export const Route = createFileRoute('/_protected/assignments/')({
  loader: async ({ context }) => {
    await context.queryClient.query({ ...assignmentsQueryOptions() });
  },
  pendingComponent: AssignmentsPending,
  component: Assignments,
});

const dateFormat = new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium' });

function Assignments() {
  const { data: assignments } = useSuspenseQuery(assignmentsQueryOptions());

  if (assignments.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileTextIcon />
          </EmptyMedia>
          <EmptyTitle>No assignments created</EmptyTitle>
          <EmptyDescription>
            Upload an assignment brief to get a step-by-step task list.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <CreateAssignmentDialog />
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex justify-end">
        <CreateAssignmentDialog />
      </div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle className="truncate">{assignment.title}</CardTitle>
              <CardDescription>
                {assignment.dueDate
                  ? `Due ${dateFormat.format(assignment.dueDate)}`
                  : 'No due date'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {assignment.latestStatus === 'pending' && (
                <Badge variant="secondary">Generating…</Badge>
              )}
              {assignment.latestStatus === 'failed' && (
                <Badge variant="destructive">Generation failed</Badge>
              )}
              {assignment.progress && (
                <Progress value={assignment.progress.completed} max={assignment.progress.total}>
                  <ProgressLabel>Tasks</ProgressLabel>
                  <ProgressValue>
                    {() => `${assignment.progress?.completed} / ${assignment.progress?.total}`}
                  </ProgressValue>
                </Progress>
              )}
              <p className="text-muted-foreground truncate">{assignment.fileName}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssignmentsPending() {
  return (
    <div className="grid auto-rows-min gap-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </div>
  );
}
