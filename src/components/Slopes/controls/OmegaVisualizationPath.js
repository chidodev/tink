// @flow
import React from 'react';

import {
  mixPoints,
  getValuesForBezierCurve,
} from '../../../helpers/line.helpers';

const circleCurve = {
  start: [16, 24],
  curve1: {
    controlPoint1: [4, 24],
    controlPoint2: [4, 8],
    endPoint: [16, 8],
  },
  curve2: {
    startPoint: [16, 24],
    controlPoint1: [28, 8],
    controlPoint2: [28, 24],
    endPoint: [16, 24],
  },
};

const twistCurve = {
  start: circleCurve.start,
  curve1: {
    controlPoint1: circleCurve.curve2.controlPoint2,
    controlPoint2: circleCurve.curve2.controlPoint1,
    endPoint: circleCurve.curve1.endPoint,
  },
  curve2: {
    startPoint: circleCurve.curve2.startPoint,
    controlPoint1: circleCurve.curve1.controlPoint2,
    controlPoint2: circleCurve.curve1.controlPoint1,
    endPoint: circleCurve.curve2.endPoint,
  },
};

type Props = {
  color: string,
  mix: number,
};

const pathEasingCurve = {
  startPoint: [0, 0],
  endPoint: [1, 1],
  controlPoint1: [-1, 0],
};

const OmegaVisualizationPath = ({ color, mix }: Props) => {
  // Our top curve is a simple linear mix
  const topCurve = [
    mixPoints(
      circleCurve.curve1.controlPoint2,
      twistCurve.curve1.controlPoint2,
      mix
    ),
    mixPoints(
      circleCurve.curve2.controlPoint1,
      twistCurve.curve2.controlPoint1,
      mix
    ),
  ];

  // our bottom curve gets eased on a bezier curve, to keep the whole transition
  // from seeing too artificial/inorganic.
  const [, bottomCurveMix] = getValuesForBezierCurve(pathEasingCurve, mix);
  const bottomCurve = [
    mixPoints(
      circleCurve.curve1.controlPoint1,
      twistCurve.curve1.controlPoint1,
      bottomCurveMix
    ),
    mixPoints(
      circleCurve.curve2.controlPoint2,
      twistCurve.curve2.controlPoint2,
      bottomCurveMix
    ),
  ];

  return (
    <path
      d={`
        M ${circleCurve.start.toString()}
        C ${bottomCurve[0].toString()}
          ${topCurve[0].toString()}
          ${circleCurve.curve1.endPoint.toString()}
        C ${topCurve[1].toString()}
          ${bottomCurve[1].toString()}
          ${circleCurve.curve2.endPoint.toString()}
        Z
      `}
      stroke={color}
      strokeWidth={2}
      style={{
        mixBlendMode: 'color-dodge',
      }}
    />
  );
};

export default OmegaVisualizationPath;
