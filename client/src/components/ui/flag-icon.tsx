interface FlagIconProps {
  code: string; // country code like "us", "de", "ru"
  size?: number;
  className?: string;
}

export function FlagIcon({ code, size = 20, className = "" }: FlagIconProps) {
  return (
    <img
      src={`/flags/${code}.svg`}
      alt={code.toUpperCase()}
      width={size}
      height={size}
      className={`inline-block rounded-full ${className}`}
      loading="lazy"
    />
  );
}
