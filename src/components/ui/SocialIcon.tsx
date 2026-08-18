import { Link2 } from 'lucide-react';

import { BRAND_PATHS } from './brand-paths';

type SocialIconProps = {
  platform: string;
  size?: number;
};

export function SocialIcon({ platform, size = 18 }: SocialIconProps) {
  const path = BRAND_PATHS[platform];

  if (!path) {
    return <Link2 size={size} aria-hidden="true" />;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
}
