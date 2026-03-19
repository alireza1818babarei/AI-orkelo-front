import { useMemo } from "react";

const MIN_LOADER_INDEX = 1;
const MAX_LOADER_INDEX = 40;

const pickRandomLoaderClassName = () => {
  const randomIndex =
    Math.floor(Math.random() * (MAX_LOADER_INDEX - MIN_LOADER_INDEX + 1)) +
    MIN_LOADER_INDEX;
  return `loader_${randomIndex}`;
};

const Loader = () => {
  const loaderClassName = useMemo(() => pickRandomLoaderClassName(), []);

  return (
    <div className="loader-wrapper">
      <div className={loaderClassName}></div>
    </div>
  );
};

export default Loader;
