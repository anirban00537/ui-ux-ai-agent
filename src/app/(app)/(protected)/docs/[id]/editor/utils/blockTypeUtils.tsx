import { BLOCK_TYPES } from "@/types";
import {
  IconFileText,
  IconPhoto,
  IconCode,
  IconSeparator,
  IconNumber,
} from "@tabler/icons-react";

export const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case BLOCK_TYPES.PROSEMIRROR:
      return <IconFileText size={16} />;
    case BLOCK_TYPES.IMAGE:
      return <IconPhoto size={16} />;
    case BLOCK_TYPES.CODE:
      return <IconCode size={16} />;
    case BLOCK_TYPES.SPACER:
      return <IconSeparator size={16} />;
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return <IconNumber size={16} />;
    default:
      return <IconFileText size={16} />;
  }
};

export const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case BLOCK_TYPES.PROSEMIRROR:
      return "Text";
    case BLOCK_TYPES.IMAGE:
      return "Image";
    case BLOCK_TYPES.CODE:
      return "Code";
    case BLOCK_TYPES.SPACER:
      return "Spacer";
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return "Number Card";
    case BLOCK_TYPES.LAYERED_NUMBER_BLOCK:
      return "Layered Number";
    case BLOCK_TYPES.CALLOUT_BLOCK:
      return "Callout";
    case BLOCK_TYPES.SOLID_BOX_BLOCK:
      return "Solid Box";
    case BLOCK_TYPES.SOLID_ICON_BOX_BLOCK:
      return "Icon Box";
    case BLOCK_TYPES.SIDELINE_CARD_BLOCK:
      return "Sideline Card";
    case BLOCK_TYPES.BUTTON_BLOCK:
      return "Button";
    default:
      return "Block";
  }
};

