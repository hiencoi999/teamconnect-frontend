import axios from 'axios';

export async function getPresignedUrlFromChannel(channelId, fileName) {
  const url = axios
    .post(`http://localhost:5000/channels/${channelId}`, { fileName })
    .then((res) => {
      return res.data.url;
    })
    .catch((error) => console.log(error));
  return url;
}

export async function createMessage(channelId, description) {
  const res = await axios
  .post(
    `http://localhost:5000/channels/${channelId}/messages`,
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
      `http://localhost:5000/channels/${channelId}/messages`,
      { params: { page } },
    )
    .then((res) => {
      return res.data.messages;
    })
    .catch((error) => console.log(error));
  return messages;
}