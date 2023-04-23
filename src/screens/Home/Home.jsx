import {
  DeleteOutlined,
  KeyOutlined,
  LaptopOutlined,
  LogoutOutlined,
  NumberOutlined,
  PlusOutlined,
  ProjectOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Form,
  Input,
  Layout,
  Menu,
  Modal,
  Select,
  Space,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import Channel from '../../components/Channel/Channel';
import NotificationDrawer from '../../components/Notification/NotificationDrawer';
import useAuth from '../../hooks/useAuth';
import './Home.css';
const { Header, Content, Sider } = Layout;
const { Option } = Select;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const Home = ({ socket }) => {
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [openCreateChannel, setOpenCreateChannel] = useState(false);
  const [projects, setProjects] = useState([]);
  const [openChannel, setOpenChannel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [countNotification, setCountNotification] = useState(0);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [channels, setChannels] = useState([]);
  const [channelId, setChannelId] = useState();
  const [closeChannel, setCloseChannel] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  let params = useParams();
  const page = useRef(1);

  function onClickMenuItem(e) {
    switch (e.key) {
      case 'sub3':
        navigate('/trash');
        break;
      case 'SIGN_OUT':
        localStorage.removeItem('accessToken');
        localStorage.removeItem('avatar');
        localStorage.removeItem('email');
        socket.emit('removeUser');
        setAccessToken(null);
        navigate('/login');
        break;
      default:
    }
  }

  function onOpenChannel(e) {
    setOpenChannel(true);
    setCloseChannel(false);
    setChannelId(e.key);
  }

  const subItem1 = [];
  let len = projects?.data?.length > 5 ? 5 : projects?.data?.length;
  for (let i = 0; i < len; i++) {
    subItem1.push(
      getItem(
        <Link to={`/projects/${projects?.data[i].project?._id}`}>
          <Space>
            <Avatar
              size="small"
              src={`${process.env.REACT_APP_PROJECT_AVATAR_URL}${projects?.data[i].project?.name}`}
            />
            <strong>{projects?.data[i].project?.name}</strong>
          </Space>
        </Link>,
        `${projects?.data[i].project?._id}`,
      ),
    );
  }

  subItem1.push(
    getItem(
      <Link to="/projects">
        <u>
          <strong>View all projects</strong>
        </u>
      </Link>,
    ),
  );

  const items = !projects.data
    ? null
    : [
        getItem('Recent projects', 'sub1', <ProjectOutlined />, subItem1),
        getItem('My Work', 'sub2', <LaptopOutlined />),
        getItem('Trash', 'sub3', <DeleteOutlined />),
        getItem('Sign Out', 'SIGN_OUT', <LogoutOutlined />),
      ];

  const channelItems = [];
  channels.forEach((channel) => {
    let channelList = [];
    channel.channels.map((item) => {
      channelList.push(
        getItem(
          <Space>
            <NumberOutlined />
            <strong>{item.channel.name}</strong>
          </Space>,
          `${item.channel._id}`,
          null,
          null,
        ),
      );
    });

    channelItems.push(
      getItem(
        <Space>
          <Avatar
            size="small"
            src={`${process.env.REACT_APP_PROJECT_AVATAR_URL}${channel?.project?.name}`}
          />
          <strong>{channel?.project?.name}</strong>
        </Space>,
        `${channel?.project?._id}`,
        null,
        channelList,
      ),
    );
  });

  async function fetchProjects() {
    await axios
      .get('http://localhost:5000/projects')
      .then((res) => {
        setProjects(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function fetchChannels() {
    await axios
      .get('http://localhost:5000/channels')
      .then((res) => {
        setChannels(res.data.channels);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function fetchNotifications() {
    await axios
      .get(`http://localhost:5000/user/invitation`)
      .then((res) => {
        setNotifications(res.data.invitations);
        setCountNotification(res.data.invitations.length);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  useEffect(() => {
    socket.emit('addUser', localStorage.getItem('email'));
    socket.on('getInvitations', (email) => {
      if (email) {
        fetchNotifications();
      }
    });
    socket.on('new msg', function (data) {
      console.log(data.msg);
    });
    socket.on('new noti', function (data) {
      console.log(data.msg);
    });
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchChannels();
    fetchNotifications();
  }, []);

  async function onCreateProject({ projectName, projectDescription }) {
    await axios
      .post('http://localhost:5000/projects', {
        projectName,
        projectDescription,
      })
      .then((res) => {
        setOpenCreateProject(false);
        fetchProjects();
        fetchChannels();
        form.resetFields();
        navigate(`/projects/${res.data.project._id}`);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function onCreateChannel({ projectId, channelName }) {
    await axios
      .post('http://localhost:5000/channels', { projectId, channelName })
      .then((res) => {
        setOpenCreateChannel(false);
        fetchChannels();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <>
      <Layout style={{ minHeight: '100vh' }}>
        <Header
          style={{
            padding: 0,
            background: '#E7F6F2',
            borderBottom: 'solid thin lightgrey',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              justifyContent: 'flex-end',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Input
              placeholder="Search"
              size="large"
              prefix={<SearchOutlined className="site-form-item-icon" />}
              style={{ width: '20vw', marginRight: '8px' }}
            />
            <Badge
              count={countNotification}
              overflowCount={99}
              size="small"
              style={{ marginRight: '8px' }}
            >
              <img
                className="cursor-poiter"
                style={{
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '8px',
                }}
                alt=""
                referrerPolicy="no-referrer"
                src={localStorage.getItem('avatar')}
                onClick={() => setOpenDrawer(true)}
              />
            </Badge>

            <img
              src={require('../../assets/icons.png')}
              alt=""
              className="logo"
              onClick={() => {
                navigate('/');
              }}
            ></img>
          </div>
        </Header>
        <Layout>
          <Sider theme="light">
            <div
              style={{
                height: 32,
                margin: 16,
              }}
            >
              <Button
                type="primary"
                style={{
                  height: '100%',
                  width: '100%',
                }}
                onClick={() => setOpenCreateProject(true)}
              >
                <PlusOutlined />
                Add projects
              </Button>
              <Modal
                title="Create new project"
                open={openCreateProject}
                footer={null}
                onCancel={() => setOpenCreateProject(false)}
              >
                <Form
                  form={form}
                  name="project"
                  onFinish={onCreateProject}
                  autoComplete="off"
                >
                  <Form.Item
                    name="projectName"
                    rules={[
                      {
                        required: true,
                        pattern: new RegExp(/^[A-Za-z0-9 ]*$/),
                        message: 'Invalid project name',
                      },
                    ]}
                  >
                    <Input
                      placeholder="Project name"
                      size="large"
                      maxLength={50}
                      showCount
                      allowClear
                      prefix={<ProjectOutlined />}
                    />
                  </Form.Item>
                  <Form.Item name="projectDescription">
                    <TextArea
                      placeholder="Description"
                      size="large"
                      maxLength={1000}
                      showCount
                      allowClear
                      prefix={<KeyOutlined />}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ float: 'right' }}
                      size="large"
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
            </div>
            <Menu
              style={{ background: 'white', position: 'sticky', top: '0' }}
              defaultOpenKeys={['sub1']}
              selectedKeys={params.projectId}
              mode="inline"
              items={items}
              onClick={onClickMenuItem}
            />
          </Sider>

          <NotificationDrawer
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            notification={notifications}
            fetchNotifications={() => fetchNotifications()}
            fetchProjects={() => fetchProjects()}
            fetchChannels={() => fetchChannels()}
          />
          <Divider type="vertical" style={{ height: '100%' }} />
          <Content className="content" style={{ background: 'white' }}>
            <Outlet
              context={[projects, fetchProjects, fetchChannels, socket]}
            />
          </Content>
          <Divider type="vertical" style={{ height: '100%' }} />
          <Sider theme="light">
            <div
              style={{
                height: 32,
                margin: 16,
              }}
            >
              <Button
                type="primary"
                style={{
                  height: '100%',
                  width: '100%',
                }}
                onClick={() => setOpenCreateChannel(true)}
              >
                <PlusOutlined />
                Add channels
              </Button>
              <Modal
                title="Create new private channel"
                open={openCreateChannel}
                footer={null}
                onCancel={() => setOpenCreateChannel(false)}
              >
                <Form
                  name="channel"
                  onFinish={onCreateChannel}
                  autoComplete="off"
                >
                  <Form.Item
                    name="projectId"
                    rules={[
                      {
                        required: true,
                        message: 'You must select project',
                      },
                    ]}
                  >
                    <Select size="large" placeholder="Select project">
                      {projects.data?.map((project) => {
                        return (
                          <Option value={project.project._id}>
                            <Space>
                              <Avatar
                                size="small"
                                src={`${process.env.REACT_APP_PROJECT_AVATAR_URL}${project.project.name}`}
                              />
                              <strong>{project.project.name}</strong>
                            </Space>
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="channelName"
                    rules={[
                      {
                        required: true,
                        pattern: new RegExp(/^[A-Za-z0-9 ]*$/),
                        message: 'Invalid channel name',
                      },
                    ]}
                  >
                    <Input
                      placeholder="Channel name"
                      size="large"
                      maxLength={50}
                      showCount
                      allowClear
                      prefix={<NumberOutlined />}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={{ float: 'right' }}
                      size="large"
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </Form>
              </Modal>
            </div>
            <Menu
              style={{
                background: 'white',
                position: 'sticky',
                top: '0',
                height: '82vh',
                overflowY: 'auto',
              }}
              defaultOpenKeys={['global', 'private']}
              selectedKeys={null}
              mode="inline"
              items={channelItems}
              onClick={onOpenChannel}
            />
            {channelId ? (
              <Channel
                setChannelId={setChannelId}
                openChannel={openChannel}
                setOpenChannel={setOpenChannel}
                closeChannel={closeChannel}
                page={page}
                channelId={channelId}
                socket={socket}
              />
            ) : null}
          </Sider>
        </Layout>
      </Layout>
    </>
  );
};

export default Home;
