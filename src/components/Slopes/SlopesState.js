// @flow
import React, { useRef, useState } from 'react';

import { sample } from '../../utils';

// $FlowFixMe
export const SlopesContext = React.createContext({});

const DEFAULT_PEAKS_CURVE = {
  startPoint: [0.5, 0],
  controlPoint1: [0.5, 0.5],
  endPoint: [0.5, 1],
};

type Props = {
  children: React$Node,
};

const getRandomSeed = () =>
  // Seeds are 16-bit, with 65,536 possible values (from 0-65535)
  Math.round(Math.random() * 65535);

const getRandomSliderValue = () =>
  // All sliders ought to be 0-100
  Math.round(Math.random() * 100);

const getRandomBooleanValue = () => sample([true, false]);

const getRandomPeaksCurve = () => {
  // Let's have some sensible "standard" curves to sample from.
  const presetCurves = [
    DEFAULT_PEAKS_CURVE,
    {
      // This one is a straight line along the top
      startPoint: [0, 1],
      controlPoint1: [0.5, 1],
      endPoint: [1, 1],
    },
    {
      // Rainbow
      startPoint: [0.1, 0.2],
      controlPoint1: [0.5, 1],
      endPoint: [0.9, 0.2],
    },
    {
      // Diagonal line (polar corkscrew)
      startPoint: [0, 1],
      controlPoint1: [0.55, 0.55],
      endPoint: [1, 0],
    },
  ];

  // Let's also add a chance to generate one totally at random
  const useRandomCurve = Math.random() > 0.5;

  return useRandomCurve
    ? {
        startPoint: [Math.random(), Math.random()],
        controlPoint1: [Math.random(), Math.random()],
        endPoint: [Math.random(), Math.random()],
      }
    : sample(presetCurves);
};

export const SlopesProvider = ({ children }: Props) => {
  // High-level "Parameters", tweakable settings
  const defaultSeed = getRandomSeed();
  const [seed, setSeed] = useState(defaultSeed);

  const [perspective, setPerspective] = useState(40);
  const [spikyness, setSpikyness] = useState(0);
  const [polarAmount, setPolarAmount] = useState(0);
  const [omega, setOmega] = useState(0);
  const [splitUniverse, setSplitUniverse] = useState(0);
  const [personInflateAmount, setPersonInflateAmount] = useState(25);
  const [wavelength, setWavelength] = useState(25);
  const [waterBoilAmount, setWaterBoilAmount] = useState(100);
  const [ballSize, setBallSize] = useState(50);

  const [enableOcclusion, setEnableOcclusion] = useState(true);
  const [enableLineBoost, setEnableLineBoost] = useState(false);

  const [peaksCurve, setPeaksCurve] = useState(DEFAULT_PEAKS_CURVE);

  const isRandomized = useRef(false);

  const wrappedSetter = setter => args => {
    isRandomized.current = false;
    setter(args);
  };

  // We have a "randomize" button that sets arbitrary values for some controls.
  // This triggers every visualization to run at once, which is glorious on my
  // iMac Pro, but is likely a stuttery trainwreck on most machines.
  //
  // Two things we can do to improve this situation:
  // - Only update ~half of the properties on every press, but a random half
  //   each time (this seems like a good idea anyway?)
  // - Disable _certain_ visualizations. The ballSize visualization, for
  //   example, seems surprisingly resource-hungry, and I can just do a hard cut
  //   between balls.
  const randomize = () => {
    isRandomized.current = true;

    setSeed(getRandomSeed());
    setPerspective(getRandomSliderValue());

    // Some parameters don't need to be updated on every tick.
    if (Math.random() > 0.5) {
      setPeaksCurve(getRandomPeaksCurve());
    }
    if (Math.random() > 0.25) {
      setPersonInflateAmount(getRandomSliderValue());
    }
    if (Math.random() > 0.25) {
      setWavelength(getRandomSliderValue());
    }

    // Certain parameters make more sense at one of the extremities, so let's
    // increase the chances of those.
    const polarAmount = sample([0, 0, 0, 100, 100, getRandomSliderValue()]);
    setPolarAmount(polarAmount);

    if (polarAmount > 0 && Math.random() > 0.5) {
      setBallSize(getRandomSliderValue());
    }

    const omega =
      polarAmount === 0 ? 0 : sample([0, 100, getRandomSliderValue()]);
    setOmega(omega);

    const waterBoilAmount = sample([100, getRandomSliderValue()]);
    setWaterBoilAmount(waterBoilAmount);

    const spikyness = sample([0, 0, 0, 1, getRandomSliderValue()]);
    setSpikyness(spikyness);

    // splitUniverse is _such_ a drastic effect. Let's make it stick to 0
    // most of the time.
    const splitUniverse = sample([0, 0, 0, 0, getRandomSliderValue()]);
    setSplitUniverse(splitUniverse);

    // Line boost is a really expensive property. To keep randomization speedy,
    // let's keep it off most of the time.
    setEnableLineBoost(sample([false, false, false, false, false, true]));

    // If we're splitting the universe, we almost always want occlusion to be
    // off.
    const enableOcclusion =
      splitUniverse > 0
        ? sample([
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
          ])
        : getRandomBooleanValue();
    setEnableOcclusion(enableOcclusion);
  };

  // Sometimes, values in 1 parameter will disable others.
  // For example, when polarRatio is 0, "ballSize" doesn't do anything, since
  // it controls the size of the polar hole.
  const disabledParams = {
    ballSize: polarAmount === 0,
  };

  return (
    <SlopesContext.Provider
      value={{
        seed,
        perspective,
        spikyness,
        polarAmount,
        omega,
        splitUniverse,
        enableOcclusion,
        enableLineBoost,
        peaksCurve,
        personInflateAmount,
        wavelength,
        waterBoilAmount,
        ballSize,
        disabledParams,
        setSeed: wrappedSetter(setSeed),
        setPerspective: wrappedSetter(setPerspective),
        setSpikyness: wrappedSetter(setSpikyness),
        setPolarAmount: wrappedSetter(setPolarAmount),
        setOmega: wrappedSetter(setOmega),
        setSplitUniverse: wrappedSetter(setSplitUniverse),
        setEnableOcclusion: wrappedSetter(setEnableOcclusion),
        setEnableLineBoost: wrappedSetter(setEnableLineBoost),
        setPeaksCurve: wrappedSetter(setPeaksCurve),
        setPersonInflateAmount: wrappedSetter(setPersonInflateAmount),
        setWavelength: wrappedSetter(setWavelength),
        setWaterBoilAmount: wrappedSetter(setWaterBoilAmount),
        setBallSize: wrappedSetter(setBallSize),
        randomize,
        isRandomized: isRandomized.current,
      }}
    >
      {children}
    </SlopesContext.Provider>
  );
};
