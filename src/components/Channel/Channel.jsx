import {
  ArrowRightOutlined,
  NumberOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Drawer,
  Modal,
  Popconfirm,
  Tooltip,
  Typography,
  message,
} from 'antd';
import axios from 'axios';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import dayjs from 'dayjs';
import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../../constant';
import AddChannel from './AddChannel';
import './Channel.css';
import { createMessage, getPresignedUrlFromChannel } from './apiCall';
var calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar);
const { Text } = Typography;

const Channel = ({
  setChannelId,
  openChannel,
  setOpenChannel,
  page,
  channelId,
  socket,
  fetchChannels,
}) => {
  const [channel, setChannel] = useState();
  const [channelMembers, setChannelMembers] = useState();
  const [description, setDescription] = useState();
  const [messages, setMessages] = useState([]);
  const [openAddMember, setOpenAddMember] = useState(false);

  function uploadAdapter(loader) {
    return {
      upload: () => {
        return new Promise((resolve, reject) => {
          loader.file.then(async (file) => {
            const url = await getPresignedUrlFromChannel(channelId, file.name);
            fetch(url, {
              method: 'PUT',
              body: file,
            })
              .then((res) => {
                resolve({
                  default: `https://teamconnect-kltn.s3.amazonaws.com/${channelId}${file.name}`,
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

  const fetchMessages = async () => {
    await axios
      .get(`${BASE_URL}/channels/${channelId}/messages`, {
        params: { page: page.current },
      })
      .then((res) => {
        if (res?.data?.messages[0]?.channel === messages[0]?.channel) {
          messages.length
            ? setMessages((messages) => [...messages, ...res.data.messages])
            : setMessages(res.data.messages);
        } else {
          setMessages(res.data.messages);
        }
      })
      .catch((error) => console.log(error));
  };

  const fetchChannelAndMembers = async () => {
    await axios
      .get(`${BASE_URL}/channels/${channelId}`)
      .then((res) => {
        setChannel(res.data.channel);
        setChannelMembers(res.data.members);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    socket?.on('getMessage', (email) => {
      if (email) {
        fetchMessages();
      }
    });
  }, []);

  useEffect(() => {
    fetchChannelAndMembers();
    // updateReadMessage();
    fetchMessages();
  }, [channelId]);

  async function onCreateMessage(description) {
    console.log({ channelId });
    const res = await createMessage(channelId, description);
    if (res.status === 201) {
      setDescription('');
      page.current = 1;
      setMessages((messages) => []);
      fetchMessages();
      socket?.emit('sendMessage', channelMembers);
    }
  }

  const handleKeyDown = (event, editor) => {
    if (event.keyCode === 13 /* Enter */) {
      const message = editor.getData();
      if (message) {
        onCreateMessage(message);
      }
    }
  };

  const leaveChannel = async () => {
    await axios
      .delete(`${BASE_URL}/channels/${channelId}/members`)
      .then((res) => {
        if (res.status === 200) message.success('You left this channel');
      })
      .catch((error) => console.log(error));
  };

  const updateReadMessage = async () => {
    console.log('cancel');
    await axios
      .put(`${BASE_URL}/channels/${channelId}`)
      .then((res) => fetchChannels())
      .catch((error) => console.log(error));
  };

  return (
    channel && (
      <Modal
        width="86vw"
        style={{ top: 20 }}
        open={openChannel}
        footer={<br />}
        onCancel={() => {
          setDescription('');
          setChannelId();
          updateReadMessage();
          setOpenChannel(false);
          page.current = 1;
        }}
      >
        <br />
        <Card
          title={
            <div className="flex-row-space-bt" style={{ alignItems: 'center' }}>
              <div className="flex-row-start">
                <Text style={{ marginRight: '8px' }}>
                  <NumberOutlined /> {channel.name}{' '}
                </Text>
                <Avatar.Group
                  maxPopoverTrigger="click"
                  size="small"
                  maxStyle={{
                    cursor: 'pointer',
                  }}
                >
                  {channelMembers.map((member, index) => {
                    return (
                      <Tooltip
                        key={index}
                        title={member.user.email}
                        placement="top"
                      >
                        <Avatar src={member.user.picture} />
                      </Tooltip>
                    );
                  })}
                </Avatar.Group>
                {!channel.isGlobal && (
                  <Button
                    shape="circle"
                    size={'small'}
                    icon={<PlusOutlined />}
                    onClick={() => setOpenAddMember(true)}
                  />
                )}
              </div>
              <div
                style={{
                  width: '400px',
                  justifyContent: 'center',
                  textAlign: 'center',
                  display: 'flex',
                }}
              ></div>

              {!channel.isGlobal && (
                <Popconfirm
                  placement="bottom"
                  title="Leave channel"
                  description="Leave this channel?"
                  onConfirm={() => leaveChannel()}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button danger>
                    <ArrowRightOutlined />
                    Leave channel
                  </Button>
                </Popconfirm>
              )}
            </div>
          }
          style={{ width: '100%', background: 'darkgrey' }}
          bodyStyle={{ padding: 0, height: '70vh', background: 'white' }}
        >
          <>
            <Drawer
              title="Select members"
              placement="bottom"
              closable={false}
              onClose={() => {
                setOpenAddMember(false);
                fetchChannelAndMembers();
              }}
              open={openAddMember}
              getContainer={false}
            >
              <AddChannel channel={channel} channelMembers={channelMembers} fetchChannels={fetchChannels} />
            </Drawer>
            {messages && (
              <div
                style={{
                  height: '60vh',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                }}
                onScroll={(e) => {
                  if (messages.length) {
                    const top =
                      e.target.scrollHeight + e.target.scrollTop <=
                      e.target.clientHeight;
                    if (top) {
                      page.current = page.current + 1;
                      fetchMessages();
                    }
                  }
                }}
              >
                {messages.map((comm, index) => {
                  return (
                    <>
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
                            borderRadius: '10%',
                            margin: '4px',
                          }}
                        ></img>
                        <div
                          className="ck-content "
                          style={{ maxWidth: '90%' }}
                        >
                          <Text strong>
                            {comm.user.firstName + ' ' + comm.user.lastName}
                          </Text>
                          <Text>{parse(`${comm.description}`)}</Text>
                        </div>
                      </div>
                      <Divider orientation="right">
                        <Text italic>
                          {dayjs(comm.createdAt).calendar(dayjs())}
                        </Text>
                      </Divider>
                    </>
                  );
                })}
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: '10vh',
              }}
            >
              <CKEditor
                key={2}
                editor={Editor}
                data={description}
                config={{
                  toolbar: [
                    'bold',
                    'italic',
                    'underline',
                    'link',
                    'imageUpload',
                    'codeBlock',
                  ],
                  extraPlugins: [uploadPlugin],
                  placeholder: 'Type something...',
                }}
                onReady={(editor) => {
                  editor.model.change((writer) => {
                    writer.setSelection(editor.model.document.getRoot(), 'end');
                  });
                  editor.editing.view.focus();
                  editor.keystrokes.set('Enter', (data, stop) => {
                    handleKeyDown(data.domEvent, editor);
                    stop();
                  });
                }}
                onChange={(event, editor) => {
                  const message = editor.getData();
                  setDescription(message);
                }}
              />
            </div>
          </>
        </Card>
      </Modal>
    )
  );
};

export default Channel;
