import { Control, FieldError } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import type { FieldValues, Path } from 'react-hook-form';

import styles from '../index.module.scss';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  type: string;
  placeholder: string;
  rules: any;
  error?: FieldError;
}

export default function FormInput<T extends FieldValues>({
  control,
  name,
  type,
  placeholder,
  rules,
  error
}: FormInputProps<T>) {
  return (
    <div className={styles.formGroup}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange, ...field } }) => (
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            className={error ? styles.error : ''}
            value={value ?? ''}
            onChange={onChange}
          />
        )}
      />
      {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
  );
}
