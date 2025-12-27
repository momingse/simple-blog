import { Fzearch } from "fzearch";
import {
  ChangeEvent,
  HTMLProps,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { debounce } from "../util/helper";
import { Search } from "lucide-react";

type SearchBarProps<T extends any[]> = {
  className?: HTMLProps<HTMLDivElement>["className"];
  placeholder?: string;
  render: (data: T) => ReactNode;
  initialData: T;
};

const SearchBar = <T extends any[]>({
  className = "",
  placeholder = "Search",
  initialData,
  render,
}: SearchBarProps<T>) => {
  const [search, setSearch] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState(initialData);

  const fzearch = useMemo(
    () =>
      new Fzearch(initialData, {
        keys: ["name"],
        dropoutRate: 0.75,
        caseSensitive: false,
      }),
    [initialData],
  );

  const debounceSearch = useCallback(
    debounce((value) => {
      if (value === "") return setFilteredBlogs(initialData);
      setFilteredBlogs(fzearch.search(value) as T);
    }, 350),
    [initialData],
  );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debounceSearch(value);
  };

  const children = useMemo(() => {
    return render(filteredBlogs);
  }, [filteredBlogs]);

  return (
    <>
      <div className={className + " relative"}>
        <div className="absolute inset-0 bg-black/5 blur-xl group-focus-within:bg-blue-500/5 transition-colors -z-10 rounded-2xl"></div>
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-lg focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm placeholder:text-gray-300"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {children}
    </>
  );
};

export default SearchBar;
