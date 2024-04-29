import { Fzearch } from "fzearch";
import { ChangeEvent, HTMLProps, useCallback, useMemo, useState } from "react";
import { debounce } from "../util/helper";

type SearchBarProps<T extends any[]> = {
  className?: HTMLProps<HTMLDivElement>["className"];
  placeholder?: string;
  render: (data: T) => React.ReactNode;
  initialData: T;
  compare: (data: T[number]) => string;
};

const SearchBar = <T extends any[]>({
  className = "",
  placeholder = "Search",
  initialData,
  render,
  compare,
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
      <div className={className}>
        <input
          type="text"
          placeholder={placeholder}
          className="w-full"
          value={search}
          onChange={handleSearch}
        />
      </div>
      {children}
    </>
  );
};

export default SearchBar;
