export { cn } from 'cn';

export const getInitials = (name: string) => {
  const fullName = name.trim().split(' ');
  const initials = fullName.reduce((acc, curr, index) => {
    if (index === 0 || index === fullName.length - 1) {
      acc = `${acc}${curr.charAt(0).toUpperCase()}`;
    }
    return acc;
  }, '');
  return initials;
};
