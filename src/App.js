import React from "react";

import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {apiResponse: ""};
  }

  callAPI() {
    fetch("http://127.0.0.1:5000")
      .then(res => res.text())
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
