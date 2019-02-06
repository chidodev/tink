// @flow
import React from 'react';
import styled from 'styled-components';

import { UNIT, COLORS } from '../../../constants';

import { SlopesContext } from '../SlopesState';
import { InstrumentCluster } from '../../ControlPanel';
import Toggle from '../../Toggle';
import HiddenVisualization from './HiddenVisualization';

import type { ToggleParameterAction } from '../SlopesState';

type Props = {
  width: number,
  height: number,
  isUsable: boolean,
  enableMirrored: boolean,
  toggleParameter: ToggleParameterAction,
};

const HiddenCluster = ({
  width,
  height,
  enableMirrored,
  toggleParameter,
  isUsable,
}: Props) => {
  const innerWidth = width - UNIT * 2;
  const innerHeight = height - UNIT * 2;

  return (
    <InstrumentCluster style={{ borderRadius: 4 }}>
      <Wrapper style={{ width: innerWidth, height: innerHeight }}>
        <VisualizationWrapper>
          <HiddenVisualization isEnabled={enableMirrored} />
        </VisualizationWrapper>

        <ToggleWrapper>
          <Toggle
            width={innerWidth / 2 - 6}
            height={20}
            isToggled={enableMirrored}
            isDisabled={!isUsable}
            handleToggle={() => toggleParameter('enableMirrored')}
          />
        </ToggleWrapper>
      </Wrapper>
    </InstrumentCluster>
  );
};

// $FlowIgnore
const OptimizedHiddenCluster = React.memo(HiddenCluster);

const HiddenClusterContainer = ({ width, height, isUsable }: any) => {
  const slopesParams = React.useContext(SlopesContext);

  return (
    <OptimizedHiddenCluster
      width={width}
      height={height}
      isUsable={isUsable}
      enableMirrored={slopesParams.enableMirrored}
      toggleParameter={slopesParams.toggleParameter}
    />
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: ${COLORS.gray[900]};
  border-radius: 4px;
`;

const VisualizationWrapper = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ToggleWrapper = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  margin: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default HiddenClusterContainer;
