import React , { Component } from 'react';
import _ from 'lodash';

import {XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines,  MarkSeries, MarkSeriesCanvas, Hint} from 'react-vis';
import Highlight from './Highlight';

let bubbleData=[
  {x: 0, y: 0, size: 0},
  {x: 1, y: 10, size: 7},
  {x: 1.7, y: 12, size: 9},
  {x: 2.3, y: 5, size: 3},
  {x: 3, y: 10.5, size: 12},
  {x: 4.5, y: 3, size: 20},
  {x: 6, y: 10, size: 10},
  {x: 2.5, y: 7.5, size: 6},
  {x: 5, y: 1.5, size: 17},
  {x: 3.6, y: 1.8, size: 10},
  {x: 2.5, y: 7, size: 14},
  {x: 2, y: 5, size: 12},
  {x: 3, y: 10.5, size: 18},
  {x: 1.5, y: 7, size: 20},
  {x: 4, y: 5.8, size: 12},
  {x: 5.5, y: 3, size: 4},
  {x: 6, y: 2, size: 15},
  {x: 4.5, y: 7.8, size: 19},
  {x: 3.2, y: 8, size: 10},
  {x: 5.5, y: 10.3, size: 6},
  {x: 4, y: 2, size: 5},
  {x: 1.5, y: 7.2, size: 9}
];

const selectedData = [
  {x: 0, y: 8, size: 23 , selected: _.sample([true, false])},
  {x: 1, y: 5, size: 23 , selected: _.sample([true, false])},
  {x: 2, y: 4, size: 23 , selected: _.sample([true, false])},
  {x: 3, y: 9, size: 23 , selected: _.sample([true, false])},
  {x: 4, y: 1, size: 23 , selected: _.sample([true, false])},
  {x: 5, y: 7, size: 23 , selected: _.sample([true, false])},
  {x: 6, y: 6, size: 23 , selected: _.sample([true, false])},
  {x: 7, y: 3, size: 23 , selected: _.sample([true, false])},
  {x: 8, y: 2, size: 23 , selected: _.sample([true, false])},
  {x: 9, y: 0, size: 23 , selected: _.sample([true, false])}
];

class TradingBubble extends Component {

    state = {
    filter: null,
    hovered: null,
    highlighting: false,
    selectedPoints:[]
    }

  renderBubbleChosen(selectedBubbles){

        const xChosen= selectedBubbles.x;
        const yChosen= selectedBubbles.y;
        const sizeChosen= selectedBubbles.size;

      return(
        <p>Bubble
        <ul>
          <li>X Coordinate: {xChosen}</li>
          <li>Y Coordinate: {yChosen}</li>
          <li>Z Coordinate: {sizeChosen}</li>
        </ul>
        </p>
      );
    }

  componentDidMount(){

  }

  render(){
    const {filter, hovered, highlighting} = this.state;

        const highlightPoint = d => {
          if (!filter) {
            return false;
          }
          const leftRight = d.x <= filter.right && d.x >= filter.left;
          const upDown = d.y <= filter.top && d.y >= filter.bottom;

          return leftRight && upDown;
        };
        const numSelectedPoints = filter ? bubbleData.filter(highlightPoint) : [];
        //console.log(numSelectedPoints);

        const bubbleContainer = {
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll"
        }

    return(
      <div>
             <XYPlot
               width={1200}
               height={800}>
               <VerticalGridLines />
               <HorizontalGridLines />
               <XAxis  tickValues={[0, 1, 2, 3, 4, 5, 6]}
               style={{
                line: {stroke: 'rgb(152, 154, 160)'},
                ticks: {stroke: 'rgb(152, 154, 160)'},
                text: {stroke: 'none', fill: 'rgb(152, 154, 160)'}
        }} />
               <YAxis tickValues={[0, 3, 6, 9, 12]}
        style={{
                line: {stroke: 'rgb(152, 154, 160)'},
                ticks: {stroke: 'rgb(152, 154, 160)'},
                text: {stroke: 'none', fill: 'rgb(152, 154, 160)'}
        }}/>
               <Highlight
                 drag
                 onBrushStart={() => this.setState({highlighting: true})}
                 onBrush={area => this.setState({filter: area})}
                 onBrushEnd={area => this.setState({highlighting: false, filter: area})}
                 onDragStart={area => this.setState({highlighting: true})}
                 onDrag={area => this.setState({filter: area})}
                 onDragEnd={area => this.setState({highlighting: false, filter: area})}/>
               <MarkSeries
                 className="mark-series-example"
                 strokeWidth={2}
                 opacity="0.8"
                 sizeRange={[0, 40]}
                 style={{pointerEvents: highlighting ? 'none' : ''}}
                 colorType="literal"
                 getColor={d => d.selected || highlightPoint(d) ? '#EF5D28' : '#12939A'}
                 onValueMouseOver={d => this.setState({hovered: d})}
                 onValueMouseOut={d => this.setState({hovered: false})}
                 onValueClick={(d) => this.setState({ filter : {right:d.x,left:d.x,bottom:d.y,top:d.y}})}
                 data={selectedData}/>
               {hovered && <Hint value={hovered}/>}
             </XYPlot>
             <p>{`There are ${numSelectedPoints.length} selected points`}</p>
             <p style={bubbleContainer}>

               {numSelectedPoints.map(this.renderBubbleChosen)}

             </p>
           </div>
    );
  }

}

export default TradingBubble;
