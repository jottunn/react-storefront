import { Messages } from "@/lib/util";
import { PageInfo } from "@/saleor/api";

export interface PaginationProps {
  pageInfo?: PageInfo;
  onLoadMore: () => void;
  totalCount?: number;
  itemsCount?: number;
  messages: Messages;
}

export function Pagination({
  pageInfo,
  onLoadMore,
  itemsCount,
  totalCount,
  messages,
}: PaginationProps) {
  console.log("pagination", pageInfo);
  if (!pageInfo || !pageInfo?.hasNextPage) {
    return null;
  }
  return (
    <nav className="mt-8 p-4 ">
      <div className="flex justify-center flex-col items-center">
        <button
          type="button"
          onClick={onLoadMore}
          className="relative inline-flex  items-center px-4 py-2 border text-base font-medium rounded-md text-gray-700 bg-gray-50 hover:border-gray-300 cursor-pointer"
        >
          {messages["app.ui.loadMoreButton"]}
        </button>
        {/* {itemsCount && totalCount && (
          <div className="text-sm text-gray-500 mt-2">
            {t.formatMessage(messages.paginationProductCounter, {
              totalItemsCount: totalCount,
              currentItemsCount: itemsCount,
            })}
          </div>
        )} */}
      </div>
    </nav>
  );
}
