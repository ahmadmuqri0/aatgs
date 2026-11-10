import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { db } from '#/db';
import { assignment } from '#/db/schema';

import type { CreateAssignmentSchema } from './schema';

export const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';

export async function listAssignments(userId: string) {
  const rows = await db.query.assignment.findMany({
    where: { userId },
    columns: { id: true, title: true, dueDate: true, fileName: true },
    orderBy: (t, { sql, desc }) => [sql`${t.dueDate} asc nulls last`, desc(t.createdAt)],
    with: {
      activeGeneration: {
        columns: { id: true },
        with: { tasks: { columns: { completedAt: true } } },
      },
      generations: {
        columns: { status: true },
        orderBy: { createdAt: 'desc' },
        limit: 1,
      },
    },
  });

  return rows.map(({ activeGeneration, generations, ...assignment }) => ({
    ...assignment,
    latestStatus: generations[0]?.status ?? null,
    progress: activeGeneration
      ? {
          completed: activeGeneration.tasks.filter((t) => t.completedAt).length,
          total: activeGeneration.tasks.length,
        }
      : null,
  }));
}

export async function insertAssignment(userId: string, input: CreateAssignmentSchema) {
  const id = crypto.randomUUID();
  const fileKey = `${id}.pdf`;
  const filePath = path.join(UPLOADS_DIR, fileKey);

  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(filePath, new Uint8Array(await input.docs.arrayBuffer()));

  try {
    await db.insert(assignment).values({
      id,
      userId,
      title: input.title,
      dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00`) : null,
      fileName: input.docs.name,
      fileKey,
      fileSize: input.docs.size,
    });
  } catch (error) {
    await rm(filePath, { force: true });
    throw error;
  }

  return { id };
}
