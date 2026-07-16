/** next/link shim — a plain anchor; navigation is a no-op in preview cards. */
import * as React from "react";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  prefetch?: boolean;
};

const Link = React.forwardRef<HTMLAnchorElement, Props>(function Link(
  { prefetch, ...rest },
  ref,
) {
  return <a ref={ref} {...rest} onClick={(e) => e.preventDefault()} />;
});

export default Link;
