export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="privacy-card p-7 text-center text-[#a1a1aa]">
      {message}
    </div>
  );
}
