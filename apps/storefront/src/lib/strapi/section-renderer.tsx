import HtmlContent from "@/components/HtmlContent";
import VideoEmbed from "@/components/VideoEmbed";
import Accordion from "@/components/strapi/Accordion";
import BlockRendererClient from "@/components/strapi/BlocksRendererClient";
import GoogleMap from "@/components/strapi/GoogleMap";
import GridLayout from "@/components/strapi/GridLayout";
import Hero from "@/components/strapi/Hero";
import Media from "@/components/strapi/Media";
import MediaGallery from "@/components/strapi/MediaGallery";

export function sectionRenderer(section: any, index: number) {
  switch (section.__component) {
    case "elements.media-gallery":
      return <MediaGallery key={index} data={section} />;
    case "elements.media":
      return <Media key={index} data={section} />;
    case "elements.video":
      return <VideoEmbed key={index} data={section} />;
    case "elements.simple-text-editor":
      return <BlockRendererClient key={index} content={section.richTextBlocks} />;
    case "sections.rich-text":
      return <HtmlContent key={index} data={section} />;
    case "sections.grid":
      return <GridLayout key={index} data={section} />;
    case "sections.hero":
      return <Hero key={index} data={section} />;
    case "sections.accordion":
      return <Accordion key={index} data={section} />;
    case "links.google-map":
      return <GoogleMap key={index} data={section} />;
    default:
      return null;
  }
}
