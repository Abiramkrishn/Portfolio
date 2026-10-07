import type { SVGProps } from "react";

// A handful of 16px line icons drawn on the same 1.5px stroke as the schematics.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 8h11M9.5 4l4 4-4 4" />
  </Icon>
);
export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
  </Icon>
);
export const ArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 8h-11M6.5 4l-4 4 4 4" />
  </Icon>
);
export const Plus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 3v10M3 8h10" />
  </Icon>
);
export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
  </Icon>
);
export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 5h12M2 11h12" />
  </Icon>
);
export const Sun = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" />
  </Icon>
);
export const Moon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z" />
  </Icon>
);
export const Monitor = (p: IconProps) => (
  <Icon {...p}>
    <rect x="1.75" y="2.75" width="12.5" height="8.5" rx="1" />
    <path d="M5.5 14h5M8 11.25V14" />
  </Icon>
);
export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8.5l3 3 7-7" />
  </Icon>
);
export const Play = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 3.5v9l7-4.5-7-4.5z" />
  </Icon>
);
export const Pause = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 3.5v9M10.5 3.5v9" />
  </Icon>
);
export const Replay = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.75 8a5.25 5.25 0 109-3.7M11.75 1.5v2.8h-2.8" />
  </Icon>
);
export const StepBack = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 3.5v9M12 3.5L6.5 8 12 12.5z" />
  </Icon>
);
export const StepForward = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5v9M4 3.5L9.5 8 4 12.5z" />
  </Icon>
);
export const ListIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
  </Icon>
);
export const DiagramIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="1.5" y="2.5" width="4.5" height="3.5" rx=".5" />
    <rect x="10" y="10" width="4.5" height="3.5" rx=".5" />
    <path d="M6 4.25h2.5v7.5H10" />
  </Icon>
);
export const External = ArrowUpRight;
