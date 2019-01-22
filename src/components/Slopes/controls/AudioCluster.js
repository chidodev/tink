import React, { useContext } from 'react';
import styled from 'styled-components';

import { UNIT } from '../../../constants';
import memoWhileIgnoring from '../../../hocs/memo-while-ignoring';

import TouchSliderIconControl from '../../TouchSliderIconControl';
import Spacer from '../../Spacer';
import { SlopesContext } from '../SlopesState';
import { InstrumentCluster } from '../../ControlPanel';
import ControlCompartment from '../../ControlCompartment/ControlCompartment';

import WavelengthVisualization from './WavelengthVisualization';
import AmplitudeVisualization from './AmplitudeVisualization';
import OctaveVisualization from './OctaveVisualization';

type Props = {
  width: number,
  wavelength: number,
  amplitudeAmount: number,
  octaveAmount: number,
  isWavelengthDisabled: boolean,
  isAmplitudeAmountDisabled: boolean,
  isOctaveAmountDisabled: boolean,
  setWavelength: (val: number) => void,
  setAmplitudeAmount: (val: number) => void,
  setOctaveAmount: (val: number) => void,
  isRandomized: boolean,
};

const AudioCluster = ({
  width,
  wavelength,
  amplitudeAmount,
  octaveAmount,
  setWavelength,
  setAmplitudeAmount,
  setOctaveAmount,
  isWavelengthDisabled,
  isAmplitudeAmountDisabled,
  isOctaveAmountDisabled,
  isRandomized,
}) => {
  const OUTER_BORDER_WIDTH = 1;
  const innerWidth = width - UNIT * 2 - OUTER_BORDER_WIDTH * 2;

  return (
    <InstrumentCluster direction="column">
      <ControlCompartment
        orientation="horizontal"
        numOfDoors={1}
        isDisabled={isAmplitudeAmountDisabled}
      >
        <TouchSliderIconControl
          value={amplitudeAmount}
          updateValue={setAmplitudeAmount}
          width={innerWidth}
          height={47}
          visualizationComponent={AmplitudeVisualization}
          isAnimated={!isRandomized}
          colorway="red"
        />
      </ControlCompartment>

      <Spacer size={UNIT} />

      <ControlCompartment
        orientation="horizontal"
        numOfDoors={1}
        isDisabled={isWavelengthDisabled}
      >
        <TouchSliderIconControl
          value={wavelength}
          updateValue={setWavelength}
          width={innerWidth}
          height={47}
          visualizationComponent={WavelengthVisualization}
          isAnimated={!isRandomized}
          colorway="yellow"
        />
      </ControlCompartment>

      <Spacer size={UNIT} />

      <ControlCompartment
        orientation="horizontal"
        numOfDoors={1}
        isDisabled={isOctaveAmountDisabled}
      >
        <TouchSliderIconControl
          value={octaveAmount}
          updateValue={setOctaveAmount}
          width={innerWidth}
          height={47}
          visualizationComponent={OctaveVisualization}
          isAnimated={!isRandomized}
          colorway="blue"
        />
      </ControlCompartment>
    </InstrumentCluster>
  );
};

const OptimizedAudioCluster = memoWhileIgnoring(
  ['setWavelength', 'setAmplitudeAmount', 'setOctaveAmount', 'isRandomized'],
  AudioCluster
);

const Container = ({ width }) => {
  const slopesParams = useContext(SlopesContext);

  return (
    <OptimizedAudioCluster
      width={width}
      wavelength={slopesParams.wavelength}
      amplitudeAmount={slopesParams.amplitudeAmount}
      octaveAmount={slopesParams.octaveAmount}
      setWavelength={slopesParams.setWavelength}
      setAmplitudeAmount={slopesParams.setAmplitudeAmount}
      setOctaveAmount={slopesParams.setOctaveAmount}
      isWavelengthDisabled={slopesParams.disabledParams.wavelength}
      isAmplitudeAmountDisabled={slopesParams.disabledParams.amplitudeAmount}
      isOctaveAmountDisabled={slopesParams.disabledParams.octaveAmount}
      isRandomized={slopesParams.isRandomized}
    />
  );
};

export default Container;
