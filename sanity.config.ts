"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import landingPage from "./src/sanity/schemaTypes/landingPage";

export default defineConfig({
  name: "cms-landing-page",
  title: "CMS Landing Page",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: [landingPage]
  }
});