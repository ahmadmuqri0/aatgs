import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { authClient } from '#/lib/auth-client';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data, error } = await authClient.signIn.email(input);
      if (error) throw new Error(error.message || 'unable to login');
      return data;
    },
    onSuccess: () => navigate({ to: '/' }),
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      password: string;
    }) => {
      const { data, error } = await authClient.signUp.email(input);
      if (error) throw new Error(error.message || 'Unable to create account');
      return data;
    },
    onSuccess: () => navigate({ to: '/' }),
  });
}
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message || 'Unable to log out');
    },
    onSuccess: async () => {
      queryClient.clear();
      await router.navigate({ to: '/login' });
      await router.invalidate();
    },
  });
}
