import { useEffect, useState } from "react";

export const useInfiniteScrollTop = (containerRef, totalPages, page, setPage, messages) => {
  const [data, setData] = useState(messages || []);

  useEffect(() => {
    if (messages) setData((prevData) => [...messages, ...prevData]);
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        containerRef.current &&
        containerRef.current.scrollTop === 0 &&
        page < totalPages
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    const ref = containerRef.current;
    if (ref) ref.addEventListener("scroll", handleScroll);

    return () => {
      if (ref) ref.removeEventListener("scroll", handleScroll);
    };
  }, [containerRef, totalPages, page, setPage]);

  return { data, setData };
};
