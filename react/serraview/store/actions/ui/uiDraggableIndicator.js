import { createAction } from "redux-actions";

export const uiDraggableIndicatorActions = {
  DI_SET_INDICATOR: "[UI] DI_SET_INDICATOR",
};

export const diSetIndicator = createAction(
  uiDraggableIndicatorActions.DI_SET_INDICATOR
);
