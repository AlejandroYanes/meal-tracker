'use client'

import { useRef } from 'react';
import { XIcon } from 'lucide-react';

import { Label } from './label';
import { useToast } from './use-toast';

interface Props {
  label: string;
  placeholder?: string;
  hint?: string;
  name?: string;
  accept?: string;
  allowClear?: boolean;
  disabled?: boolean;
  value?: string | null;
  onChange?: (files: File | null) => void;
}

export function FileInput(props: Props) {
  const { label, placeholder, hint, name, accept, allowClear = false, disabled = false, value, onChange } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length && onChange) {
      const file = event.target.files[0];
      if (file) {
        // check file size to be less than 4.5MB
        const maxSize = 4.5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast({
            title: 'File size is too big',
            description: 'File size should be up to 4.5MB',
            variant: 'destructive',
            duration: 5000,
          });

          if (fileInputRef.current) {
            // @ts-ignore
            fileInputRef.current.value = null;
          }
          return;
        }
      }

      onChange(file!);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-base leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </span>
      <Label htmlFor={name} aria-disabled={disabled}>
        <div aria-disabled={disabled} className="w-full h-10 text-left flex items-stretch cursor-pointer border rounded overflow-hidden hover:border-neutral-900 transition-all duration-150 ease-linear aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
          <div className="bg-neutral-300 text-neutral-950 flex items-center text-sm font-normal py-2.5 px-4 flex-shrink-0">
            Choose file
          </div>
          <div className="flex items-center py-2.5 px-2 overflow-hidden flex-1">
            <span data-active={!!value} className="font-normal text-sm w-full overflow-hidden text-ellipsis whitespace-nowrap text-neutral-500 data-[active=true]:text-neutral-950">
              {value ?? placeholder ?? 'No file chosen'}
            </span>
          </div>
          {allowClear && value ? (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (fileInputRef.current) {
                  // @ts-ignore
                  fileInputRef.current.value = null;
                }
                if (onChange) {
                  onChange(null);
                }
              }}
              className="bg-neutral-300 text-white flex justify-center items-center px-2"
            >
              <XIcon className="h-4 w-4 stroke-neutral-950" />
            </button>
          ) : null}
        </div>
      </Label>
      <input
        type="file"
        id={name}
        name={name}
        accept={accept}
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      {hint ? <p className="text-xs font-medium text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
