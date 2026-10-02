export default function FormField({ label, error, as: Tag = "input", children, ...props }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={props.name}>{label}</label>
      <Tag id={props.name} aria-invalid={!!error} {...props}>{children}</Tag>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
