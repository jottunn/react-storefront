"use client";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export default function BlockRendererClient({ content }: { readonly content: BlocksContent }) {
  if (!content) return null;
  return (
    <div className="prose-2xl">
      <BlocksRenderer content={content} />
    </div>
  );
}
