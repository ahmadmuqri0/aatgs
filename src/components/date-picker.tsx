import { CalendarIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { Calendar } from '#/components/ui/calendar';
import { Field, FieldDescription, FieldError, FieldLabel } from '#/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '#/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover';

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function parseIsoDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type DatePickerInputProps = {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: { message?: string };
};

export function DatePickerInput({
  id,
  label,
  description,
  placeholder = 'Pick a date',
  value,
  onChange,
  error,
}: DatePickerInputProps) {
  const selected = parseIsoDate(value);

  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(selected);

  function onOpenChange(next: boolean) {
    if (next) {
      setMonth(selected);
    }
    setOpen(next);
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        {/* read-only: dates are picked from the calendar, typed text is too ambiguous to parse */}
        <InputGroupInput
          id={id}
          value={formatDate(selected)}
          placeholder={placeholder}
          aria-invalid={!!error}
          readOnly
          className="cursor-pointer"
          onClick={() => onOpenChange(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenChange(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          {selected && (
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Clear date"
              onClick={() => onChange('')}
            >
              <XIcon />
            </InputGroupButton>
          )}
          <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id={`${id}-picker`}
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                </InputGroupButton>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={selected}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  if (!date) {
                    return;
                  }

                  onChange(toIsoDate(date));
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError errors={[error]} />}
    </Field>
  );
}
