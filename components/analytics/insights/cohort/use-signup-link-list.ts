import { useEffect, useState } from "react";
import { fetchSignupLinks } from "@/lib/signup-links/api";
import type { SignupLink } from "@/lib/signup-links/types";

const PAGE_SIZE = 200;

type State = {
  links: SignupLink[] | null;
  totalCount: number | null;
};

export function useSignupLinkList(): State {
  const [state, setState] = useState<State>({ links: null, totalCount: null });

  useEffect(() => {
    let cancelled = false;
    fetchSignupLinks({ page: 1, per: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setState({ links: res.results, totalCount: res.meta.total_count });
      })
      .catch(() => {
        if (!cancelled) setState({ links: [], totalCount: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
