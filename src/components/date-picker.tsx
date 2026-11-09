import { CalendarIcon } from 'lucide-react';
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

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

// 'YYYY-MM-DD' -> local Date (avoids the UTC shift of new Date('YYYY-MM-DD'))
function parseIsoDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// local Date -> 'YYYY-MM-DD'
function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// typed text -> 'YYYY-MM-DD', '' when empty, undefined when unparseable
function textToIsoDate(text: string) {
  if (!text.trim()) {
    return '';
  }

  const date = new Date(text);
  return isValidDate(date) ? toIsoDate(date) : undefined;
}

type DatePickerInputProps = {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  // 'YYYY-MM-DD', or '' when no date is set
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
  const [text, setText] = React.useState(formatDate(selected));
  const [prevValue, setPrevValue] = React.useState(value);

  // sync the text when value changes from outside (e.g. form reset), but not
  // when the change came from typing, so the user's text isn't reformatted mid-edit
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== textToIsoDate(text)) {
      setText(formatDate(selected));
      setMonth(selected);
    }
  }

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={text}
          placeholder={placeholder}
          aria-invalid={!!error}
          autoComplete="off"
          onChange={(e) => {
            const typed = e.target.value;
            setText(typed);

            if (!typed.trim()) {
              onChange('');
              return;
            }

            const date = new Date(typed);
            if (isValidDate(date)) {
              setMonth(date);
              onChange(toIsoDate(date));
            }
          }}
          onBlur={() => {
            // revert unparseable text to the committed value
            setText(formatDate(selected));
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <InputGroupButton
                  id={`${id}-picker`}
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
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

                  setText(formatDate(date));
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
