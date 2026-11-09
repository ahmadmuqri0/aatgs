import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import {
  assignmentsQueryOptions,
  createAssignment,
} from '#/feat/assignments/assignments.functions';
import { createAssignmentSchema, type CreateAssignmentInput } from '#/feat/assignments/schema';

export function CreateAssignmentDialog() {
  const [open, setOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<CreateAssignmentInput>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      brief: undefined,
    },
  });

  const queryClient = useQueryClient();

  const {
    mutate,
    error,
    isError,
    isPending,
    reset: resetMutation,
  } = useMutation({
    mutationFn: (input: CreateAssignmentInput) => {
      const formData = new FormData();
      formData.set('title', input.title);
      formData.set('dueDate', input.dueDate);
      formData.set('brief', input.brief);
      return createAssignment({ data: formData });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: assignmentsQueryOptions().queryKey });
      onOpenChange(false);
    },
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      resetMutation();
    }
  }

  function onSubmit(data: CreateAssignmentInput) {
    mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        New assignment
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New assignment</DialogTitle>
          <DialogDescription>
            Upload your assignment brief and we&apos;ll break it into tasks.
          </DialogDescription>
        </DialogHeader>
        <form id="create-assignment-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Software Engineering Report"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="dueDate"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                  <Input {...field} id={field.name} type="date" aria-invalid={fieldState.invalid} />
                  <FieldDescription>Optional</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="brief"
              control={control}
              render={({ field: { value: _value, onChange, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Assignment brief</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="file"
                    accept="application/pdf"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => onChange(e.target.files?.[0])}
                  />
                  <FieldDescription>PDF only, up to 10 MB</FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            {isError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Unable to create assignment</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form="create-assignment-form" disabled={isPending}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
