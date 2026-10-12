import sanitizeHtml from "sanitize-html";

export const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "h1",
    "h2",
    "h3",
    "h4",
    "strong",
    "em",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "hr",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  transformTags: {
    a: (tagName, attribs) => {
      return {
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
        },
      };
    },
  },
};

export function cleanHtml(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, sanitizeOptions);
}
