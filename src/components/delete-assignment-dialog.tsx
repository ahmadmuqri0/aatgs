import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog';
import { Button } from '#/components/ui/button';
import {
  assignmentQueryOptions,
  assignmentsQueryOptions,
  deleteAssignment,
} from '#/feat/assignments/assignments.functions';

export function DeleteAssignmentDialog({ id }: { id: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: () => deleteAssignment({ data: { id } }),
    onSuccess: async () => {
      // mark the list stale first so its loader refetches instead of showing the deleted card
      await queryClient.invalidateQueries({ queryKey: assignmentsQueryOptions().queryKey });
      await navigate({ to: '/assignments' });
      // removed rather than invalidated, since refetching a deleted assignment returns null
      queryClient.removeQueries({ queryKey: assignmentQueryOptions(id).queryKey });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <Trash2Icon data-icon="inline-start" />
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this assignment?</AlertDialogTitle>
          <AlertDialogDescription>
            Its task list and uploaded brief will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isError && <p className="text-destructive text-xs">{error.message}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={() => mutate()}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
