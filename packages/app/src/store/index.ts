import createStore from "zustand";
import { persist } from "zustand/middleware";

type State = {
  requests: Partial<Record<string, any>>;
};

const useStore = createStore<State>(
  persist((set) => ({ requests: {} }), { name: "urql-cache" })
);

export default useStore;
