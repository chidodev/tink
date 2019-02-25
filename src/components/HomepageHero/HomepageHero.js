import React from 'react';
import styled from 'styled-components';
import Icon from 'react-icons-kit';
import { chevronDown } from 'react-icons-kit/feather/chevronDown';

import { COLORS, UNIT } from '../../constants';
import { range } from '../../utils';
import useInterval from '../../hooks/interval.hook';
import artDemo1 from '../../images/art-demo-1.png';
import artDemo2 from '../../images/art-demo-2.png';

import UnstyledButton from '../UnstyledButton';
import FadeOnChange from '../FadeOnChange';
import SlideshowDots from '../SlideshowDots';
import Spacer from '../Spacer';

const images = [artDemo1, artDemo2];

const FRAME_DURATION = 5000;

const HomepageHero = () => {
  const [imageIndex, setImageIndex] = React.useState(1);
  const [slideshowFrameDuration, setSlideshowFrameDuration] = React.useState(
    FRAME_DURATION
  );

  useInterval(() => {
    const nextImageIndex = (imageIndex + 1) % images.length;

    setImageIndex(nextImageIndex);
  }, slideshowFrameDuration);

  const manuallyTriggerSlideshow = index => {
    setImageIndex(index);
    // End the automated slideshow when clicked
    setSlideshowFrameDuration(null);
  };

  const imageSrc = images[imageIndex];

  return (
    <Hero>
      <Spacer size={UNIT * 8} />

      <Subtitle>Create and purchase</Subtitle>
      <Title>Unique generative art</Title>

      <FadeOnChange changeKey={imageSrc}>
        <ArtDemo src={imageSrc} />
      </FadeOnChange>
      <SlideshowDots
        selectedIndex={imageIndex}
        count={images.length}
        handleSelect={manuallyTriggerSlideshow}
      />

      <HeroFooter>
        <Subtitle>
          These pieces were created by tinkering with a machine.
          <br />
          Create your own unique work of art, and purchase a fine-art print.
        </Subtitle>
        <Spacer size={UNIT * 9} />
        <StartButton>Start creating</StartButton>
        <Spacer size={UNIT * 2} />
        <LearnMoreButton>
          <span>
            Learn more
            <Spacer inline size={UNIT} />
            <Icon size={24} icon={chevronDown} />
          </span>
        </LearnMoreButton>
      </HeroFooter>
    </Hero>
  );
};

const Hero = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 0px 32px;
  margin: auto;
  text-align: center;
  color: ${COLORS.white};
`;

const Subtitle = styled.h3`
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
`;
const Title = styled.h3`
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -1px;
`;

const ArtDemo = styled.img`
  width: 450px;
  height: 600px;
`;

const HeroFooter = styled.div`
  padding: 96px 0;
`;

const HeroButton = styled(UnstyledButton)`
  width: 270px;
  height: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
`;

const StartButton = styled(HeroButton)`
  background: ${COLORS.gray[200]};
  color: ${COLORS.gray[900]};

  &:hover {
    background: ${COLORS.white};
    color: ${COLORS.black};
  }
`;

const LearnMoreButton = styled(HeroButton)`
  color: ${COLORS.white};
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

export default HomepageHero;
