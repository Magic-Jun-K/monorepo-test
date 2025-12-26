import { Control, FieldError, Controller } from 'react-hook-form';
import type { FieldValues, Path, RegisterOptions } from 'react-hook-form';

import styles from '../index.module.scss';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  type: string;
  placeholder: string;
  rules?: Partial<RegisterOptions<T, Path<T>>>;
  error: FieldError | undefined;
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
        {...(rules !== undefined && { rules })}
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
