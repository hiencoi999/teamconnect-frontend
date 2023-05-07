import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, Tag, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../../constant';
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
    dataIndex: 'action',
    // render: (_, record) => (<Button key={record} onClick={(record) => console.log({record})} icon={<PlusOutlined />} />),
  },
];

const AddChannel = ({ channel, channelMembers }) => {
  const [members, setMembers] = useState();
  const channelMemberIds = channelMembers.map((member) => {
    return member.user._id;
  });
  console.log({ channelMemberIds });
  const data = [];
  members?.map((member) => {
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
      action: (
        <Button
          disabled={channelMemberIds.includes(member.user._id)}
          onClick={() => onAddNewMember(member.user._id, channel._id)}
          icon={<PlusOutlined />}
        />
      ),
    });
  });

  const onAddNewMember = async (userId, channelId) => {
    await axios
      .post(`${BASE_URL}/channels/${channelId}/members`, { userId })
      .then((res) => message.success('success'))
      .catch((error) => console.log(error));
  };

  const fetchProjectMembers = async () => {
    await axios
      .get(`${BASE_URL}/projects/${channel.project}/members`)
      .then((res) => setMembers(res.data.members))
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    fetchProjectMembers();
  }, []);

  return (
    <div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default AddChannel;
