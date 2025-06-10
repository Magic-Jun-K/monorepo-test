import { Control, FieldError, Controller } from 'react-hook-form';

import styles from '../index.module.scss';

interface FormInputProps {
  control: Control<any>;
  name: string;
  type: string;
  placeholder: string;
  rules: any;
  error?: FieldError;
}

export default function FormInput({
  control,
  name,
  type,
  placeholder,
  rules,
  error
}: FormInputProps) {
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
      {error && <span className={styles.errorMessage}>{error.message}</span>}
    </div>
  );
}
