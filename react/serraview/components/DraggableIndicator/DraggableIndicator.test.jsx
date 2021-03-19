import React from "react";
import renderer from "react-test-renderer";
import { shallow } from "enzyme";
import { Locale } from "components";

import { DraggableIndicator } from "./DraggableIndicator.jsx";

const mockedPerson = {
  id: 123,
  name: "Pero Peric",
  jobTitle: "Perica",
};

const mockedSpace = {
  id: 234,
  name: "Shiny desk",
};

describe("Snapshots", () => {
  it("renders", () => {
    const tree = renderer.create(<DraggableIndicator />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it("should not exits without dragging", () => {
    const wrapper = shallow(<DraggableIndicator isDragging={false} />);
    expect(wrapper.props().children).toBeUndefined();
  });

  it("show while dragging", () => {
    const wrapper = shallow(<DraggableIndicator isDragging={true} />);
    expect(wrapper.props().children.length).toBe(3);
  });

  it("show with occupant", () => {
    const wrapper = shallow(
      <Locale code="en">
        <DraggableIndicator isDragging={true} movingPerson={mockedPerson} />
      </Locale>
    );
    expect(wrapper.render().text()).toEqual("MovingPero PericPerica");
  });

  it("show with occupant and space", () => {
    const wrapper = shallow(
      <Locale code="en">
        <DraggableIndicator
          isDragging={true}
          movingPerson={mockedPerson}
          overSpace={mockedSpace}
        />
      </Locale>
    );
    expect(wrapper.render().text()).toEqual(
      "MovingPero PericPericato Shiny desk"
    );
  });
});
