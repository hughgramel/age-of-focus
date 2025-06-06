export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0B1423]">
      {children}
    </div>
  );
} 