import { useCallback, useEffect, useRef } from "react";
import useFetchData from "./hooks/useFetchData";
type ZeroToOne = number & { readonly __brand: unique symbol };

interface FetchOnScrollProps<T> {
  fetchData: () => void;
  fetchMore?: boolean;
  numberOfItems: number;
  threshold?: number;
  rootMargin?: string;
  triggerPercentage:  ZeroToOne //percentage of items scrolled requiring a trigger

  data: T[];
}




const FetchOnScroll = ({
  fetchData,
  fetchMore = true,
  numberOfItems,
  threshold,
  rootMargin,
  triggerPercentage,
  data
}: FetchOnScrollProps) => {
  const primaryItemObserver = useRef<IntersectionObserver | null>(null);
  const lastItemObserver = useRef<IntersectionObserver | null>(null); //used to check if the mid item was not captured by the primaryItemObserver intersection observer

  const fetchOnScroll = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries.length === 0) {
        return;
      }
      if (entries[0].isIntersecting && fetchMore) {
        const entryId = entries[0].target.getAttribute("data-id") as string;

        const storedEntryId = sessionStorage.getItem("entryId");

        if (parseInt(entryId) === Math.floor(numberOfItems / 2)) {
          //check if the entered Item is the mid item

          sessionStorage.setItem("entryId", entryId); //store data-id of mid item
          fetchData();
        }

        if (
          parseInt(entryId) === numberOfItems - 1 &&
          parseInt(storedEntryId as string) !== Math.floor(numberOfItems / 2)
        ) {
          //check if entered Item is last Item and stored data-id is not mid item based on the current lenght of items

          fetchData();
        }
      }
    },
    [fetchData, fetchMore, numberOfItems]
  );
  
  const observerRef = useCallback(
    (
      node: HTMLElement | null,
      observer?: React.RefObject<IntersectionObserver | null>
    ) => {
      //   if (!node || !observer) {
      //     return;
      //   }

      observer?.current?.disconnect();
      if (observer) {
        observer.current = new IntersectionObserver(fetchOnScroll, {
          threshold: threshold,
          rootMargin: rootMargin,
        });
        observer.current.observe(node as HTMLElement);
      }
    },
    [fetchOnScroll, threshold, rootMargin]
  );

  const lastItemRef = observerRef(null, lastItemObserver);
  const primaryItemRef = observerRef(null, primaryItemObserver);

  useEffect(() => {
    const disconnectPrimaryObserver = primaryItemObserver.current?.disconnect();
    const disconnectLastItemObserver = lastItemObserver.current?.disconnect();

    return () => disconnectPrimaryObserver && disconnectLastItemObserver;
  }, []);

  return(
    <> 
    {data.map((item, key) => (
                <p
                  
                  key={key}
                 
                  data-id = {key}
                  ref={
                    key === Math.floor(data.length / 2)
                      ? primaryItemRef
                      : key === Math.floor(data.length -1)
                      ? lastItemRef
                      : undefined

                  }
                >
         
                {item}
                </p>
              ))}
    </>
  )

};

export default FetchOnScroll;



