import { Messages } from "@/lib/util";

export interface PaginationProps {
  onLoadMore?: () => void;
  messages: Messages;
  pageInfo?: any;
}

export function Pagination({ onLoadMore, messages }: PaginationProps) {
  return (
    <div className="flex justify-center flex-col items-center">
      <button
        type="button"
        onClick={onLoadMore}
        className="relative inline-flex  items-center px-4 py-2 border text-base font-medium rounded-md text-gray-700 bg-gray-50 hover:border-gray-300 cursor-pointer"
      >
        {messages["app.ui.loadMoreButton"]}
      </button>
    </div>
  );
}
