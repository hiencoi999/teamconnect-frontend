import axios from 'axios';
import { BASE_URL } from '../../constant';

export async function getPresignedUrlFromChannel(channelId, fileName) {
  const url = axios
    .post(`${BASE_URL}/channels/${channelId}`, { fileName })
    .then((res) => {
      return res.data.url;
    })
    .catch((error) => console.log(error));
  return url;
}

export async function createMessage(channelId, description) {
  const res = await axios
  .post(
    `${BASE_URL}/channels/${channelId}/messages`,
    { description },
  )
  .then((res) => {
    return res;
  })
  .catch((error) => console.log(error));
return res;
}

export async function fetchNextMessage(channelId, page) {
  const messages = await axios
    .get(
      `${BASE_URL}/channels/${channelId}/messages`,
      { params: { page } },
    )
    .then((res) => {
      return res.data.messages;
    })
    .catch((error) => console.log(error));
  return messages;
}