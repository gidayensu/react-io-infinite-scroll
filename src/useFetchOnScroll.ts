import { RefObject, useCallback, useRef } from "react";

export type TriggerPoint = "50%" | "75%" | "100%";

export interface FetchOnScrollProps {
  fetchNext: () => void;
  fetchMore?: boolean;
  numberOfItems: number;
  threshold?: number;
  rootMargin?: string;
  triggerPoint?: TriggerPoint;
  fetchIndex?: number,
  triggerIndex?: number
}

const getTriggerPointValue = (
  triggerPoint: TriggerPoint,
  numberOfItems: number
) => {
  const mapping: { [key: string]: number } = {
    "50%": Math.floor(numberOfItems * 0.5),
    "75%": Math.floor(numberOfItems * 0.75),
    "100%": numberOfItems - 1,
  };
  return mapping[triggerPoint];
};

const useFetchOnScroll = ({
  fetchNext,
  fetchMore = true,
  numberOfItems,
  threshold,
  rootMargin,
  triggerPoint,
  triggerIndex
}: FetchOnScrollProps) => {
  let ItemObserver = useRef<IntersectionObserver | null>(null);
  const fallbackObserver = useRef<IntersectionObserver | null>(null);
  const fallBackRefIndex = numberOfItems - 1;
  
  if (triggerPoint === "100%" ||
    triggerIndex === fallBackRefIndex ||
    (!triggerPoint && !triggerIndex)) {    // Assign the item observer to the fallback observer if the trigger point or index matches the fallback index, or if neither is provided.
    ItemObserver = fallbackObserver;
  }


 let itemRefIndex = getTriggerPointValue(
    (triggerPoint = "100%"),
    numberOfItems
  );

  if(triggerIndex) {
    itemRefIndex = Math.floor(triggerIndex)
  }

  const fetchOnScroll = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries.length === 0) {
        return;
      }
      if (entries[0].isIntersecting && fetchMore) {
        const entryId = entries[0].target.getAttribute("data-id") as string;

        const storedEntryId = sessionStorage.getItem("entryId");

        if (parseInt(entryId) === itemRefIndex) {
          sessionStorage.setItem("entryId", entryId);
          fetchNext();
        }

        if (
          parseInt(entryId) === fallBackRefIndex &&
          parseInt(storedEntryId as string) !== itemRefIndex
        ) {
          fetchNext();
        }
      }
    },
    [fetchNext, fetchMore, itemRefIndex, fallBackRefIndex]
  );

  const useIntersectionObserver = (
    observerRef: RefObject<IntersectionObserver | null>,
    iOcallback: IntersectionObserverCallback
  ) => {
    return useCallback(
      (node: HTMLElement | null) => {
        if (!node) {
          return;
        }

        if (observerRef.current) {
          observerRef.current.disconnect();
        }

        const observer = new IntersectionObserver(iOcallback, {
          threshold,
          rootMargin,
        });

        observerRef.current = observer;
        observer.observe(node);

        return () => {
          if (observerRef.current) {
            observerRef.current.disconnect();
          }
        };
      },
      [observerRef, iOcallback]
    );
  };

  const ItemRef = useIntersectionObserver(ItemObserver, fetchOnScroll);
  const fallbackRef = useIntersectionObserver(fallbackObserver, fetchOnScroll);

  return { ItemRef, fallbackRef, itemRefIndex, fallBackRefIndex };
};

export default useFetchOnScroll;
