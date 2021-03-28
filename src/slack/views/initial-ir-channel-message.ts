/* eslint-disable @typescript-eslint/camelcase */
import { section, divider, context } from "../block-kit/block-builder";
import { KnownBlock } from "@slack/types";

export default {
  blocks: (authorID: string): KnownBlock[] => {
    const currentTimeInMS = (Date.now() / 1000).toFixed(0);
    return [
      section(`Incident reported`),
      section(`*Incident Commander: *<@${authorID}>`),
      divider(),
      section(`*Video call link:* https://google.com`),
      divider(),
      context(
        `Reported <!date^${currentTimeInMS}^ {date_short_pretty} at {time}| ${new Date()} >`
      )
    ];
  }
};
