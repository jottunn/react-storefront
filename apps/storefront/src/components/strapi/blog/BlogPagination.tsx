import { defaultRegionQuery } from "@/lib/regions";
import { getMessages } from "@/lib/util";
import Link from "next/link";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function BlogPagination({ currentPage, totalPages }: BlogPaginationProps) {
  const messages = getMessages(defaultRegionQuery().locale, "app.blog");
  return (
    <div className="mt-36 mb-4">
      {currentPage > 1 && (
        <Link href={`/blog?page=${currentPage - 1}`} className="p-2 bg-gray-200 hover:bg-action-5">
          {messages["app.blog.previous"]}
        </Link>
      )}
      {currentPage < totalPages && (
        <Link href={`/blog?page=${currentPage + 1}`} className="p-2 bg-gray-200 hover:bg-action-5">
          {messages["app.blog.next"]}
        </Link>
      )}
      {currentPage > 1 && (
        <div className="text-sm pl-1 mt-4">
          {messages["app.blog.page"]} {currentPage} {messages["app.blog.pageof"]} {totalPages}
        </div>
      )}
    </div>
  );
}
