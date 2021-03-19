import React, { Component } from "react";
import { hot } from "react-hot-loader";
import styled from "styled-components";
import svColors from "styles/colors";
import { flow } from "lodash/fp";
import withRedux from "components/hoc/withRedux";
import { FormattedMessage, injectIntl } from "react-intl";
import { diSetIndicator } from "store/actions";

const StyledDraggableIndicator = styled.div`
  position: fixed;
  z-index: 1999;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  background: white;
  border: solid 1px #777;
  border-radius: 0.5rem;
`;

const CellText = styled.span`
  font-weight: 800;
  color: ${svColors.grayFive};
  svg path {
    fill: ${svColors.grayFive};
  }
`;
const CellSubText = styled.span`
  font-style: italic;
  font-weight: normal;
  color: ${svColors.grayFour};
`;

export class DraggableIndicator extends Component {
  state = {
    mouse: {
      x: 0,
      y: 0,
    },
  };

  componentDidMount() {
    window.addEventListener("mousemove", this.trackMouse);
    window.addEventListener("mouseup", this.hideIndicator);
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.trackMouse);
    window.removeEventListener("mouseup", this.hideIndicator);
  }

  trackMouse = e => {
    const { isDragging } = this.props;
    if (isDragging) {
      this.setState({ mouse: { x: e.clientX, y: e.clientY } });
    }
  };

  hideIndicator = e => {
    diSetIndicator({ isDragging: false });
  };

  render() {
    const { isDragging, movingPerson, overSpace } = this.props;

    const { mouse } = this.state;
    if (!isDragging) {
      return null;
    }

    const style = {
      display: isDragging && mouse.x > 0 && mouse.y > 0 ? "block" : "none",
      left: mouse.x + "px",
      top: mouse.y + 20 + "px",
    };
    
    return (
      <StyledDraggableIndicator style={style}>
        <span>
          <FormattedMessage
            id="bos.allocation.moving"
            defaultMessage="Moving"
          />
        </span>
        {movingPerson && (
          <>
            <br />
            <CellText>
              {movingPerson.name ? movingPerson.name : movingPerson.fullName}
            </CellText>
            {movingPerson.jobTitle && (
              <>
                <br />
                <CellSubText>{movingPerson.jobTitle}</CellSubText>
              </>
            )}
          </>
        )}
        {overSpace && (
          <>
            <br />
            <span>
              <FormattedMessage id="bos.allocation.to" defaultMessage="to" />{" "}
            </span>
            <CellText>{overSpace.name}</CellText>
          </>
        )}
      </StyledDraggableIndicator>
    );
  }
}

export default flow(
  hot(module),
  injectIntl
)(
  withRedux(DraggableIndicator, {
    states: ["uiDraggableIndicator"],
  })
);
