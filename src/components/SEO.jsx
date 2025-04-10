import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ title, description, image }) => (
  <Helmet>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}

    {title && <meta property="og:title" content={title} />}
    {description &&<meta property="og:description" content={description} />}
    {image && <meta property="og:image" content={"/images/"+image} />}
  </Helmet>
);

export default SEO;