import { handleActions } from "redux-actions";

import { uiDraggableIndicatorActions } from "store/actions/ui/uiDraggableIndicator";

export const initialState = {
  isDragging: false,
  movingPerson: null,
  overSpace: null,
  currentMove: null,
};

export default handleActions(
  {
    [uiDraggableIndicatorActions.DI_SET_INDICATOR]: (state, action) => {
      const params = action.payload;
      return {
        ...state,
        ...params,
      };
    },
  },
  initialState
);
