// @flow
import React from 'react';
import styled, { keyframes } from 'styled-components';
import svgToPng from '../../vendor/svg-to-png';
import { renderPolylines, polylinesToSVG } from '../../vendor/polylines';

import { DARK_BACKGROUND, LIGHT_BACKGROUND } from '../../constants';
import generateRandomName from '../../services/random-name.service';
import darkTilesSrc from '../../images/transparent-tiles-dark.svg';
import lightTilesSrc from '../../images/transparent-tiles-light.svg';

import UnstyledButton from '../UnstyledButton';

import { SLOPES_ASPECT_RATIO } from './Slopes.constants';

type Props = {
  size: number,
  originalCanvasWidth: number,
  svgNode: ?HTMLElement,
  kind: 'transparent-png' | 'opaque-png' | 'svg',
  enableDarkMode: boolean,
};

const OUTPUT_HEIGHT = 7200;
const OUTPUT_WIDTH = OUTPUT_HEIGHT * SLOPES_ASPECT_RATIO;

const getBackground = (kind, enableDarkMode) => {
  if (kind === 'opaque-png') {
    return enableDarkMode ? DARK_BACKGROUND : LIGHT_BACKGROUND;
  } else {
    return enableDarkMode ? `url(${darkTilesSrc})` : `url(${lightTilesSrc})`;
  }
};

const handleClick = (
  filename,
  kind,
  originalCanvasWidth,
  background,
  svgNode
) => {
  const scale = OUTPUT_WIDTH / originalCanvasWidth;

  switch (kind) {
    case 'transparent-png': {
      svgToPng.saveSvgAsPng(svgNode, filename, { scale });

      break;
    }

    case 'opaque-png': {
      // Ok this one is a bit tricky. We need to modify the SVG to include a
      // full-size background.
      const svgWidth = originalCanvasWidth;
      const svgHeight = svgWidth * (1 / SLOPES_ASPECT_RATIO);

      const nodeClone = svgNode.cloneNode(true);

      const rect = document.createElement('rect');
      rect.setAttribute('x', '0');
      rect.setAttribute('y', '0');
      rect.setAttribute('width', svgWidth);
      rect.setAttribute('height', svgHeight);
      rect.setAttribute('fill', background);

      nodeClone.prepend(rect);

      svgToPng.saveSvgAsPng(nodeClone, filename, { scale });

      break;
    }

    case 'svg': {
      svgToPng.saveSvg(svgNode, filename);
      break;
    }

    default: {
      throw new Error('Unrecognized kind: ' + kind);
    }
  }
};

const DownloadVariant = ({
  size,
  originalCanvasWidth,
  svgNode,
  kind,
  enableDarkMode,
}: Props) => {
  const background = getBackground(kind, enableDarkMode);

  const [previewUri, setPreviewUri] = React.useState(null);
  const filename = React.useRef(generateRandomName());

  React.useEffect(
    () => {
      // When the download shelf is hidden, we unset the SVG node.
      // We want to remove our preview, so that we don't show stale previews
      // the next time the shelf is opened.
      if (!svgNode) {
        setPreviewUri(null);
        return;
      }

      // Refresh the name when the shelf is reopened.
      // Ideally this would only happen when the artwork has changed, but
      // whatever this is easier.
      filename.current = generateRandomName();

      const previewScale = size / originalCanvasWidth;

      svgToPng.svgAsPngUri(svgNode, { scale: previewScale }, uri => {
        setPreviewUri(uri);
      });
    },
    [svgNode]
  );

  let label;
  let sublabel = '';
  switch (kind) {
    case 'svg': {
      label = 'SVG';
      break;
    }

    case 'transparent-png': {
      label = 'PNG';
      sublabel = 'transparent';
      break;
    }
    case 'opaque-png': {
      label = 'PNG';
      sublabel = 'opaque';
      break;
    }
  }

  return (
    <Wrapper
      style={{ width: size, height: size, background }}
      onClick={() =>
        handleClick(
          filename.current,
          kind,
          originalCanvasWidth,
          background,
          svgNode
        )
      }
    >
      {previewUri && <PreviewImage src={previewUri} />}
      <Overlay
        style={{
          color: enableDarkMode ? 'white' : 'black',
          textShadow: enableDarkMode && '1px 1px 0px rgba(0, 0, 0, 0.5)',
        }}
      >
        {sublabel && <Sublabel>{sublabel}</Sublabel>}
        <Label>{label}</Label>
      </Overlay>
    </Wrapper>
  );
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9, 0.9);
  }

  to {
    opacity: 1;
    transform: scale(1, 1);
  }
`;

const Wrapper = styled(UnstyledButton)`
  /* TODO: hover effects */
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
`;

const Label = styled.div`
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -1px;
`;

const Sublabel = styled.div`
  font-size: 21px;
  font-weight: 600;
  transform: translateY(8px);
`;

const PreviewImage = styled.img`
  position: relative;
  z-index: 1;
  display: block;
  object-fit: cover;
  width: 100%;
  height: 100%;
  animation: ${fadeIn} 300ms ease-out;
`;

export default React.memo(DownloadVariant);
