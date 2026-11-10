import z from 'zod';

export const MAX_DOCS_SIZE = 10 * 1024 * 1024;

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1, 'Please enter a title'),
  dueDate: z.union([z.iso.date(), z.literal('')]),
  docs: z
    .instanceof(File, { message: 'Please upload the assignment brief' })
    .refine((file) => file.type === 'application/pdf', 'Only PDF files are accepted')
    .refine((file) => file.size <= MAX_DOCS_SIZE, 'File must be 10 MB or smaller'),
});

export type CreateAssignmentSchema = z.infer<typeof createAssignmentSchema>;
