import Image from 'next/image';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col items-center justify-center z-50">
      <div className="relative w-32 h-32 mb-8 animate-vibrate-3d">
        <img 
          src="/logo.png" 
          alt="Company Logo" 
          className="w-full h-full object-contain "
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-muted-foreground font-medium text-sm tracking-widest uppercase">Loading Workspace</p>
      </div>
    </div>
  );
}


