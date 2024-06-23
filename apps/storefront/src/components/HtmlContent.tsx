import xss from "xss";

interface HtmlContentProps {
  data?: {
    richText: string;
  };
  htmlContent?: any;
}

export default function HtmlContent({ data, htmlContent }: HtmlContentProps) {
  const content = data ? data.richText : htmlContent.columnContent;
  if (!content) return null;
  const sanitizedContent = xss(content, {
    whiteList: {
      a: ["href", "title", "target", "style"],
      b: ["style"],
      i: ["style"],
      em: ["style"],
      strong: ["style"],
      p: ["style"],
      br: [],
      ul: ["style"],
      ol: ["style"],
      li: ["style"],
      h1: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      h5: ["style"],
      h6: ["style"],
      div: ["style"],
      span: ["style"],
      img: ["src", "alt", "title", "style"],
      table: ["style", "border", "cellspacing", "cellpadding", "bgcolor"],
      colgroup: ["width", "border", "bgcolor"],
      thead: ["style"],
      tbody: ["style"],
      tr: ["style", "bgcolor", "valign", "align"],
      th: ["style", "colspan", "rowspan", "bgcolor", "valign", "align"],
      td: ["style", "colspan", "rowspan", "bgcolor", "valign", "align"],
    },
    css: {
      whiteList: {
        "": true,
      },
    },
  });
  return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} className="text-base" />;
}
