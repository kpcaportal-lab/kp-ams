import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavLinkProps extends LinkProps {
  children: React.ReactNode | ((isActive: boolean) => React.ReactNode);
  className?: string | ((isActive: boolean) => string);
  title?: string;
}

export default function NavLink({
  href,
  children,
  className,
  title,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const classNameStr =
    typeof className === 'function' ? className(isActive) : className;

  const childrenElement =
    typeof children === 'function' ? children(isActive) : children;

  return (
    <Link href={href} className={classNameStr} title={title} {...props}>
      {childrenElement}
    </Link>
  );
}
