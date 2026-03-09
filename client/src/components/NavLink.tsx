import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface NavLinkProps extends Omit<LinkProps, 'href'> {
  href?: string;
  to?: string; // Support 'to' prop for compatibility
  children: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
  className?: string | ((props: { isActive: boolean }) => string);
  title?: string;
}

export default function NavLink({
  href,
  to,
  children,
  className,
  title,
  ...props
}: NavLinkProps) {
  const linkHref = href || to || '#';
  const pathname = usePathname();
  const isActive = pathname ? (pathname === linkHref || pathname.startsWith(`${linkHref}/`)) : false;

  const classNameStr =
    typeof className === 'function' ? className({ isActive }) : className;

  const childrenElement =
    typeof children === 'function' ? children({ isActive }) : children;

  return (
    <Link href={linkHref} className={classNameStr} title={title} {...props}>
      {childrenElement}
    </Link>
  );
}
