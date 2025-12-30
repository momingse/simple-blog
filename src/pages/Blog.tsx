import { blogsInfo } from "../App";
import BlogList from "../components/BlogList";
import SearchBar from "../components/SearchBar";

export default function Blog() {
  return (
    <div className="space-y-2">
      {/* Refined Compact Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Writings <span className="text-gray-400">& Ideas</span>
          </h1>
        </div>
        <p className="text-sm text-gray-500 max-w-xs md:text-right leading-relaxed">
          Technical deep-dives and engineering philosophy.
        </p>
      </div>

      {/* Optimized Full-Width Search & Filter Section */}
      <SearchBar
        initialData={blogsInfo}
        render={(data) => <BlogList blogsInfo={data} />}
      />
    </div>
  );
}
