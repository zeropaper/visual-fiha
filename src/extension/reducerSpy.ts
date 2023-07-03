import { type AnyAction } from "redux";

export function reducerSpy(
  reducer: (state: any, action: any) => any,
  name: string
) {
  return (state: unknown, action: AnyAction) => {
    const newState = reducer(state, action);
    console.info("[store] %s: %s", name, action.type, {
      state,
      payload: action.payload,
      newState,
    });
    return newState;
  };
}
