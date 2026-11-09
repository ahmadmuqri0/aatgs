import { defineRelations } from 'drizzle-orm';

import * as schema from './schema/index.ts';

export const relations = defineRelations(schema, (r) => ({
  user: {
    sessions: r.many.session({ from: r.user.id, to: r.session.userId }),
    accounts: r.many.account({ from: r.user.id, to: r.account.userId }),
    assignments: r.many.assignment({ from: r.user.id, to: r.assignment.userId }),
  },
  session: {
    user: r.one.user({ from: r.session.userId, to: r.user.id }),
  },
  account: {
    user: r.one.user({ from: r.account.userId, to: r.user.id }),
  },
  assignment: {
    user: r.one.user({ from: r.assignment.userId, to: r.user.id }),
    generations: r.many.generation({
      from: r.assignment.id,
      to: r.generation.assignmentId,
    }),
    activeGeneration: r.one.generation({
      from: r.assignment.activeGenerationId,
      to: r.generation.id,
    }),
  },
  generation: {
    assignment: r.one.assignment({
      from: r.generation.assignmentId,
      to: r.assignment.id,
    }),
    tasks: r.many.task({ from: r.generation.id, to: r.task.generationId }),
  },
  task: {
    generation: r.one.generation({ from: r.task.generationId, to: r.generation.id }),
  },
}));
