// @flow
import React from 'react';

import Layout from '../../components/Layout';
import SEO from '../../components/SEO';
import SlopesIndex from '../../components/Slopes/SlopesIndex';

const Page = () => (
  <Layout pageId="slopes">
    <SEO
      title="Slopes"
      ogTitle="Slopes Mk.1 Generative Art Machine"
      keywords={['generative art', 'art', 'online store']}
    />

    <SlopesIndex />
  </Layout>
);

export default Page;
