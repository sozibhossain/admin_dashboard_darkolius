export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/LogInbg.png')" }} // Ensure the path is correct
      />
      
      {/* Dark Overlay Layer */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: "rgba(0, 0, 0, 0.54)" }} 
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}