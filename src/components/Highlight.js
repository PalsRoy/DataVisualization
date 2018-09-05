import React from 'react';
import {AbstractSeries} from 'react-vis';
import {getAttributeScale} from '../utils/scales-utils';
import PropTypes from 'prop-types';

function getLocs(evt) {
  const xLoc = evt.type === 'touchstart' ? evt.pageX : evt.offsetX;
  const yLoc = evt.type === 'touchstart' ? evt.pageY : evt.offsetY;
  return {xLoc, yLoc};
}

class Highlight extends AbstractSeries {
  state = {
    dragging: false,
    brushArea: {top: 0, right: 0, bottom: 0, left: 0},
    brushing: false,
    startLocX: 0,
    startLocY: 0,
    dragArea: null
  };

  _getDrawArea(xLoc, yLoc) {
    const {startLocX, startLocY} = this.state;
    const {
      disableX,
      disableY,
      innerWidth,
      innerHeight,
      marginLeft,
      marginRight,
      marginBottom,
      marginTop
    } = this.props;
    const plotHeight = innerHeight + marginTop + marginBottom;
    const plotWidth = innerWidth + marginLeft + marginRight;

    return {
      bottom: disableY ? plotHeight : Math.max(startLocY, yLoc),
      left: disableX ? 0 : Math.min(xLoc, startLocX),
      right: disableX ? plotWidth : Math.max(startLocX, xLoc),
      top: disableY ? 0 : Math.min(yLoc, startLocY)
    };
  }

  _getDragArea(xLoc, yLoc) {
    const {disableX, disableY} = this.props;
    const {startLocX, startLocY, dragArea} = this.state;

    return {
      bottom: dragArea.bottom + (disableY ? 0 : (yLoc - startLocY)),
      left: dragArea.left + (disableX ? 0 : (xLoc - startLocX)),
      right: dragArea.right + (disableX ? 0 : (xLoc - startLocX)),
      top: dragArea.top + (disableY ? 0 : (yLoc - startLocY))
    };
  }

  _clickedOutsideDrag(xLoc, yLoc) {
    const {dragArea, brushArea} = this.state;
    const clickedOutsideDragX = dragArea && ((xLoc < brushArea.left) || (xLoc > brushArea.right));
    const clickedOutsideDragY = dragArea && ((yLoc < brushArea.top) || (yLoc > brushArea.bottom));
    return clickedOutsideDragX || clickedOutsideDragY;
  }

  _convertAreaToCoordinates(brushArea) {
    const {disableX, disableY, marginLeft} = this.props;
    const xScale = getAttributeScale(this.props, 'x');
    const yScale = getAttributeScale(this.props, 'y');

    // Ensure that users wishes are being respected about which scales are evaluated
    // this is specifically enabled to ensure brushing on mixed categorical and linear
    // charts will run as expected

    if (disableX && disableY) {
      return {};
    }

    if (disableX) {
      return {
        bottom: yScale.invert(brushArea.bottom),
        top: yScale.invert(brushArea.top)
      };
    }

    if (disableY) {
      return {
        left: xScale.invert(brushArea.left - marginLeft),
        right: xScale.invert(brushArea.right - marginLeft)
      };
    }

    // NOTE only continuous scales are supported for brushing/getting coordinates back
    return {
      bottom: yScale.invert(brushArea.bottom),
      left: xScale.invert(brushArea.left - marginLeft),
      right: xScale.invert(brushArea.right - marginLeft),
      top: yScale.invert(brushArea.top)
    };
  }

  onParentMouseDown(e) {
    const {onBrushStart, onDragStart, drag} = this.props;
    const {dragArea} = this.state;
    const {xLoc, yLoc} = getLocs(e.nativeEvent);

    const startArea = (dragging, resetDrag) => {
      const emptyBrush = {
        bottom: yLoc,
        left: xLoc,
        right: xLoc,
        top: yLoc
      };
      this.setState({
        dragging,
        brushArea: dragArea && !resetDrag ? dragArea : emptyBrush,
        brushing: !dragging,
        startLocX: xLoc,
        startLocY: yLoc
      });
    };

    const clickedOutsideDrag = this._clickedOutsideDrag(xLoc, yLoc);

    if ((drag && !dragArea) || !drag || clickedOutsideDrag) {
      startArea(false, clickedOutsideDrag);

      if (onBrushStart) {
        onBrushStart(e);
      }
      return;
    }

    if (drag && dragArea) {
      startArea(true, clickedOutsideDrag);
      if (onDragStart) {
        onDragStart(e);
      }
    }
  }

  onParentTouchStart(e) {
    e.preventDefault();
    this.onParentMouseDown(e);
  }

  stopBrushing(e) {
    const {brushing, dragging, brushArea} = this.state;
    // Quickly short-circuit if the user isn't brushing in our component
    if (!brushing && !dragging) {
      return;
    }
    const {onBrushEnd, onDragEnd, drag} = this.props;

    const noHorizontal = Math.abs(brushArea.right - brushArea.left) < 5;
    const noVertical = Math.abs(brushArea.top - brushArea.bottom) < 5;
    // Invoke the callback with null if the selected area was < 5px
    const isNulled = noVertical || noHorizontal;
    // Clear the draw area
    this.setState({
      brushing: false,
      dragging: false,
      brushArea: drag ? brushArea : {top: 0, right: 0, bottom: 0, left: 0},
      startLocX: 0,
      startLocY: 0,
      dragArea: drag && !isNulled && brushArea
    });

    if (!drag && brushing && onBrushEnd) {
      onBrushEnd(!isNulled ? this._convertAreaToCoordinates(brushArea) : null);
    }

    if (drag && onDragEnd) {
      onDragEnd(!isNulled ? this._convertAreaToCoordinates(brushArea) : null);
    }
  }

  onParentMouseMove(e) {
    const {onBrush, onDrag, drag} = this.props;
    const {brushing, dragging} = this.state;
    const {xLoc, yLoc} = getLocs(e.nativeEvent);
    if (brushing) {
      const brushArea = this._getDrawArea(xLoc, yLoc);
      this.setState({brushArea});

      if (onBrush) {
        onBrush(this._convertAreaToCoordinates(brushArea));
      }
    }

    if (drag && dragging) {
      const brushArea = this._getDragArea(xLoc, yLoc);
      this.setState({brushArea});
      if (onDrag) {
        onDrag(this._convertAreaToCoordinates(brushArea));
      }
    }
  }

  onParentTouchMove(e) {
    e.preventDefault();
    this.onParentMouseMove(e);
  }

  render() {
    const {
      color,
      className,
      innerWidth,
      innerHeight,
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      opacity
    } = this.props;
    const {brushArea: {left, right, top, bottom}} = this.state;

    return (
      <g
        className={`${className} rv-highlight-container`}
        onMouseUp={e => this.stopBrushing(e)}
        onMouseLeave={e => this.stopBrushing(e)}
        // preventDefault() so that mouse event emulation does not happen
        onTouchEnd={e => {
          e.preventDefault();
          this.stopBrushing(e);
        }}
        onTouchCancel={e => {
          e.preventDefault();
          this.stopBrushing(e);
        }}
        onContextMenu={e => e.preventDefault()}
        onContextMenuCapture={e => e.preventDefault()}
        >
        <rect
          className="rv-mouse-target"
          fill="black"
          opacity="0"
          x="0"
          y="0"
          width={Math.max((marginLeft + marginRight) + innerWidth, 0)}
          height={Math.max((marginTop + marginBottom) + innerHeight, 0)}
        />
        <rect
          className="rv-highlight"
          pointerEvents="none"
          opacity={opacity}
          fill={color}
          x={left}
          y={top}
          width={Math.max(0, right - left)}
          height={Math.max(0, bottom - top)}
        />
      </g>
    );
  }
}

Highlight.displayName = 'HighlightOverlay';
Highlight.defaultProps = {
  color: 'rgb(77, 182, 172)',
  disableX: false,
  disableY: false,
  opacity: 0.3
};

Highlight.propTypes = {
  ...AbstractSeries.propTypes,
  disableX: PropTypes.bool,
  disableY: PropTypes.bool,
  onBrushStart: PropTypes.func,
  onDragStart: PropTypes.func,
  onBrush: PropTypes.func,
  onDrag: PropTypes.func,
  onBrushEnd: PropTypes.func,
  onDragEnd: PropTypes.func
};

export default Highlight;
