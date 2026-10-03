export default function Alert({ type = "error", className = "", children }) {
  return children ? <p role="alert" data-type={type} className={className}>{children}</p> : null;
}