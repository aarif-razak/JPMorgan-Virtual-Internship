import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';
import { Server } from 'tls';

/**
 * State declaration for <App />
 */
interface IState {
  data: ServerRespond[],
  showGraph: boolean,
}

/**
 * The parent element of the react app.
 * It renders title, button and Graph react element.
 */
class App extends Component<{}, IState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      // data saves the server responds.
      // We use this state to parse data down to the child element (Graph) as element property

      //on the initial state, we should make sure the graph isn't visible
      //so we set the showGraph property to false.
      data: [],
      showGraph: false,

    };
  }

  /**
   * Render Graph react component with state.data parse as property data
   */
  renderGraph() {
    //simple if to ensure that graph does NOT render until button is pushed
    if(this.state.showGraph){
      return (<Graph data={this.state.data}/>)
    }
    
  }

  /**
   * Get new data from server and update the state with the new data
   */
  getDataFromServer() {
    //iteration variables
    let x = 0;
    const interval = setInterval(() => {
      DataStreamer.getData((serverResponds: ServerRespond[]) => {
        //modify the state, when there is a response, then we can change state/render graph
        this.setState ({
          data: serverResponds ,
          showGraph: true ,
        });
      });
      //Data will be returned every 100 ms
      x++;
      if (x > 1000)
      {
        clearInterval(interval);
      } 
    }, 100);
  }
  /**
   * Render the App react component
   */
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            // when button is clicked, our react app tries to request
            // new data from the server.
            // As part of your task, update the getDataFromServer() function
            // to keep requesting the data every 100ms until the app is closed
            // or the server does not return anymore data.
            onClick={() => {this.getDataFromServer()}}>
            Start Streaming Data
          </button>
          {/* Once the button is clicked, we head down to renderGraph */}
            {/* Rendergraph is called, if statement added inside method to ensure proper rendering */}
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
