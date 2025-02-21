'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker';

import { cn } from './helpers';
import { Button } from './button';
import { Calendar, type CalendarProps } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface DatePickerProps extends Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>{
  date: Date | undefined;
  onChange: (date: Date | undefined) => void;
  className?: string;
  modal?: boolean;
  disablePopup?: boolean;
  shortDate?: boolean;
}

export function DatePicker(props: DatePickerProps) {
  const { date, onChange, className, modal, disablePopup, shortDate, ...calendarProps } = props;
  const [open, setOpen] = useState(false);

  const handleOpen = (__open: boolean) => {
    if (disablePopup) return;
    setOpen(__open);
  };

  return (
    <Popover modal={modal} open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal border-input dark:border-slate-500 px-3',
            !date && 'text-muted-foreground',
            disablePopup && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? <span className="text-sm">{format(date, shortDate ? 'PP' : 'PPP')}</span> : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto">
        <Calendar
          initialFocus
          mode="single"
          {...calendarProps}
          selected={date}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}

interface DatePickerWithRangeProps extends Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'> {
  dates: DateRange;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  onChange: (dates: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange(props: DatePickerWithRangeProps) {
  const { dates, onChange, className, ...calendarProps } = props;

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !dates && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dates?.from ? (
              dates.to ? (
                <>
                  {format(dates.from, 'LLL dd, y')} -{' '}
                  {format(dates.to, 'LLL dd, y')}
                </>
              ) : (
                format(dates.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dates?.from}
            selected={dates}
            onSelect={onChange}
            numberOfMonths={2}
            {...calendarProps}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

