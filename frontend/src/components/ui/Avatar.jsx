import { initials, avatarColors } from '@/utils/format';

/** Blue-duotone initials avatar. */
export default function Avatar({ name = '', seed, lg = false, size }) {
  const { bg, fg } = avatarColors(name, seed);
  const style = { background: bg, color: fg };
  if (size) Object.assign(style, { width: size, height: size, fontSize: Math.round(size * 0.38) });
  return (
    <span className={`avatar ${lg ? 'lg' : ''}`} style={style}>
      {initials(name)}
    </span>
  );
}
