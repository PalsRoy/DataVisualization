import React , { Component } from 'react';


import {XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines,  MarkSeries, MarkSeriesCanvas, Hint} from 'react-vis';
import Highlight from './Highlight';

let bubbleData=[
  {x: 1, y: 10, size: 30},
  {x: 1.7, y: 12, size: 10},
  {x: 2, y: 5, size: 1},
  {x: 3, y: 15, size: 12},
  {x: 4.5, y: 3, size: 4},
  {x: 3, y: 15, size: 15},
  {x: 1.5, y: 7, size: 4}
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
        <li>Bubbles
        <ul>
          <li>{xChosen}</li>
          <li>{yChosen}</li>
          <li>{sizeChosen}</li>
        </ul>
       </li>
      );
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
        console.log(numSelectedPoints);

    return(
      <div>
             <XYPlot
               width={300}
               height={300}>
               <VerticalGridLines />
               <HorizontalGridLines />
               <XAxis />
               <YAxis />
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
                 sizeRange={[30, 30]}
                 style={{pointerEvents: highlighting ? 'none' : ''}}
                 colorType="literal"
                 getColor={d => highlightPoint(d) ? '#EF5D28' : '#12939A'}
                 onValueMouseOver={d => this.setState({hovered: d})}
                 onValueMouseOut={d => this.setState({hovered: false})}
                 data={bubbleData}/>
               {hovered && <Hint value={hovered}/>}
             </XYPlot>
             <p>{`There are ${numSelectedPoints.length} selected points`}</p>
             <p>

               {numSelectedPoints.map(this.renderBubbleChosen)}

             </p>
           </div>
    );
  }

}

export default TradingBubble;
