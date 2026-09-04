import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

/**
 * Multi-level "you are here" trail, e.g. Beranda / Episode / {title} / Outline.
 * The last item is rendered as plain text (current page); every earlier item
 * with an `href` is a link back up the hierarchy.
 */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-slate-300">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-700">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
