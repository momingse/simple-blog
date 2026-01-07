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
  searchKey: string;
  defaultSorting?: (data: T) => T;
};

const SearchBar = <T extends any[]>({
  className = "",
  placeholder = "Search",
  initialData,
  render,
  searchKey,
  defaultSorting,
}: SearchBarProps<T>) => {
  const [search, setSearch] = useState("");
  const [filteredBlogs, setFilteredBlogs] = useState(initialData);

  const fuzzySearch = useCallback(
    (query: string, data: T, searchKey?: string) => {
      const lowercaseQuery = query.toLowerCase();
      const queryLen = lowercaseQuery.length;
      const result: [number, number][] = [];
      for (let idx = 0; idx < data.length; idx++) {
        const target = (
          data[idx][searchKey as keyof T] as string
        ).toLowerCase();
        const targetLen = target.length;

        let score = 0;
        let j = 0;
        let gapSize = 1;

        if (targetLen < queryLen) continue;

        for (let i = 0; i < targetLen && j < queryLen; i++) {
          if (j < queryLen && target[i] === lowercaseQuery[j]) {
            score += 1 / gapSize;
            j++;
            gapSize = 1;
          } else {
            gapSize++;
          }
        }

        const noramizedScore = score;

        if (noramizedScore < 0.5 * queryLen) continue;

        result.push([idx, noramizedScore]);
      }

      return result.sort((a, b) => b[1] - a[1]).map((item) => data[item[0]]);
    },
    [],
  );

  const debounceSearch = useCallback(
    debounce((value, initialData, searchKey) => {
      if (value === "") {
        if (!defaultSorting) return setFilteredBlogs(initialData);
        return setFilteredBlogs(defaultSorting(initialData));
      }
      setFilteredBlogs(fuzzySearch(value, initialData, searchKey) as T);
    }, 350),
    [fuzzySearch],
  );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debounceSearch(value, initialData, searchKey);
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
