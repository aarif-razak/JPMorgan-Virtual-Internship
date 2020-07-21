import { ServerRespond } from './DataStreamer';
import { ServerResponse } from 'http';

export interface Row {
  //we need to return the proper structure for our graph to use... this corresponds to
  //The schema from graph.tsx
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  //either the trigger_alert will happen, or it will not appear on the graph
  trigger_alert: number | undefined,
}

//Modified the generate row method to return the proper information.
export class DataManipulator {
  static generateRow(serverResponds: ServerRespond[]): Row {
    //stock ABC is the first element in our "serverReponds array"
    const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price)/2;
    //Therefore, stock DEF is the second element, aka element '1'
    const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price)/2;
    //Ratio is just... well... a ratio of the two stock prices.
    const ratio = priceABC / priceDEF;
    //Arbritrary upper and lowerbound restrictions
    const upperBound= 1 + 0.06;
    const lowerBound = 1 - 0.06;
    return {
      //Return the right values from the schema in the generate row function
      price_abc: priceABC,
      price_def: priceDEF,
      ratio,
      //Timestamp is an if else selecting which is the more recent timestamp
      timestamp: serverResponds[0].timestamp > serverResponds[1].timestamp ?
        serverResponds[0].timestamp : serverResponds[1].timestamp,
        upper_bound: upperBound,
        lower_bound: lowerBound,
        //Similar to the timestamp calculation, trigger_alert is just another logic check
        trigger_alert: (ratio > upperBound || ratio < lowerBound ) ? ratio: undefined,
    };
  }
}
