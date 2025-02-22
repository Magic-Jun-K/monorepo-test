import { Control, FieldError, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';

import styles from '../index.module.scss';

// 未显式指定 T 时，默认 T = FieldValues
// interface FormInputProps<T extends FieldValues = FieldValues> {
interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  type: string;
  placeholder: string;
  rules: RegisterOptions<T>;
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
        render={({ field }) => (
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            className={error ? styles.error : ''}
          />
        )}
      />
      {error && (
        <span className={styles.errorMessage}>
          {error.message}
        </span>
      )}
    </div>
  );
}
