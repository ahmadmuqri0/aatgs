import z from 'zod';

export const MAX_BRIEF_SIZE = 10 * 1024 * 1024; // 10 MB

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(1, 'Please enter a title'),
  // value of <input type="date">, empty when no due date is set
  dueDate: z.union([z.iso.date(), z.literal('')]),
  brief: z
    .instanceof(File, { message: 'Please upload the assignment brief' })
    .refine((file) => file.type === 'application/pdf', 'Only PDF files are accepted')
    .refine((file) => file.size <= MAX_BRIEF_SIZE, 'File must be 10 MB or smaller'),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
