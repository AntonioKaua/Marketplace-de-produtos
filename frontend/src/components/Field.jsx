export default function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-sm font-medium text-red-600">{error}</span>}
    </label>
  );
}
