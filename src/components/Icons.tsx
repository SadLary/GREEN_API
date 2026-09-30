import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function TelegramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M21.7 3.4a1.5 1.5 0 0 0-1.5-.2L3.1 9.8c-1.2.5-1.2 1.2-.2 1.5l4.4 1.4 1.7 5.1c.2.7.1 1 .8 1 .5 0 .8-.2 1-.4l2.2-2.1 4.5 3.3c.8.5 1.4.3 1.6-.8L22 5c.3-1 .1-1.4-.3-1.6ZM9 12.4l8.6-5.5c.4-.2.8-.1.5.2l-7.1 6.4-.3 3.4L9 12.4Z"
      />
    </svg>
  );
}

export function SendIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M3.5 4.2 21 11.1c1 .4 1 1.4 0 1.8L3.5 19.8c-.8.3-1.6-.4-1.3-1.2l1.7-5.1 9.2-1.5-9.2-1.5-1.7-5.1c-.3-.8.5-1.5 1.3-1.2Z"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M11 5a1 1 0 1 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5Z" />
    </svg>
  );
}

export function ExitIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M5 3h7a1 1 0 1 1 0 2H6v14h6a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm11.3 5.3a1 1 0 0 1 1.4 0l3 3a1 1 0 0 1 0 1.4l-3 3a1 1 0 0 1-1.4-1.4l1.3-1.3H10a1 1 0 1 1 0-2h7.6l-1.3-1.3a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}
