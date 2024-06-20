import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div itemScope itemType="https://schema.org/BreadcrumbList">
      <div className="container flex gap-2 flex-wrap text-left py-4 px-8 ">
        {items.map((item, i) => (
          <div
            key={item.name}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {item.href ? (
              <Link
                href={item.href}
                itemProp="item"
                className="text-xs md:text-sm mt-2 font-medium text-gray-600 cursor-pointer text-center hover:text-green-600"
              >
                <span itemProp="name">{item.name}</span>
                <meta itemProp="position" content={(i + 1).toString()} />
              </Link>
            ) : (
              <span className="text-xs md:text-sm mt-2 font-medium text-gray-400">
                <span itemProp="name">{item.name}</span>
                <meta itemProp="position" content={(i + 1).toString()} />
              </span>
            )}
            {i < items.length - 1 && (
              <span className="text-gray-600 mt-1 md:mt-2 text-base ml-2">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs;
