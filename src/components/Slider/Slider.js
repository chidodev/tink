// @flow
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { COLORS } from '../../constants';
import { clamp, normalize } from '../../utils';
import useBoundingBox from '../../hooks/bounding-box.hook';

import RectangularHandle from '../RectangularHandle';
import Notches from './Notches';

type Props = {
  value: number,
  updateValue: (num: number) => void,
  // Sliders work by default on a scale of 0-100
  min?: number,
  max?: number,
  width: number,
  height: number,
  numOfNotches?: number,
  handleWidth?: number,
  handleHeight?: number,
  isDisabled: boolean,
};

// TODO: Either use or remove HANDLE_BUFFER
const HANDLE_BUFFER = 0;

const Slider = ({
  value,
  updateValue,
  min = 0,
  max = 100,
  width,
  height,
  numOfNotches = 18,
  handleWidth = 30,
  handleHeight = 21,
  isDisabled,
}: Props) => {
  const [dragging, setDragging] = useState(false);
  const [sliderRef, sliderBoundingBox] = useBoundingBox();

  const updatePosition = ev => {
    if (!sliderBoundingBox || isDisabled) {
      return;
    }

    const deltaY = ev.clientY - sliderBoundingBox.top;
    const value = clamp(deltaY / height, 0, 1);

    const normalizedValue = normalize(value, 0, 1, max, min);

    updateValue(normalizedValue);
  };

  useEffect(
    () => {
      if (!dragging || !document.body || !sliderBoundingBox) {
        return;
      }

      document.body.style.cursor = 'grabbing';

      const handleMouseUp = () => {
        setDragging(false);
      };

      window.addEventListener('mouseup', handleMouseUp);

      window.addEventListener('mousemove', updatePosition);

      return () => {
        // $FlowIgnore
        document.body.style.cursor = null;

        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mousemove', updatePosition);
      };
    },
    [dragging]
  );

  const handleMarginLeft = (width - handleWidth) / 2;
  const handleMarginTop = -handleHeight / 2;

  const handleDisplacement = normalize(value, min, max, height, 0);
  const handleColor = isDisabled ? COLORS.gray[300] : COLORS.pink[300];

  return (
    <Wrapper ref={sliderRef} style={{ width, height }} onClick={updatePosition}>
      <Decorations>
        <Notches num={numOfNotches} position="left" />
        <Track />
        <Notches num={numOfNotches} position="right" />
      </Decorations>

      <HandleWrapper
        onMouseDown={ev => {
          ev.stopPropagation();

          if (isDisabled) {
            return;
          }

          setDragging(true);
        }}
        style={{
          width: handleWidth,
          height: handleHeight,
          left: handleMarginLeft,
          top: handleMarginTop,
          // Invisible padding, to make it easier to click
          padding: HANDLE_BUFFER,
          // We have to undo that padding in transform: translate, as well as apply
          // the displacement.
          transform: `translate(
            ${-HANDLE_BUFFER}px,
            ${handleDisplacement - HANDLE_BUFFER}px
          )`,
          cursor: isDisabled ? 'not-allowed' : dragging ? 'grabbing' : 'grab',
        }}
      >
        <RectangularHandle
          width={handleWidth}
          height={handleHeight}
          color={handleColor}
        />
      </HandleWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  border-radius: 3px;
`;

const HandleWrapper = styled.button`
  position: absolute;
  border: none;
  background: transparent;
  /*
    The wrapper is given some padding, so that user clicks don't have to be
    perfect. It's an invisible barrier around the handle.
    We want this barrier to be considered as part of the width, otherwise it'll
    shrink the actual handle! So we need to ditch border-box
  */
  box-sizing: content-box;

  &:focus:not(.focus-visible) {
    outline: none;
  }
`;

const Decorations = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
`;

const Track = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  margin: auto;
  width: 2px;
  height: 100%;
  background: ${COLORS.gray[100]};
  border-radius: 2px;
`;

// $FlowIgnore
export default React.memo(Slider);
