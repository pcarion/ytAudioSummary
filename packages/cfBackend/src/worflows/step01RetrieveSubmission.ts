import { getSubmissionById } from "../router/r2-utils";

export async function step01RetrieveSubmission(
  submissionId: string,
  bucket: R2Bucket
) {
  // retrieve record from r2 bucket
  const submission = await getSubmissionById(bucket, submissionId);
  // get usefull data from submission
  if (!submission) {
    throw new Error("Submission not found in R2 bucket: " + submissionId);
  }

  // we are interested in the youtubeVideo data
  const { youtubeVideo } = submission;
  if (!youtubeVideo) {
    throw new Error(
      "Youtube video data not found in submission: " + submissionId
    );
  }
  const { title, author, captions } = youtubeVideo;

  // we are interested in the captions data
  if (!captions) {
    throw new Error("Captions data not found in submission: " + submissionId);
  }
  return {
    title,
    author,
    captions,
  };
}
