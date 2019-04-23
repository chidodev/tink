// @flow
import React from 'react';
import styled from 'styled-components';
import { Spring, animated } from 'react-spring';

import { random } from '../../utils';

import type { SwatchData } from '../../types';

type Props = {
  swatch: SwatchData,
  size: number,
  isSelected: boolean,
};

const Swatch = ({ size, isSelected, swatch }: Props) => {
  const { colors, backgroundColor } = swatch;

  return (
    <Wrapper style={{ width: size, height: size, backgroundColor }}>
      {colors.map((color, index) => {
        const { x, y, ballSize } = swatch.getBallPositions(color, size);

        return (
          <Spring
            key={index}
            native
            to={{
              transform: `translate(
                ${isSelected ? x : 0}px,
                ${isSelected ? y : 0}px
              )`,
            }}
            config={{
              tension: 500,
              friction: 20,
              mass: ballSize * 0.5,
            }}
          >
            {style => (
              <Ball
                color={color}
                style={{
                  width: ballSize,
                  height: ballSize,
                  backgroundColor: color,
                  borderColor: backgroundColor,
                  ...style,
                }}
              />
            )}
          </Spring>
        );
      })}
      <Border style={{ borderColor: backgroundColor }} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  border-radius: 50%;
  /* Hide the balls if they spring out of the container */
  overflow: hidden;
`;

const Ball = styled(animated.div)`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  background-color: ${props => props.color};
  border-radius: 50%;
  border: 2px solid;
`;

const Border = styled.div`
  position: absolute;
  z-index: 2;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border: 3px solid;
  border-radius: 50%;
`;

export default Swatch;
