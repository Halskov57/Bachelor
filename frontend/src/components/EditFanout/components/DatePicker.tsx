import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  label?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Due Date',
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="dueDate">{label}</Label>
      <div className="relative">
        <Input
          id="dueDate"
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  );
};
