import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = 28, className = "", priority = false }: LogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 overflow-hidden rounded-lg shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="LooPR Logo"
        width={size}
        height={size}
        priority={priority}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
