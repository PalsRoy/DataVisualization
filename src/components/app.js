import React, { Component } from 'react';
import TradingBubble from './trading-bubble';

export default class App extends Component {
  render() {
    return (
      <div id="graphContainer">
       <TradingBubble/>
      </div>
    );
  }
}
