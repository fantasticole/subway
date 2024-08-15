import React from "react";
import {fetchSubwayApi} from "./utils/subway_apis";

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {apiResponse: ""};
  }

  callAPI() {
    fetchSubwayApi()
      .then(res => this.setState({ apiResponse: res }));
  }

  componentDidMount() {
    this.callAPI();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>res: {this.state.apiResponse}</p>
        </header>
      </div>
    );
  }
}

export default App;
