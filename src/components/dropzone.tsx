import { UploadIcon } from 'lucide-react';
import type * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';

import { cn } from '#/lib/utils';

type DropzoneProps = DropzoneOptions & {
  id?: string;
  className?: string;
  description?: React.ReactNode;
  'aria-invalid'?: boolean;
};

export function Dropzone({
  id,
  className,
  description,
  'aria-invalid': ariaInvalid,
  ...options
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(options);

  return (
    <div
      {...getRootProps({
        'aria-invalid': ariaInvalid,
        className: cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-input px-6 py-8 text-center transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[drag-active=true]:border-ring data-[drag-active=true]:bg-muted/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
          className,
        ),
      })}
      data-drag-active={isDragActive}
      aria-disabled={options.disabled}
    >
      <input {...getInputProps({ id })} />
      <div className="text-muted-foreground mb-3 flex size-10 items-center justify-center rounded-full border border-dashed">
        <UploadIcon className="size-4" />
      </div>
      <p className="text-sm font-medium">
        {isDragActive ? 'Drop the file here' : "Drag 'n' drop a file here, or click to select"}
      </p>
      {description && <p className="text-muted-foreground mt-0.5 text-xs">{description}</p>}
    </div>
  );
}
