import {
  ArrowRightOutlined,
  MenuOutlined,
  NumberOutlined,
} from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Dropdown,
  Modal,
  Tooltip,
  Typography,
} from 'antd';
import axios from 'axios';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import dayjs from 'dayjs';
import parse from 'html-react-parser';
import { useEffect, useState } from 'react';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import './Channel.css';
import { createMessage, getPresignedUrlFromChannel } from './apiCall';
var calendar = require('dayjs/plugin/calendar');
dayjs.extend(calendar);
const { Text } = Typography;

const items = [
  // {
  //   label: (
  //     <Text>
  //       <EditOutlined /> Rename
  //     </Text>
  //   ),
  //   key: '1',
  // },
  {
    label: (
      <Text style={{ color: 'red' }}>
        <ArrowRightOutlined /> Leave channel
      </Text>
    ),
    key: '2',
  },
];

const menuProps = {
  items,
  onClick: null,
};

const Channel = ({
  setChannelId,
  openChannel,
  setOpenChannel,
  page,
  channelId,
  socket,
}) => {
  const [channel, setChannel] = useState();
  const [channelMembers, setChannelMembers] = useState();
  const [emails, setEmails] = useState();
  const [description, setDescription] = useState();
  const [messages, setMessages] = useState([]);

  const getLabel = (email, index, removeEmail) => {
    return (
      <div
        style={{ backgroundColor: '#005566', color: 'white' }}
        data-tag
        key={index}
      >
        {email}
        <span
          data-tag-handle
          onClick={() => {
            removeEmail(index);
          }}
        >
          ×
        </span>
      </div>
    );
  };

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
      .get(`http://localhost:5000/channels/${channelId}/messages`, {
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
      .get(`http://localhost:5000/channels/${channelId}`)
      .then((res) => {
        setChannel(res.data.channel);
        setChannelMembers(res.data.members);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    socket?.on('getMessage', (email) => {
      console.log({ email });
      if (email) fetchMessages();
    });
  }, []);

  useEffect(() => {
    fetchChannelAndMembers();
  }, [channelId]);

  useEffect(() => {
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

  return (
    channel && (
      <Modal
        width="80vw"
        style={{ top: 20 }}
        open={openChannel}
        footer={<br />}
        onCancel={() => {
          setDescription('');
          setChannelId();
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
                      <Tooltip key={index} title={member.user.email} placement="top">
                        <Avatar src={member.user.picture} />
                      </Tooltip>
                    );
                  })}
                </Avatar.Group>
              </div>
              <div
                style={{
                  width: '400px',
                  justifyContent: 'center',
                  textAlign: 'center',
                  display: 'flex',
                }}
              >
                <ReactMultiEmail
                  focused="true"
                  placeholder="Add new emails..."
                  autoFocus={true}
                  emails={emails}
                  onChange={(_emails) => {
                    setEmails(_emails);
                  }}
                  validateEmail={(email) => {
                    return isEmail(email); // return boolean
                  }}
                  getLabel={getLabel}
                />
              </div>
              <Dropdown menu={menuProps}>
                <Button type="ghost">
                  <MenuOutlined />
                </Button>
              </Dropdown>
            </div>
          }
          style={{ width: '100%', background: 'darkgrey' }}
          bodyStyle={{ padding: 0, height: '70vh', background: 'white' }}
        >
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
                    // setPage((page) => page + 1);
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
                      <div className="ck-content " style={{ maxWidth: '90%' }}>
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
        </Card>
      </Modal>
    )
  );
};

export default Channel;
