import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { db } from '#/db';
import { assignment } from '#/db/schema';

import type { CreateAssignmentSchema } from './schema';

export const UPLOADS_DIR = process.env.UPLOADS_DIR || 'uploads';
// a generation still pending after this was interrupted (e.g. a server restart); must exceed the
// worst case in generation.server.ts: 4 attempts × 2 min timeout + backoff ≈ 8.5 min
const STALE_GENERATION_MS = 10 * 60 * 1000;

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
        columns: { status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        limit: 1,
      },
    },
  });

  return rows.map(({ activeGeneration, generations, ...assignment }) => ({
    ...assignment,
    latestStatus: generationStatus(generations[0]),
    progress: activeGeneration
      ? {
          completed: activeGeneration.tasks.filter((t) => t.completedAt).length,
          total: activeGeneration.tasks.length,
        }
      : null,
  }));
}

export async function viewAssignment(id: string, userId: string) {
  const row = await db.query.assignment.findFirst({
    where: { id, userId },
    columns: { id: true, title: true, dueDate: true, fileName: true, createdAt: true },
    with: {
      activeGeneration: {
        columns: { id: true, model: true },
        with: {
          tasks: {
            columns: {
              id: true,
              position: true,
              title: true,
              description: true,
              completedAt: true,
            },
            orderBy: { position: 'asc' },
          },
        },
      },
      generations: {
        columns: { status: true, error: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        limit: 1,
      },
    },
  });

  if (!row) {
    return null;
  }

  const { generations, ...rest } = row;
  const latest = generations[0];

  return {
    ...rest,
    latestStatus: generationStatus(latest),
    // only meaningful when it failed; a stale pending row has no message of its own
    latestError: latest?.status === 'failed' ? latest.error : null,
  };
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

function generationStatus(latest?: {
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}) {
  if (!latest) {
    return null;
  }

  if (
    latest.status === 'pending' &&
    Date.now() - latest.createdAt.getTime() > STALE_GENERATION_MS
  ) {
    return 'failed';
  }

  return latest.status;
}
