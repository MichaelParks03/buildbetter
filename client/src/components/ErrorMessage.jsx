function ErrorMessage({ message }) {
  if (!message) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-2xl border border-red-900 bg-red-950/60 p-4 text-sm text-red-100"
    >
      {message}
    </div>
  )
}

export default ErrorMessage
