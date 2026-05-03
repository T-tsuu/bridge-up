// components/ui/Avatar.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<AvatarSize, { container: string; text: string; px: number }> = {
  sm: { container: "size-8  text-xs",  text: "text-xs",  px: 32  },
  md: { container: "size-10 text-sm",  text: "text-sm",  px: 40  },
  lg: { container: "size-14 text-base",text: "text-base", px: 56 },
  xl: { container: "size-20 text-lg",  text: "text-lg",  px: 80  },
};

interface AvatarProps {
  src?: string | null;
  alt: string;
  initials?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ src, alt, initials, size = "md", className }: AvatarProps) {
  const { container, text, px } = sizeMap[size];

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0",
        "bg-bridge-blue text-muted-dark flex items-center justify-center font-heading font-semibold select-none",
        container,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <span aria-hidden="true" className={cn("uppercase leading-none", text)}>
          {initials
            ? initials.slice(0, 2)
            : alt
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
        </span>
      )}
      <span className="sr-only">{alt}</span>
    </div>
  );
}