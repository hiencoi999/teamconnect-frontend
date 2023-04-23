import axios from 'axios';

export async function fetchTask(projectId, taskId, setTask) {
  await axios
    .get(`http://localhost:5000/projects/${projectId}/tasks/${taskId}`)
    .then((res) => {
      setTask(res.data.task);
    })
    .catch((error) => console.log(error));
}

export async function fetchFiles(projectId, taskId, setFileList) {
  await axios
    .get(`http://localhost:5000/projects/${projectId}/tasks/${taskId}/files`)
    .then((res) => {
      const files = res.data.files.map((file) => {
        return {
          name: file.name,
          uid: file._id,
          status: 'done',
          thumbUrl: `https://teamconnect-kltn.s3.amazonaws.com/${file._id}${file.name}`,
        };
      });
      setFileList(files);
    })
    .catch((error) => console.log(error));
}

export async function deleteFile(projectId, taskId, fileId) {
  const res = await axios
    .delete(
      `http://localhost:5000/projects/${projectId}/tasks/${taskId}/files/${fileId}`,
    )
    .then((res) => {
      return res;
    })
    .catch((error) => console.log(error));
  return res;
}

export async function getPresignedUrl(projectId, taskId, fileName) {
  const url = await axios
    .post(
      `http://localhost:5000/projects/${projectId}/tasks/${taskId}/upload-url`,
      { fileName },
    )
    .then((res) => {
      return res.data.url;
    })
    .catch((error) => console.log(error));
  return url;
}

export async function getPresignedUrlFromEditor(projectId, taskId, fileName) {
  const url = await axios
    .post(
      `http://localhost:5000/projects/${projectId}/tasks/${taskId}/upload-url-editor`,
      { fileName },
    )
    .then((res) => {
      return res.data.url;
    })
    .catch((error) => console.log(error));
  return url;
}

export async function updateTask(projectId, updatedTask) {
  console.log('updatedTask', updatedTask);
  const res = await axios
    .put(
      `http://localhost:5000/projects/${projectId}/tasks/${updatedTask._id}`,
      {
        updatedTask,
      },
    )
    .then((res) => {
      return res;
    })
    .catch((error) => console.log(error));
  return res;
}

export async function deleteTask(projectId, taskId) {
  const res = await axios
    .delete(`http://localhost:5000/projects/${projectId}/tasks/${taskId}`)
    .then((res) => {
      return res;
    })
    .catch((error) => console.log(error));
  return res;
}

export async function createComment(projectId, taskId, description) {
  const res = await axios
    .post(
      `http://localhost:5000/projects/${projectId}/tasks/${taskId}/comments`,
      { description },
    )
    .then((res) => {
      return res;
    })
    .catch((error) => console.log(error));
  return res;
}

export async function fetchNextComments(projectId, taskId, page) {
  const comments = await axios
    .get(
      `http://localhost:5000/projects/${projectId}/tasks/${taskId}/comments`,
      { params: { page: page.current } },
    )
    .then((res) => {
      return res.data.comments;
    })
    .catch((error) => console.log(error));
  return comments;
}

export async function deleteComment(projectId, taskId, commentId) {
  const res = await axios
    .delete(
      `http://localhost:5000/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
    )
    .then((res) => {
      return res;
    })
    .catch((error) => console.log(error));
  return res;
}
