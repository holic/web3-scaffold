import createStore from "zustand";
import { persist } from "zustand/middleware";

type State = {
  // eslint-disable-next-line
  requests: Partial<Record<string, any>>;
};

const useStore = createStore<State>(
  persist(() => ({ requests: {} }), { name: "urql-cache" })
);

export default useStore;
