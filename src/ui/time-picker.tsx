import { type ComponentProps, forwardRef } from 'react';

type TimePickerProps = Omit<ComponentProps<'input'>, 'type'>;

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>((props, ref) => {
  return (
    <input
      type="time"
      className="h-10 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
      ref={ref}
      {...props}
    />
  );
});

export { TimePicker, type TimePickerProps };
