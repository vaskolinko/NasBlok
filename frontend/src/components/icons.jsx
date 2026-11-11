function Icon({ children, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function HomeIcon() {
  return (
    <Icon>
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </Icon>
  )
}

export function WrenchIcon() {
  return (
    <Icon>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
    </Icon>
  )
}

export function VoteIcon() {
  return (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </Icon>
  )
}

export function BellIcon() {
  return (
    <Icon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  )
}

export function BuildingIcon() {
  return (
    <Icon>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
    </Icon>
  )
}

export function LogoutIcon() {
  return (
    <Icon size={18}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </Icon>
  )
}

// Logotip: zeleni kvadrat z oknom, kjer ena luč sveti rumeno.
export function Logo({ size = 36 }) {
  return (
    <span
      className="bg-brand rounded-[10px] grid grid-cols-2 gap-[3px] shrink-0"
      style={{ width: size, height: size, padding: size * 0.22 }}
      aria-hidden="true"
    >
      <span className="bg-accent rounded-[2px]" />
      <span className="bg-white rounded-[2px]" />
      <span className="bg-white rounded-[2px]" />
      <span className="bg-white rounded-[2px]" />
    </span>
  )
}
