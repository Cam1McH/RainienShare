'use client';

export function AIBuilder() {
  return (
    <div 
      className="w-full h-full bg-[#0d0d18]"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
    >
      <h1 className="text-white p-4">AI Builder with CSS Grid</h1>
    </div>
  );
}