// @flow
import React from 'react';
import { useSpring, animated } from 'react-spring/hooks';

import { COLORS } from '../../../constants';
import { plotAsPolarCoordinate } from '../../Slopes/Slopes.helpers';
import { range, mix } from '../../../utils';

import Svg from '../../Svg';

type Props = {
  width: number,
  height: number,
  value: number,
};

const MAX_DENSITY = (window.devicePixelRatio || 1) * 2;
const SPRING_CONFIG = {
  tension: 120,
  friction: 18,
};

const calculatePointsForLine = (value, width, height, rowIndex, numOfLines) => {
  const omegaRatio = value / 100;

  const numOfPointsPerLine = Math.round(width / MAX_DENSITY);

  const rowHeight = height / numOfLines;

  const rowNum = rowIndex + 1;

  const y = height * (rowNum / numOfLines) - rowHeight / 2;

  return range(numOfPointsPerLine).map(colIndex => {
    const x = colIndex * MAX_DENSITY;

    const [polarX, polarY] = plotAsPolarCoordinate({
      point: [x, y],
      width,
      height,
      sampleIndex: colIndex,
      samplesPerRow: numOfPointsPerLine,
      omegaRatio: 1,
      omegaRadiusSubtractAmount: height,
    });

    return [mix(polarX, x, omegaRatio), mix(polarY, y, omegaRatio)];
  });
};

const getPolylinePointsAsString = points =>
  points.map(point => `${point[0]},${point[1]}`).join(' ');

const getColorForLineIndex = (index: number) => {
  switch (index) {
    case 0:
      return COLORS.aqua[300];
    case 1:
      return COLORS.green[300];
    case 2:
      return COLORS.yellow[300];
    case 3:
      return COLORS.orange[300];
    default:
      return COLORS.red[300];
  }
};

const PolarAmountVisualization = ({ width, height, value }: Props) => {
  const innerWidth = width - 20;
  const innerHeight = height - 40;

  const numOfLines = 5;

  const spring = useSpring({ value, config: SPRING_CONFIG });

  return (
    <Svg width={innerWidth} height={innerHeight}>
      {range(numOfLines).map(rowIndex => (
        <animated.polyline
          key={rowIndex}
          points={spring.value.interpolate(value => {
            const line = calculatePointsForLine(
              value,
              innerWidth,
              innerHeight,
              rowIndex,
              numOfLines
            );
            return getPolylinePointsAsString(line);
          })}
          stroke={getColorForLineIndex(rowIndex)}
          strokeWidth={window.devicePixelRatio > 1 ? 2.5 : 2}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
};

export default PolarAmountVisualization;
