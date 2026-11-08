/** ✅ Props are the component's interface: ask only for what you use. */
interface CustomerBadgeProps {
  readonly name: string;
  readonly isVip: boolean;
}

export function CustomerBadge({ name, isVip }: CustomerBadgeProps) {
  return (
    <span className={isVip ? "badge badge-vip" : "badge"}>
      {name}
      {isVip && " ★ VIP"}
    </span>
  );
}
