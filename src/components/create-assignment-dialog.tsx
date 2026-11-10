import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircleIcon, FileTextIcon, PlusIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { DatePickerInput } from '#/components/date-picker';
import { Dropzone } from '#/components/dropzone';
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '#/components/ui/attachment';
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
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field';
import { Input } from '#/components/ui/input';
import {
  assignmentsQueryOptions,
  createAssignment,
} from '#/feat/assignments/assignments.functions';
import { createAssignmentSchema, type CreateAssignmentSchema } from '#/feat/assignments/schema';

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CreateAssignmentDialog() {
  const [open, setOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm<CreateAssignmentSchema>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: '',
      dueDate: '',
      docs: undefined,
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
    mutationFn: (input: CreateAssignmentSchema) => {
      const formData = new FormData();

      formData.set('title', input.title);
      formData.set('dueDate', input.dueDate);
      formData.set('docs', input.docs);

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

  function onSubmit(data: CreateAssignmentSchema) {
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
            Upload your assignment docs and we&apos;ll break it into tasks.
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
                <DatePickerInput
                  id={field.name}
                  label="Due date"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error}
                />
              )}
            />
            <Controller
              name="docs"
              control={control}
              render={({ field: { value, onChange, ...field }, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Assignment docs</FieldLabel>
                  <Dropzone
                    id={field.name}
                    accept={{ 'application/pdf': ['.pdf'] }}
                    multiple={false}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                    description="PDF only, up to 10 MB"
                    onDrop={(accepted, rejected) => onChange(accepted[0] ?? rejected[0]?.file)}
                    onFileDialogCancel={field.onBlur}
                  />
                  {value && (
                    <Attachment state={fieldState.invalid ? 'error' : 'done'} className="w-full">
                      <AttachmentMedia>
                        <FileTextIcon />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{value.name}</AttachmentTitle>
                        <AttachmentDescription>{formatFileSize(value.size)}</AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction
                          aria-label="Remove file"
                          onClick={() => onChange(undefined)}
                        >
                          <XIcon />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                  )}
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
