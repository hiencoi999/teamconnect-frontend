import {
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Divider,
  Dropdown,
  Image,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import Title from 'antd/es/typography/Title';
import axios from 'axios';
import moment from 'moment/moment';
import { useState } from 'react';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/dist/style.css';
const { Text } = Typography;
const columns = [
  {
    title: 'Member',
    dataIndex: 'picture',
  },
  {
    title: 'First Name',
    dataIndex: 'firstName',
  },
  { title: 'Last Name', dataIndex: 'lastName' },
  { title: 'Email', dataIndex: 'email' },
  {
    title: 'Role',
    dataIndex: 'role',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_) => (
      <Space size="middle">
        <a>Remove</a>
      </Space>
    ),
  },
];

const items = [
  {
    label: (
      <Text>
        <EditOutlined /> Rename
      </Text>
    ),
    key: '1',
  },
  {
    label: (
      <Text style={{ color: 'red' }}>
        <DeleteOutlined /> Move to trash
      </Text>
    ),
    key: '2',
  },
];

const menuProps = {
  items,
  onClick: null,
};

const ProjectSetting = ({ project, members, fetchProjects, fetchChannels, fetchProjectDetail, socket }) => {
  let projectId = project?._id;
  const [messageApi, contextHolder] = message.useMessage();
  const [emails, setEmails] = useState([]);

  const data = [];
  members.map((member) => {
    return data.push({
      key: member._id,
      picture: (
        <img
          alt=""
          style={{ borderRadius: '50%', height: '2rem' }}
          referrerPolicy="no-referrer"
          src={member.user.picture}
        ></img>
      ),
      firstName: member.user.firstName,
      lastName: member.user.lastName,
      email: member.user.email,
      role: (
        <Tag color={member.role === 'LEADER' ? 'green' : 'orange'}>
          {member.role}
        </Tag>
      ),
    });
  });

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
  const senInvitationAPI = async () => {
    await axios
      .post(`http://localhost:5000/projects/${projectId}/invitation`, {
        projectId,
        emails,
      })
      .then((res) => {
        messageApi.open({
          type: 'success',
          content: res.data.message,
          duration: 2,
        });
        setEmails([]);
      })
      .catch((error) => console.log(error));
  };

  const sendInvitation = () => {
    socket?.emit('sendInvitation', emails);

    senInvitationAPI();
  };

  const onNameChange = async (newName) => {
    await axios.put(`http://localhost:5000/projects/${projectId}`, {newName})
    .then(res => {
      fetchProjectDetail()
      fetchProjects()
      fetchChannels()
    })
    .catch(error => console.log(error))
  }

  return (
    <div style={{ overflowY: 'auto', height: '80vh' }}>
      {contextHolder}
      <div
        style={{
          display: 'flex',
          background: '#E7F6F2',
          borderRadius: '5px',
        }}
      >
        <Space
          direction="vertical"
          style={{ width: '90%', margin: 'auto', padding: 24 }}
        >
          <div className="flex-row-space-bt">
            <Space>
              <Image
                style={{
                  border: 'solid thin black',
                  maxHeight: '20vh',
                  borderRadius: '50%',
                }}
                preview={false}
                src={`${process.env.REACT_APP_PROJECT_AVATAR_URL}${project?.name}`}
              />
              <div className="flex-column-space-bt">
                <Title
                  editable={{
                    tooltip: 'click to edit text',
                    onChange: onNameChange,
                    triggerType: ['text'],
                  }}
                  level={1}
                >
                  {project?.name}
                </Title>
                <Typography>
                  {moment(project?.createdAt).format('LL')}
                </Typography>
              </div>
            </Space>
            <Dropdown menu={menuProps}>
              <Button type="ghost" icon={<MenuOutlined />}></Button>
            </Dropdown>
          </div>
          <Title
            level={5}
            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
            style={{ width: '100%' }}
          >
            {project?.description}
          </Title>
          <Divider />
          <Space
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <ReactMultiEmail
              focused="true"
              placeholder="name1@gmail.com, name2@gmail.com"
              autoFocus={true}
              emails={emails}
              onChange={(_emails) => {
                setEmails(_emails);
              }}
              validateEmail={(email) => {
                return isEmail(email); // return boolean
              }}
              getLabel={getLabel}
              style={{ width: '400px' }}
            />
            <Button
              icon={<SendOutlined />}
              size="large"
              type="primary"
              onClick={() => sendInvitation()}
            >
              Invite
            </Button>

            <Alert
              message={
                <>
                  You can send invitation to multiple emails by using
                  <Typography.Text keyboard>Space</Typography.Text>
                </>
              }
              type="info"
              showIcon
              banner
              closable
            />
          </Space>
          <br></br>
          <Table columns={columns} dataSource={data} />
        </Space>
      </div>
    </div>
  );
};

export default ProjectSetting;
