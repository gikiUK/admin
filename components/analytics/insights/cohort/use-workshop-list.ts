import { useEffect, useState } from "react";
import { fetchWorkshops, type Workshop } from "@/lib/workshops/api";

const WORKSHOP_PAGE_SIZE = 200;

type State = {
  workshops: Workshop[] | null;
  totalCount: number | null;
};

export function useWorkshopList(): State {
  const [state, setState] = useState<State>({ workshops: null, totalCount: null });

  useEffect(() => {
    let cancelled = false;
    fetchWorkshops(1, WORKSHOP_PAGE_SIZE)
      .then((res) => {
        if (cancelled) return;
        setState({ workshops: res.workshops, totalCount: res.meta.total_count });
      })
      .catch(() => {
        if (!cancelled) setState({ workshops: [], totalCount: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
