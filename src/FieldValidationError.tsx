type FieldValidationErrorProps = {
  errors?: Record<string, string[]>;
  field: string;
};

/** Displays every server validation message associated with a form field. */
export default function FieldValidationError({ errors, field }: FieldValidationErrorProps) {
  const messages = errors?.[field] ?? [];
  if (!messages.length) return null;

  return (
    <div role="alert" style={{ color: '#b91c1c', fontSize: '0.875rem', marginTop: '0.25rem' }}>
      {messages.map((message, index) => (
        <div key={`${field}-${index}`}>{message}</div>
      ))}
    </div>
  );
}
