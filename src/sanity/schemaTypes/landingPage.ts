import { defineField, defineType } from "sanity";

export default defineType({
  name: "landingPage",
  title: "Landing Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Internal Page Title",
      type: "string",
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string"
        }),
        defineField({
          name: "heading",
          title: "Heading",
          type: "string",
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          rows: 4,
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: "primaryButtonText",
          title: "Primary Button Text",
          type: "string"
        }),
        // defineField({
        //   name: "primaryButtonUrl",
        //   title: "Primary Button URL",
        //   type: "url"
        // }),
        defineField({
          name: "secondaryButtonText",
          title: "Secondary Button Text",
          type: "string"
        }),
        defineField({
          name: "primaryButtonUrl",
          title: "Primary Button URL",
          type: "string",
          validation: (Rule) =>
            Rule.custom((value) => {
              if (!value) return true;

              if (
                value.startsWith("#") ||
                value.startsWith("/") ||
                value.startsWith("http://") ||
                value.startsWith("https://")
              ) {
                return true;
              }

              return "Enter a valid URL, relative URL, or anchor link such as #features";
            }),
        }),

        defineField({
          name: "secondaryButtonUrl",
          title: "Secondary Button URL",
          type: "string",
          validation: (Rule) =>
            Rule.custom((value) => {
              if (!value) return true;

              if (
                value.startsWith("#") ||
                value.startsWith("/") ||
                value.startsWith("http://") ||
                value.startsWith("https://")
              ) {
                return true;
              }

              return "Enter a valid URL, relative URL, or anchor link such as #features";
            }),
        }),
        // defineField({
        //   name: "secondaryButtonUrl",
        //   title: "Secondary Button URL",
        //   type: "url"
        // })
      ]
    }),
    defineField({
      name: "features",
      title: "Features Section",
      type: "array",
      validation: (Rule) => Rule.max(6),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              description: "Use an emoji, e.g. ⚡"
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required()
            })
          ]
        }
      ]
    })
  ],
  preview: {
    select: {
      title: "title",
      heading: "hero.heading"
    },
    prepare({ title, heading }) {
      return {
        title: title || "Landing Page",
        subtitle: heading || "No hero heading"
      };
    }
  }
});