/**
 * This file is a utility we can call after someone makes a purchase.
 *
 * It will take the set of parameters used on the client-side to build their
 * piece of art, and will generate an SVG similar to SlopesExports.
 *
 * It will also save it to disk, and produce a super-big PNG which can be
 * emailed to the user.
 *
 * Both the SVG and PNG will be saved to disk, so that the transactional
 * email sent to the user can link to them (seems easier than finding an ESP
 * that supports huge file attachments?). I might also want to add a cron job
 * that deletes the JPEG after a time. But whatever.
 */
import path from 'path';

import uuid from 'uuid/v1';
import { polylinesToSVG } from '../vendor/polylines';

import { PRINT_SIZES } from '../constants';
import {
  clipLinesWithMargin,
  groupPolylines,
  retraceLines,
} from '../helpers/line.helpers';
import generator from '../components/Slopes/Slopes.generator';
import transformParameters from '../components/Slopes/Slopes.params';

import { parallel, writeFile } from './utils';
import { upload } from './google-cloud';
import { sendArtVectorEmail } from './email';
import rasterize from './rasterization';
import { User } from './database';

const process = async (size, format, userId, userName, userEmail, params) => {
  const { width: printWidth, height: printHeight } = PRINT_SIZES[size];

  // Our aspect ratio depends on the size selected.
  // By default, our size is 18 x 24.
  const aspectRatio = printWidth / printHeight;

  const height = 552;
  const width = height * aspectRatio;
  const drawingVariables = transformParameters({
    height,
    ...params,
  });

  let lines = generator({
    width,
    height,
    ...drawingVariables,
  });

  // Create a smaller SVG by joining lines
  lines = groupPolylines(lines);

  // Trim any lines that fall outside the SVG size
  // TODO: change margin depending on `enableMargins`
  lines = clipLinesWithMargin({ lines, width, height, margins: [0, 0] });

  const filename = uuid();

  const svgMarkup = polylinesToSVG(lines, { width, height });

  const fileOutputPath = path.join(__dirname, '../../output');

  const svgPath = path.join(fileOutputPath, `${filename}.svg`);
  const pngPath = path.join(fileOutputPath, `${filename}.png`);

  // Create a raster PNG as well
  // We want our raster image to be printable at 300dpi.
  const rasterWidth = printWidth * 300;
  const rasterHeight = printHeight * 300;
  const buffer = await rasterize(svgMarkup, rasterWidth, rasterHeight);

  try {
    // prettier-ignore
    await parallel(
      writeFile(svgPath, svgMarkup),
      writeFile(pngPath, buffer)
    );
  } catch (err) {
    console.error('Could not save to local disk', err);
  }

  try {
    // prettier-ignore
    await parallel(
      upload(svgPath, 'svg'),
      upload(pngPath, 'png')
    );
  } catch (err) {
    console.error('Could not save to GCP', err);
  }

  // Create a User, if we don't already have one.
  const [user, wasJustCreated] = await User.findOrCreate({
    where: { id: userId },
    defaults: { email: userEmail, name: userName },
  });

  console.log(user.email);

  const svgUrl = `https://storage.googleapis.com/tinkersynth-art/${filename}.svg`;
  const pngUrl = `https://storage.googleapis.com/tinkersynth-art/${filename}.png`;

  // Email the customer!
  sendArtVectorEmail(user.name, user.email, format, svgUrl, pngUrl);
};

export default process;
