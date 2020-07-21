import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      //schema will dictate how we can configure the table view of our graph
      //Expand it more information about our stocks
      price_abc: 'float',
      price_def: 'float',
      //This ratio must also be calculated!
      ratio: 'float',
      //When upper or lower bounds are crossed, the trigger_alert should be reached!
      trigger_alert: 'float',
      upper_bound: 'float',
      lower_bound: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      //Still the same type of graph we want
      elem.setAttribute('view', 'y_line');
      //no need to track the stocks as a whole, just our two individual and the ratio of the both
      //elem.setAttribute('column-pivots', '["stock"]');
      //Row pivots is our x axis... timestamp should be sufficent
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "lower_bound", "upper_bound", "trigger_alert"]');
      //Duplicated datapoint, average out all values and THEN treat them as a single point
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',  
        upper_bound: 'avg',
        lower_bound: 'avg',
        timestamp: 'distinct count',
        trigger_alert: 'avg',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        //we are now storing this into an ARRAY, since generateRow returns a single ROW object
        //This object contains all the data we need for populating the graph
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
