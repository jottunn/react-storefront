import { SearchBar } from "@/components/nav/components/Search/SearchBar";

export default function NotFound() {
  return (
    <div className="bg-black h-[65vh] text-center justify-center flex flex-col items-center">
      <div className="container py-40 text-white">
        <h2 className="text-xl font-bold">404 | Not Found | Gone Riding</h2>
        <div className="flex justify-center py-6">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
