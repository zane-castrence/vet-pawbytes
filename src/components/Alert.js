export default function Alert({ type = "error", children }) {
  return children ? <p role="alert" data-type={type}>{children}</p> : null;
}
