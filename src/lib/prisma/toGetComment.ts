import { FindCommentResult, GetComment } from 'types';
import { convertMentionUsernamesToIds } from '../convertMentionUsernamesToIds';
import { fileNameToUrl } from '../s3/fileNameToUrl';

export async function toGetComment(
  findCommentResult: FindCommentResult,
): Promise<GetComment> {
  const { commentLikes, content, ...rest } = findCommentResult;
  const isLiked = commentLikes.length > 0;

  // Convert the `@` `id` mentions back to usernames
  const { str } = await convertMentionUsernamesToIds({
    str: content,
    reverse: true,
  });
  return {
    ...rest,
    user: {
      ...rest.user,
      // Convert the `profilePhoto` file name to a full S3 URL
      profilePhoto: fileNameToUrl(rest.user.profilePhoto),
    },
    isLiked,
    content: str,
  };
}
