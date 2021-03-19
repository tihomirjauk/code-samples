import React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import * as allActions from "store/actions";

// Example: withRedux(BosProjectsPage, { states: ["bos"], actions: bosActions }))

const withRedux = (Component, { states, actions }) => {
  class withReduxDecorateWithStore extends React.Component {
    render() {
      return <Component {...this.props} />;
    }
  }

  const mapStateToProps = state => {
    const obj = {};
    states.forEach(item => {
      obj[item] = state[item];
    });
    return obj;
  };

  const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(actions || allActions, dispatch),
  });

  return connect(
    mapStateToProps,
    mapDispatchToProps,
    null
  )(withReduxDecorateWithStore);
};

export default withRedux;
