type ClassNameCombiner = (...arg: any[]) => string;

const classNameCombiner: ClassNameCombiner = (...classNames) => {
  const filteredClassName = classNames
    .filter((className) => typeof className === "string" && className !== "")
    .reduce<string[]>((acc, className) => {
      return [...acc, ...className.split(" ")];
    }, []);

  if (filteredClassName.length === 0) return "";
  if (filteredClassName.length === 1) return classNames[0];

  return filteredClassName.join(" ");
};

export { classNameCombiner };
