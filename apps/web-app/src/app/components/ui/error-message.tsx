export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="px-3 py-1 bg-destructive/5 border border-destructive/20 rounded-xl animate-in shake duration-500">
      <p className="text-sm text-destructive font-medium">{message}</p>
    </div>
  );
}
