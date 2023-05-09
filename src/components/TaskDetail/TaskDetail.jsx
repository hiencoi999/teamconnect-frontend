import {
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  DatePicker,
  Divider,
  Modal,
  Popconfirm,
  Popover,
  Select,
  Space,
  Steps,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import axios from 'axios';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { BASE_URL } from '../../constant';
import { dummyRequest, getColorPriority, priority } from './TaskDetail.config';
import './TaskDetail.css';
import {
  createComment,
  deleteComment,
  deleteFile,
  deleteTask,
  fetchFiles,
  fetchTask,
  getPresignedUrl,
  getPresignedUrlFromEditor,
  updateTask,
} from './apiCall';

const { Text } = Typography;
dayjs.extend(localizedFormat);

export default function TaskDetail({
  open,
  onCancel,
  fetchTaskGroups,
  page,
  taskId,
  setTaskId,
  isUpdated,
  projectId,
  members,
  socket,
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [task, setTask] = useState();
  const [taskDescription, setTaskDescription] = useState();
  const [fileList, setFileList] = useState([]);
  const [disableSave, setDisableSave] = useState(true);
  const [disableSaveComment, setDisableSaveComment] = useState(true);
  const [openEditor, setOpenEditor] = useState(false);
  const [comment, setComment] = useState();
  const [comments, setComments] = useState([]);
  const [statusGroup, setStatusGroup] = useState();

  const statusGroupItems = [];
  statusGroup?.map((group) => {
    statusGroupItems.push({
      title: group.name,
    });
  });
  const fetchComments = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}/tasks/${taskId}/comments`, {
        params: { page: page.current },
      })
      .then((res) => {
        if (res?.data?.comments[0]?.task === comments[0]?.task) {
          comments.length
            ? setComments((comments) => [...comments, ...res.data.comments])
            : setComments(res.data.comments);
        } else {
          setComments(res.data.comments);
        }
      })
      .catch((error) => console.log(error));
  };

  const fetchStatus = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}/groups`)
      .then((res) => setStatusGroup(res.data.groups))
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    socket?.on('getComment', (email) => {
      if (email) fetchComments();
    });
  }, []);

  useEffect(() => {
    fetchTask(projectId, taskId, setTask);
    fetchFiles(projectId, taskId, setFileList);
    fetchStatus();
  }, [taskId, isUpdated]);

  useEffect(() => {
    fetchComments();
  }, [page, taskId]);

  const beforeUpload = async (file) => {
    messageApi.open({
      key: file.uid,
      type: 'loading',
      content: 'Uploading...',
    });
    let fileName = file.name;
    const url = await getPresignedUrl(projectId, taskId, fileName);

    const requestOptions = {
      method: 'PUT',
      body: file,
    };
    //do not use axios because token was auto set in header in App.js
    fetch(url, requestOptions)
      .then((response) => {
        fetchFiles(projectId, taskId, setFileList);
      })
      .catch((error) => console.log(error));
  };

  const uploadProps = {
    name: 'file',
    customRequest: dummyRequest,
    onChange(info) {
      if (info.file.status !== 'uploading') {
      }
      if (info.file.status === 'done') {
        messageApi.open({
          key: info.file.uid,
          type: 'success',
          content: `${info.file.name} uploaded successfully`,
        });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    },
  };

  const onDeleteFile = async (fileId) => {
    const res = await deleteFile(projectId, taskId, fileId);
    if (res?.status === 200) {
      message.success('Deleted');
      fetchFiles(projectId, taskId, setFileList);
    }
  };

  const onUpdateStatus = async (current) => {
    const updatedTask = task;
    updatedTask.status = statusGroupItems[current]?.title;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onUpdateDescription = async () => {
    const updatedTask = task;
    updatedTask.description = taskDescription;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      setTaskDescription('');
      setDisableSave(true);
      setOpenEditor(false);
      fetchTask(projectId, taskId, setTask);
    }
  };

  const onUpdateAssignee = async (assigneeId) => {
    const updatedTask = task;
    updatedTask.assignee = assigneeId;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onClearAssignee = async () => {
    const updatedTask = task;
    updatedTask.assignee = null;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onUpdatePriority = async (priority) => {
    const updatedTask = task;
    updatedTask.priority = priority;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onUpdateDueDate = async (dueDate) => {
    const updatedTask = task;
    updatedTask.dueDate = dueDate;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onUpdateStartDate = async (startDate) => {
    const updatedTask = task;
    updatedTask.startDate = startDate;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onClearDueDate = async () => {
    const updatedTask = task;
    updatedTask.dueDate = null;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onClearStartDate = async () => {
    const updatedTask = task;
    updatedTask.startDate = null;
    const res = await updateTask(projectId, updatedTask);
    if (res?.status === 200) {
      message.success('Updated');
      fetchTask(projectId, taskId, setTask);
      socket?.emit('updateBoard', members);
    }
  };

  const onCreateComment = async () => {
    const res = await createComment(projectId, taskId, comment);
    if (res?.status === 201) {
      setComment('');
      setComments((comments) => []);
      page.current = 1;
      fetchComments();
      setDisableSaveComment(true);
      socket?.emit('sendComment', members);
    }
  };

  const onDeleteComment = async (commentId) => {
    const res = await deleteComment(projectId, taskId, commentId);
    if (res?.status === 200) {
      message.success('Comment deleted');
      setComments((comments) => []);
      page.current = 1;
      fetchComments();
      socket?.emit('sendComment', members);
    }
  };

  const onDeleteTask = async () => {
    const res = await deleteTask(projectId, taskId);
    if (res?.status === 200) {
      message.success('Deleted');
    }
  };

  function uploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file) => {
            const url = await getPresignedUrlFromEditor(
              projectId,
              taskId,
              file.name,
            );
            fetch(url, {
              method: 'PUT',
              body: file,
            })
              .then((res) => {
                resolve({
                  default: `https://teamconnect-kltn.s3.amazonaws.com/${taskId}${file.name}`,
                });
              })
              .catch((error) => reject(error));
          });
        });
      },
    };
  }

  function uploadPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return uploadAdapter(loader);
    };
  }

  function AssigneeDisplay({ imgUrl, firstName, lastName }) {
    return (
      <Space>
        <img
          src={imgUrl}
          alt=""
          referrerPolicy="no-referrer"
          style={{ height: '20px', borderRadius: '50%', marginTop: '5px' }}
        ></img>
        <Text>{firstName + ' ' + lastName}</Text>
      </Space>
    );
  }

  return (
    task && (
      <Modal
        style={{ top: '5vh' }}
        open={open}
        onCancel={() => {
          setOpenEditor(false);
          setFileList();
          setTaskDescription();
          setTaskId();
          page.current = 1;
          onCancel();
          fetchTaskGroups();
        }}
        footer={null}
        width="90vw"
        height="90vh"
      >
        <>
          {contextHolder}
          <br></br>
          <Badge.Ribbon
            text={`#${task.key} | Created at ${dayjs(task.createdAt).format(
              'lll',
            )}`}
            placement="start"
          >
            <Space
              direction="vertical"
              style={{
                width: '100%',
                borderRadius: '5px',
                border: 'solid thin green',
                padding: 12,
                background: '#E7F6F2',
              }}
            >
              <div className="flex-row-end">
                <Button danger onClick={onDeleteTask} icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </div>
              <div className="flex-row-space-bt">
                <Card
                  title={task?.title}
                  style={{ width: '63%' }}
                  bodyStyle={{ overflowY: 'auto', maxHeight: '60vh' }}
                >
                  <Space direction="vertical" className="flex-column-space-bt">
                    <Upload
                      listType="text"
                      multiple={true}
                      maxCount={10}
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      {...uploadProps}
                    >
                      <Button
                        type="primary"
                        style={{ height: '100%' }}
                        icon={<UploadOutlined />}
                      >
                        Upload
                      </Button>
                    </Upload>

                    {fileList?.length ? (
                      <>
                        <Text strong>Attachments</Text>
                        <div className="file-display">
                          {fileList.map((file) => {
                            const arr = file.name.split('.');
                            const mineType = arr[arr.length - 1];
                            return (
                              <Popover
                                key={file.uid}
                                content={
                                  <div className="flex-row-center">
                                    <a
                                      href={`https://teamconnect-kltn.s3.amazonaws.com/${file.uid}${file.name}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                    >
                                      <Button icon={<DownloadOutlined />} />
                                    </a>
                                    <Button
                                      icon={<DeleteOutlined />}
                                      onClick={() => {
                                        onDeleteFile(file.uid);
                                      }}
                                    />
                                  </div>
                                }
                                title={file.name}
                              >
                                <Card
                                  key={file.uid}
                                  hoverable={true}
                                  className="file-body"
                                >
                                  <div
                                    style={{
                                      width: '40px',
                                      margin: ' 0 auto',
                                    }}
                                  >
                                    <FileIcon
                                      extension={mineType}
                                      {...defaultStyles[`${mineType}`]}
                                    />
                                  </div>
                                  <Text
                                    style={{ width: '100px' }}
                                    ellipsis={true}
                                  >
                                    {file?.name}
                                  </Text>
                                </Card>
                              </Popover>
                            );
                          })}
                        </div>
                      </>
                    ) : null}
                    <Text
                      strong
                      onClick={() => {
                        setOpenEditor(true);
                      }}
                    >
                      Description
                    </Text>
                    {openEditor === true ? (
                      <>
                        <CKEditor
                          key={1}
                          editor={Editor}
                          autofocus
                          data={task.description}
                          config={{ extraPlugins: [uploadPlugin] }}
                          onReady={(editor) => {
                            editor.model.change((writer) => {
                              writer.setSelection(
                                editor.model.document.getRoot(),
                                'end',
                              );
                            });
                            editor.editing.view.focus();
                          }}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            if (data) setDisableSave(false);
                            else setDisableSave(true);
                            setTaskDescription(data);
                            console.log({ event, editor, data });
                          }}
                        />
                        <Space>
                          <Button
                            disabled={disableSave}
                            type="primary"
                            onClick={onUpdateDescription}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setOpenEditor(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </Space>
                      </>
                    ) : task.description ? (
                      <Card
                        key={task.description}
                        className="ck-content"
                        bodyStyle={{ padding: '4px' }}
                        onClick={() => {
                          setOpenEditor(true);
                        }}
                      >
                        {parse(task.description)}
                      </Card>
                    ) : (
                      <Card
                        key={task.description}
                        className="ck-content"
                        bodyStyle={{ padding: '4px' }}
                        onClick={() => {
                          setOpenEditor(true);
                        }}
                      >
                        Click to add description...
                      </Card>
                    )}

                    <Text strong>Status</Text>
                    <Steps
                      style={{ marginTop: 8 }}
                      type="navigation"
                      current={statusGroupItems.findIndex(
                        (element) => element.title === task.status,
                      )}
                      onChange={onUpdateStatus}
                      items={statusGroupItems}
                    />
                    <Card title="Details">
                      <div className="flex-column-space-bt">
                        <div className="flex-row-space-bt">
                          <Typography>Assignee</Typography>
                          {/* {task.assignee ? ( */}
                          <Select
                            key={task.assignee?._id}
                            allowClear
                            bordered={false}
                            defaultValue={{
                              label: task.assignee ? (
                                <AssigneeDisplay
                                  imgUrl={task?.assignee.user.picture}
                                  firstName={task?.assignee.user.firstName}
                                  lastName={task?.assignee.user.lastName}
                                />
                              ) : (
                                <Space>
                                  <Avatar
                                    size="small"
                                    icon={<UserOutlined />}
                                  />
                                  <Text>Unassigned</Text>
                                </Space>
                              ),
                            }}
                            options={members.map((member) => ({
                              label: member.role,
                              options: [
                                {
                                  label: (
                                    <AssigneeDisplay
                                      imgUrl={member.user.picture}
                                      firstName={member.user.firstName}
                                      lastName={member.user.lastName}
                                    />
                                  ),
                                  value: member._id,
                                },
                              ],
                            }))}
                            onSelect={onUpdateAssignee}
                            onClear={onClearAssignee}
                          />
                        </div>
                        <Divider />
                        <div className="flex-row-space-bt">
                          <Typography>Priority</Typography>
                          <Select
                            key={task.priority}
                            bordered={false}
                            size="large"
                            defaultValue={{
                              label: (
                                <Tag color={getColorPriority(task.priority)}>
                                  {task.priority}
                                </Tag>
                              ),
                            }}
                            options={priority}
                            onChange={onUpdatePriority}
                          />
                        </div>
                        <Divider />
                        <div className="flex-row-space-bt">
                          <Typography>Due Date</Typography>
                          <DatePicker
                            key={dayjs(task.dueDate)}
                            allowClear
                            bordered={false}
                            format="YYYY-MM-DD h:mm A"
                            showTime={{
                              defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
                            }}
                            defaultValue={
                              task.dueDate ? dayjs(task.dueDate) : null
                            }
                            onChange={onUpdateDueDate}
                            onClear={onClearDueDate}
                          />
                        </div>
                        <Divider />
                        <div className="flex-row-space-bt">
                          <Typography>Start Date</Typography>
                          <DatePicker
                            key={dayjs(task.startDate)}
                            allowClear
                            bordered={false}
                            format="YYYY-MM-DD"
                            showTime={{
                              defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
                            }}
                            defaultValue={
                              task.startDate ? dayjs(task.startDate) : null
                            }
                            onChange={onUpdateStartDate}
                            onClear={onClearStartDate}
                          />
                        </div>
                      </div>
                    </Card>
                  </Space>
                </Card>
                <Card
                  bodyStyle={{
                    padding: '0',
                  }}
                  title="Comments"
                  style={{ width: '36%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="flex-row-start">
                      <img
                        src={localStorage.getItem('avatar')}
                        alt=""
                        referrerPolicy="no-referrer"
                        style={{
                          height: '2rem',
                          borderRadius: '50%',
                          margin: '4px',
                        }}
                      ></img>
                      <div className="editor-cover">
                        <CKEditor
                          key={2}
                          editor={Editor}
                          data={comment}
                          config={{
                            extraPlugins: [uploadPlugin],
                            placeholder: 'Add a comment...',
                          }}
                          onReady={(editor) => {
                            editor.model.change((writer) => {
                              writer.setSelection(
                                editor.model.document.getRoot(),
                                'end',
                              );
                            });
                            editor.editing.view.focus();
                          }}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            if (data) setDisableSaveComment(false);
                            else setDisableSaveComment(true);
                            setComment(data);
                          }}
                        />

                        <Space
                          style={{
                            marginTop: '8px',
                            display: disableSaveComment ? 'none' : null,
                          }}
                        >
                          <Button type="primary" onClick={onCreateComment}>
                            Save
                          </Button>
                          <Button
                            onClick={() => {
                              setComment('');
                              setDisableSaveComment(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </Space>
                      </div>
                    </div>

                    {comments && (
                      <div
                        style={{ height: '44vh', overflow: 'auto' }}
                        onScroll={(e) => {
                          const bottom =
                            e.target.scrollHeight - e.target.scrollTop ===
                            e.target.clientHeight;
                          if (bottom) {
                            page.current = page.current + 1;
                          }
                        }}
                      >
                        {comments.map((comm, index) => {
                          return (
                            <>
                              <Divider />
                              <div
                                key={index}
                                className="flex-row-start"
                                style={{ width: '100%' }}
                              >
                                <img
                                  src={comm.user.picture}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  style={{
                                    height: '2rem',
                                    borderRadius: '50%',
                                    margin: '4px',
                                  }}
                                ></img>
                                <div
                                  className="ck-content"
                                  style={{ maxWidth: '90%' }}
                                >
                                  <Text strong>
                                    {comm.user.firstName +
                                      ' ' +
                                      comm.user.lastName}
                                  </Text>
                                  <Text>{parse(`${comm.description}`)}</Text>
                                  <Text italic>
                                    {dayjs(comm.createdAt).from(new Date())}
                                  </Text>
                                </div>
                                {comm.user.email ===
                                localStorage.getItem('email') ? (
                                  <Popconfirm
                                    placement="bottom"
                                    title="Delete this comment"
                                    onConfirm={() => onDeleteComment(comm._id)}
                                    okText="Yes"
                                    cancelText="No"
                                  >
                                    <Button
                                      type="ghost"
                                      size="small"
                                      style={{
                                        marginLeft: '4px',
                                        color: 'red',
                                      }}
                                      icon={<DeleteOutlined />}
                                    ></Button>
                                  </Popconfirm>
                                ) : null}
                              </div>
                            </>
                          );
                        })}
                      </div>
                    )}
                  </Space>
                </Card>
              </div>
            </Space>
          </Badge.Ribbon>
        </>
      </Modal>
    )
  );
}
