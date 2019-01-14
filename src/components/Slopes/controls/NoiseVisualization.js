// @flow
import React, { useRef } from 'react';
import { useSpring, animated } from 'react-spring/hooks';

import { COLORS } from '../../../constants';
import {
  getValuesForBezierCurve,
  mixPoints,
} from '../../../helpers/line.helpers';
import { range, clamp } from '../../../utils';

import Svg from '../../Svg';

type Props = {
  width: number,
  height: number,
  value: number,
};

const generateRandomLines = (id, width, height, numOfPoints) =>
  range(numOfPoints)
    .map(i => {
      const p1 = [
        width * (i / numOfPoints),
        Math.round(Math.random() * height),
      ];

      const p2 = [
        width * ((i + 1) / numOfPoints),
        clamp(
          Math.round((Math.random() - 0.5) * (height * 0.75) + p1[1]),
          0,
          height
        ),
      ];

      return [p1, p2];
    })
    .filter(line => line);

const generateLine = (numOfPoints, smoothPoints, randomLines, ratio) => {
  return smoothPoints
    .reduce((acc, point, i) => {
      if (i === 0) {
        return acc;
      }

      const randomLine = randomLines.current[i];

      const previousPoint = mixPoints(
        smoothPoints[i - 1],
        randomLine[0],
        1 - ratio
      );

      const currentPoint = mixPoints(point, randomLine[1], 1 - ratio);

      acc.push(`M ${previousPoint.join(',')} L ${currentPoint.join(',')}`);
      return acc;
    }, [])
    .join('\n');
};

const NoiseVisualization = ({ width, height, value }: Props) => {
  const ratio = value / 100;

  const horizontalPadding = 30;
  const verticalPadding = 30;
  const innerWidth = width - horizontalPadding * 2;
  const innerHeight = height - verticalPadding * 2;

  // prettier-ignore
  const curve = {
    startPoint: [
      horizontalPadding,
      verticalPadding + innerHeight / 2
    ],
    controlPoint1: [
      horizontalPadding + innerWidth * 0.5,
      verticalPadding + innerHeight / 2
    ],

    endPoint: [
      horizontalPadding + innerWidth,
      verticalPadding + innerHeight / 2
    ],
  };

  const numOfPoints = Math.round(innerWidth / 5) + 1;

  const randomLines1 = useRef(
    generateRandomLines(1, width, height, numOfPoints)
  );
  const randomLines2 = useRef(
    generateRandomLines(2, width, height, numOfPoints)
  );
  const randomLines3 = useRef(
    generateRandomLines(3, width, height, numOfPoints)
  );
  const randomLines4 = useRef(
    generateRandomLines(4, width, height, numOfPoints)
  );
  const randomLines5 = useRef(
    generateRandomLines(5, width, height, numOfPoints)
  );

  const smoothPoints = range(numOfPoints).map(i => {
    const t = i / numOfPoints;
    return getValuesForBezierCurve(curve, t);
  });

  const spring1 = useSpring({
    ratio,
    config: {
      tension: 120,
      friction: 12,
    },
  });
  const spring2 = useSpring({
    ratio,
    config: {
      tension: 150,
      friction: 10,
    },
  });
  const spring3 = useSpring({
    ratio,
    config: {
      tension: 75,
      friction: 10,
    },
  });
  const spring4 = useSpring({
    ratio,
    config: {
      tension: 260,
      friction: 35,
    },
  });
  const spring5 = useSpring({
    ratio,
    config: {
      tension: 225,
      friction: 12,
    },
  });
  const spring6 = useSpring({
    ratio,
    config: {
      tension: 225,
      friction: 6,
    },
  });

  const lineColors = [
    COLORS.red[500],
    COLORS.yellow[500],
    COLORS.green[500],
    COLORS.blue[300],
    COLORS.pink[300],
  ];

  const lines = [
    randomLines1,
    randomLines2,
    randomLines3,
    randomLines4,
    randomLines5,
  ];

  const springs = [spring1, spring2, spring3, spring4, spring5, spring6];

  return (
    <Svg width={width} height={height}>
      {lineColors.map((color, index) => (
        <animated.path
          key={index}
          d={springs[index].ratio.interpolate(ratio =>
            generateLine(numOfPoints, smoothPoints, lines[index], ratio)
          )}
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeOpacity={1}
          style={{ mixBlendMode: 'color-dodge' }}
        />
      ))}
    </Svg>
  );
};

// $FlowFixMe
export default React.memo(NoiseVisualization);
