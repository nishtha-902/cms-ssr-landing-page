import { defineQuery } from "next-sanity";

export const LANDING_PAGE_QUERY = defineQuery(`
  *[_type == "landingPage"][0]{
    _id,
    title,
    hero{
      eyebrow,
      heading,
      description,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl
    },
    features[]{
      _key,
      title,
      description,
      icon
    }
  }
`);