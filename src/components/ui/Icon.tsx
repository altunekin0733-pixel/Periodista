import {
  Car,
  Clapperboard,
  Cpu,
  Drama,
  FlaskConical,
  Flame,
  Gavel,
  Globe,
  GraduationCap,
  HeartPulse,
  Leaf,
  Mic,
  Music,
  Newspaper,
  Plane,
  Shapes,
  Star,
  TrendingUp,
  Trophy,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { createElement } from 'react';

/**
 * Kategori ikonları veritabanında ad olarak saklanır. Tasarımdaki Material
 * Symbols adları korunur; karşılıkları burada SVG bileşenlere bağlanır.
 * Böylece dışarıdan ikon fontu indirmeye gerek kalmaz.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  newspaper: Newspaper,
  sports_soccer: Trophy,
  public: Globe,
  trending_up: TrendingUp,
  memory: Cpu,
  theater_comedy: Drama,
  eco: Leaf,
  mic: Mic,
  category: Shapes,
  star: Star,
  local_fire_department: Flame,
  restaurant: UtensilsCrossed,
  movie: Clapperboard,
  science: FlaskConical,
  gavel: Gavel,
  health_and_safety: HeartPulse,
  directions_car: Car,
  travel_explore: Plane,
  school: GraduationCap,
  music_note: Music,
};

export function resolveIcon(name: string | null | undefined): LucideIcon {
  return (name && ICON_MAP[name]) || Newspaper;
}

type CategoryIconProps = {
  name: string | null | undefined;
  size?: number;
  className?: string;
};

export function CategoryIcon({ name, size = 16, className }: CategoryIconProps) {
  // createElement kullanılıyor: ikon bileşeni render sırasında seçildiği için
  // JSX'te büyük harfli bir yerel değişkene atamak kalıcı kimlik sorununa yol açar.
  return createElement(resolveIcon(name), {
    size,
    strokeWidth: 2,
    className,
    'aria-hidden': true,
  });
}
