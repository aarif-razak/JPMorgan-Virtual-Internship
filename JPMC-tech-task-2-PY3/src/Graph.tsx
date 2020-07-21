import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[],
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element to attach the table from the DOM.
    //Now PerspectiveViewerElement SHOULD behave like an html element
    const elem=  document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      
      elem.load(this.table);
      //View, with the input of a 'y-line' argument will allow us to see a continuous line 
      elem.setAttribute('view', 'y_line');
      //Column pivots using the ['stock'] argument lets use differentiate between the two stocks
      //Since it is defined in our schema object, we can call it as such
      elem.setAttribute('column-pivots', '["stock"]');
      //Row piviots = x axis, same vein as in the column pivots, also defined in our schema
      elem.setAttribute('row-pivots', '["timestamp"]');
      // Columns will allow us to focus o na particualr part of a stocks data along the y-axis
      elem.setAttribute('columns','["top_ask_price"]');
      //Aggregates will help us with duplicate data, notice the *distinct* keywords in SQL!
      // Additonally, anything duplicated will be averaged out before being treated as a single point.
      elem.setAttribute('aggregates', `
      {"stock": "distinct count",
      "top_ask_price":"avg",
      "top_bid_price": "avg",
      "timestamp":"distinct count"}`)

      elem.load(this.table);
    }
  }

  componentDidUpdate() {
    // Everytime the data props is updated, insert the data into Perspective table
    if (this.table) {
      // As part of the task, you need to fix the way we update the data props to
      // avoid inserting duplicated entries into Perspective table again.
      this.table.update(this.props.data.map((el: any) => {
        // Format the data from ServerRespond to the schema
        return {
          stock: el.stock,
          top_ask_price: el.top_ask && el.top_ask.price || 0,
          top_bid_price: el.top_bid && el.top_bid.price || 0,
          timestamp: el.timestamp,
        };
      }));
    }
  }
}

export default Graph;
