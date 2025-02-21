import { Button, Calendar, Loader, Popover, PopoverContent, PopoverTrigger, useToast } from '@/ui';
import { api } from '@/trpc/react';

interface Props {
  day: Date;
}

export default function CopyFromDay(props: Props) {
  const { day } = props;
  const today = new Date();

  const { toast } = useToast();
  const utils = api.useUtils();
  const { mutate: duplicate, isPending } = api.intake.duplicate.useMutation({
    onSuccess: () => utils.intake.forDay.invalidate({ day }),
    onError: (error) => {
      if (error.data?.code === 'NOT_FOUND') {
        toast({
          title: 'Nothing to do',
          description: error.message,
        });
      } else {
        toast({
          title: 'Something went wrong',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  });

  const handleDateSelected = (date: Date | undefined) => {
    if (!date) return;

    duplicate({ from_day: date, to_day: day });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Copy from another day
          {isPending ? <Loader size="icon" className="ml-2" /> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          initialFocus
          mode="single"
          disabled={{ after: today }}
          onSelect={handleDateSelected}
        />
      </PopoverContent>
    </Popover>
  );
}
