import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image = "banner.jpg" }) => (
  <Helmet>
    {title && <title>{title}</title>}
    {description && <meta name="description" content={description} />}

    {/* Open Graph / Facebook */}
    {title && <meta property="og:type" content="website" />}
    {title && <meta property="og:title" content={title} />}
    {description && <meta property="og:description" content={description} />}
    {image && <meta property="og:image" content={"/images/" + image} />}

    {/* Twitter */}
    {title && <meta property="twitter:card" content="summary_large_image" />}
    {title && <meta property="twitter:title" content={title} />}
    {description && <meta property="twitter:description" content={description} />}
    {image && <meta property="twitter:image" content={"/images/" + image} />}
  </Helmet>
);

export default SEO;