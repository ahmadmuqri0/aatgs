import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/assignments')({
  loader: () => ({ crumb: 'Assignments' }),
});
