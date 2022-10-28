import React from "react";
import { render } from "react-dom";
import Map from "./Map";

class App extends React.Component {
  render() {
    return (
      <div>
        <Map />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
