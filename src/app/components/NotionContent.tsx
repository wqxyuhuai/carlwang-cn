import type { RichBlock } from "../data";
import {
  ProjectContentRenderer,
  textToProjectBlocks,
} from "./ProjectContentRenderer";

export function textToRichBlocks(value: string): RichBlock[] {
  return textToProjectBlocks(value);
}

export function NotionContentView({ blocks }: { blocks: RichBlock[] }) {
  return <ProjectContentRenderer blocks={blocks} />;
}
