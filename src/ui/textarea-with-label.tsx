import { forwardRef } from 'react';

import { Label } from './label';
import { Textarea, type TextareaProps } from './textarea';
import { RenderIf } from './render-if';
import { cn } from './helpers';

interface Props extends TextareaProps {
  label: string;
  error?: string | boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
}

const TextareaWithLabel = forwardRef<HTMLTextAreaElement, Props>((props, ref) => {
  const { label, id, error, className, inputClassName, labelClassName, required, ...rest } = props;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className={labelClassName}>{label} {required ? <span>*</span> : null}</Label>
      <Textarea
        ref={ref}
        id={id}
        className={cn(!!error ? 'border-destructive' : null, inputClassName)}
        required={required}
        {...rest}
      />
      <RenderIf condition={!!error && typeof error === 'string'}>
        <span className="text-sm text-destructive-foreground">{error}</span>
      </RenderIf>
    </div>
  );
});

export { TextareaWithLabel };
