import { SelectOutlined } from '@ant-design/icons';
import { Avatar, Card, Empty, message, Popconfirm, Space, Tooltip } from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../../constant';
const { Meta } = Card;

const Trash = () => {
  const [deletedProjects, setDeletedProjects] = useState();
  console.log({deletedProjects})
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    async function fetchDeletedProject() {
      await axios
        .get(`${BASE_URL}/projects/deleted`)
        .then((res) => {
          setDeletedProjects(res.data.data);
        })
        .catch((error) => console.log(error));
    }
    fetchDeletedProject();
  }, []);

  return !deletedProjects ? (
    <p>loading</p>
  ) : (
    <>
      {contextHolder}
      <div style={{ padding: 24 }}>
        {deletedProjects?.length === 0 ? (
          <Empty description="No projects found"></Empty>
        ) : (
          <Space size={[16, 16]} wrap>
            {deletedProjects?.map((project) => (
              <Card
                key={project.project._id}
                style={{ width: 400, cursor: 'pointer' }}
                actions={[
                  <Popconfirm
                    placement="bottom"
                    title="Delete project"
                    description="Are you sure to delete this project?"
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Restore this project" placement="bottom">
                      <SelectOutlined />
                    </Tooltip>
                  </Popconfirm>,
                ]}
              >
                <Meta
                  avatar={
                    <Avatar
                      style={{ border: 'thin black solid' }}
                      src={`${process.env.REACT_APP_PROJECT_AVATAR_URL}${project.project?.name}`}
                    />
                  }
                  title={project.project.name}
                  description={`Deleted ${moment(
                    project.project?.deletedAt,
                  ).fromNow()}`}
                />
              </Card>
            ))}
          </Space>
        )}
      </div>
    </>
  );
};

export default Trash;
