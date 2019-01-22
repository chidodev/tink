// @flow
import React, { useRef, useState } from 'react';

import { sample, random } from '../../utils';
import useToggle from '../../hooks/toggle.hook';

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

  const [enableDarkMode, toggleDarkMode] = useToggle(false);
  const [enableMargins, toggleMargins] = useToggle(false);

  const [amplitudeAmount, setAmplitudeAmount] = useState(50);
  const [wavelength, setWavelength] = useState(25);
  const [octaveAmount, setOctaveAmount] = useState(0);
  const [perspective, setPerspective] = useState(40);
  const [lineAmount, setLineAmount] = useState(45);
  const [spikyness, setSpikyness] = useState(0);
  const [staticAmount, setStaticAmount] = useState(0);
  const [polarAmount, setPolarAmount] = useState(0);
  const [omega, setOmega] = useState(0);
  const [splitUniverse, setSplitUniverse] = useState(0);
  const [personInflateAmount, setPersonInflateAmount] = useState(50);
  const [waterBoilAmount, setWaterBoilAmount] = useState(100);
  const [ballSize, setBallSize] = useState(50);
  const [dotAmount, setDotAmount] = useState(0);

  const [enableOcclusion, setEnableOcclusion] = useState(true);

  const [peaksCurve, setPeaksCurve] = useState(DEFAULT_PEAKS_CURVE);

  const isRandomized = useRef(false);

  const wrappedSetter = setter => args => {
    isRandomized.current = false;
    setter(args);
  };

  // Generate a new set of settings!
  // Note that it's a very curated sort of randomness. The goal isn't to be
  // truly random, but to produce something that looks good more often than
  // not.
  //
  // TODO: Should I set this function as a ref? Seems like it's maybe expensive
  // to create on every update.
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
      // Amplitudes below 25 or above 75 don't really look good
      setAmplitudeAmount(random(25, 75));
    }
    if (Math.random() > 0.25) {
      setWavelength(random(25, 75));
    }

    setDotAmount(Math.random() > 0.75 ? getRandomSliderValue() : 0);

    if (Math.random() > 0.75) {
      setOctaveAmount(Math.random() > 0.5 ? getRandomSliderValue() : 0);
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

    const spikyness = sample([0, 0, 0, 100, getRandomSliderValue()]);
    setSpikyness(spikyness);

    if (spikyness > 0) {
      setStaticAmount(Math.random() > 0.5 ? getRandomSliderValue() : 0);
    } else {
      setStaticAmount(0);
    }

    // splitUniverse is _such_ a drastic effect. Let's make it stick to 0
    // most of the time.
    const splitUniverse = sample([0, 0, 0, 0, getRandomSliderValue()]);
    setSplitUniverse(splitUniverse);

    // Performance suffers when we add lots of lines. Let's keep it generally
    // to a pretty low number
    setLineAmount(
      sample([
        5,
        10,
        20,
        30,
        35,
        40,
        40,
        50,
        50,
        50,
        60,
        getRandomSliderValue(),
      ])
    );

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
    waterBoilAmount: splitUniverse === 100,
  };

  return (
    <SlopesContext.Provider
      value={{
        seed,
        enableDarkMode,
        enableMargins,
        amplitudeAmount,
        octaveAmount,
        perspective,
        lineAmount,
        spikyness,
        staticAmount,
        polarAmount,
        omega,
        splitUniverse,
        enableOcclusion,
        peaksCurve,
        personInflateAmount,
        wavelength,
        waterBoilAmount,
        ballSize,
        dotAmount,
        disabledParams,
        setSeed: wrappedSetter(setSeed),
        toggleDarkMode: wrappedSetter(toggleDarkMode),
        toggleMargins: wrappedSetter(toggleMargins),
        setAmplitudeAmount: wrappedSetter(setAmplitudeAmount),
        setOctaveAmount: wrappedSetter(setOctaveAmount),
        setPerspective: wrappedSetter(setPerspective),
        setLineAmount: wrappedSetter(setLineAmount),
        setSpikyness: wrappedSetter(setSpikyness),
        setStaticAmount: wrappedSetter(setStaticAmount),
        setPolarAmount: wrappedSetter(setPolarAmount),
        setOmega: wrappedSetter(setOmega),
        setSplitUniverse: wrappedSetter(setSplitUniverse),
        setEnableOcclusion: wrappedSetter(setEnableOcclusion),
        setPeaksCurve: wrappedSetter(setPeaksCurve),
        setPersonInflateAmount: wrappedSetter(setPersonInflateAmount),
        setWavelength: wrappedSetter(setWavelength),
        setWaterBoilAmount: wrappedSetter(setWaterBoilAmount),
        setBallSize: wrappedSetter(setBallSize),
        setDotAmount: wrappedSetter(setDotAmount),
        randomize,
        isRandomized: isRandomized.current,
      }}
    >
      {children}
    </SlopesContext.Provider>
  );
};
