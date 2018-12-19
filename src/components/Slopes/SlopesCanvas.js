// @flow
import React, { useRef, useEffect } from 'react';

import { renderPolylines } from '../../vendor/polylines';

import transformParameters from './Slopes.params';

import Worker from './SlopesCanvas.worker.js';

const worker = new Worker();

type Props = {
  width: number,
  height: number,
  perspective: number,
  spikyness: number,
  polarAmount: number,
  omega: number,
  splitUniverse: number,
};

const useCanvasDrawing = (
  canvasRef,
  devicePixelRatio,
  width,
  height,
  params
) => {
  const topMargin = (height / 11) * 1;
  const leftMargin = (width / 8.5) * 1;
  const samplesPerRow = Math.ceil(width * 0.5);

  const supportsOffscreenCanvas = 'OffscreenCanvas' in window;
  const hasSentCanvas = useRef(false);

  // The user can tweak "high-level parameters" like spikyness, perspective,
  // etc. These values need to be reduced to low-level variables used in
  // calculation. There is not a 1:1 mapping between them: a single
  // high-level param might tweak several low-level vars, and the same
  // variable might be affected by multiple params.
  const drawingVariables = transformParameters({
    height,
    ...params,
  });

  // On mount, set up the worker message-handling
  useEffect(() => {
    // If the browser supports it, we want to allow the canvas to be painted
    // off of the main thread.

    if (supportsOffscreenCanvas) {
      canvasRef.current = canvasRef.current.transferControlToOffscreen();
    } else {
      const context = canvasRef.current.getContext('2d');
      context.scale(devicePixelRatio, devicePixelRatio);

      worker.onmessage = function({ data }) {
        if (!data.lines) {
          return;
        }

        renderPolylines(data.lines, {
          width,
          height,
          context,
        });
      };

      return () => {
        // TODO: cleanup
      };
    }
  }, []);

  // NOTE: Right now, I'm allowing the canvas to redraw whenever it rerenders.
  // This seems to be OK since SlopesCanvas is a pure component (using
  // React.memo).
  // If this component re-renders too much, we may wish to add an array of
  // derived variables, to only update on them
  // eg. triggerUpdateOn = [distanceBetweenRows, perlinRatio, ...]
  const triggerUpdateOn = undefined;

  useEffect(() => {
    let messageData = {
      width,
      height,
      margins: [topMargin, leftMargin],
      samplesPerRow,
      supportsOffscreenCanvas,
      ...drawingVariables,
    };
    let transfer = undefined;

    // If this is the very first time we're painting to the canvas, we need
    // to send it along, using the cumbersome "data and transfer" API.
    // More info: https://developers.google.com/web/updates/2018/08/offscreen-canvas
    if (supportsOffscreenCanvas && !hasSentCanvas.current) {
      messageData.canvas = canvasRef.current;
      messageData.devicePixelRatio = devicePixelRatio;
      transfer = [canvasRef.current];

      hasSentCanvas.current = true;
    }

    worker.postMessage(messageData, transfer);
  }, triggerUpdateOn);
};

const Slopes = ({
  width,
  height,
  perspective,
  spikyness,
  polarAmount,
  omega,
  splitUniverse,
}: Props) => {
  const canvasRef = useRef(null);

  const params = {
    perspective,
    spikyness,
    polarAmount,
    omega,
    splitUniverse,
  };

  const devicePixelRatio = window.devicePixelRatio || 1;

  useCanvasDrawing(canvasRef, devicePixelRatio, width, height, params);

  // HACK: We need to scale our canvas by our devicePixelRatio. This is a 2-step
  // process:
  //  - Change the width/height/style.width/style.height
  //  - Use the canvas context to scale it accordingly.
  //
  // I normally do both of these things in the same place, but because we're
  // using an offscreenCanvas, we don't have access to the canvas context here.
  // So I need to do that first step inline, and trust that the ctx.scale call
  // will exist in `SlopesCanvas.worker.js`.

  return (
    <canvas
      width={width * devicePixelRatio}
      height={height * devicePixelRatio}
      style={{ width, height, boxShadow: '0px 4px 50px rgba(0, 0, 0, 0.25)' }}
      ref={canvasRef}
    />
  );
};

export default React.memo(Slopes);
