import { v7 as uuidv7 } from "uuid";

import { DatabaseService } from "../db/queries";

export async function stepUpdateFeedTable(
  db: DatabaseService,
  submissionId: string,
  feed: {
    url: string;
    title: string;
    summaryText: string;
    r2Key: string;
    thumbnailUrl: string;
  }
) {
  const feedId = uuidv7();
  const feedContent = await db.createFeedContent({
    id: feedId,
    submissionId: submissionId,
    url: feed.url,
    title: feed.title,
    summaryText: feed.summaryText,
    audioFileUrl: feed.r2Key,
    thumbnailUrl: feed.thumbnailUrl,
  });
  console.log(
    `Created feed content in database: ${JSON.stringify(feedContent)}`
  );
  return feedId;
}
