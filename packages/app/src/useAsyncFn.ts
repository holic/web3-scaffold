import { DependencyList, useCallback, useRef, useState } from "react";
import { useMountedState } from "react-use";
import {
  FunctionReturningPromise,
  PromiseType,
} from "react-use/lib/misc/types";

// Use this in place of react-use useAsyncFn, because the original swallows
// promise rejections from the returned promise.

export type AsyncState<T> =
  | {
      loading: boolean;
      error?: undefined;
      value?: undefined;
    }
  | {
      loading: true;
      error?: Error | undefined;
      value?: T;
    }
  | {
      loading: false;
      error: Error;
      value?: undefined;
    }
  | {
      loading: false;
      error?: undefined;
      value: T;
    };

type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> =
  AsyncState<PromiseType<ReturnType<T>>>;

export type AsyncFnReturn<
  T extends FunctionReturningPromise = FunctionReturningPromise
> = [StateFromFunctionReturningPromise<T>, T];

export function useAsyncFn<T extends FunctionReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  initialState: StateFromFunctionReturningPromise<T> = { loading: false }
): AsyncFnReturn<T> {
  const lastCallId = useRef(0);
  const isMounted = useMountedState();
  const [state, set] =
    useState<StateFromFunctionReturningPromise<T>>(initialState);

  const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    const callId = ++lastCallId.current;

    if (!state.loading) {
      set((prevState) => ({ ...prevState, loading: true }));
    }

    const promise = fn(...args);
    promise.then(
      (value) => {
        if (isMounted() && callId === lastCallId.current) {
          set({ value, loading: false });
        }
      },
      (error) => {
        if (isMounted() && callId === lastCallId.current) {
          set({ error, loading: false });
        }
      }
    );
    return promise as ReturnType<T>;
  }, deps);

  return [state, callback as unknown as T];
}
