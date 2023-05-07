import { DeleteOutlined } from '@ant-design/icons';
import {
  Avatar,
  Card,
  Empty,
  message,
  Popconfirm,
  Space,
  Tooltip
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { Link, useOutletContext } from 'react-router-dom';
import { BASE_URL } from '../../constant';
const { Meta } = Card;

const Projects = () => {
  const [projects, fetchProjects, fetchChannels] = useOutletContext();
  const [messageApi, contextHolder] = message.useMessage();

  async function handleDeleteProject(projectId) {
    await axios
      .delete(`${BASE_URL}/projects/${projectId}`)
      .then((res) => {
        fetchProjects();
        fetchChannels()
      })
      .catch((error) => {
        if (error.response.status === 403) {
          messageApi.open({
            type: 'warning',
            content: 'You do not have permission to do this action',
            duration: 2,
          });
        }
      });
  }

  return !projects ? (
    <div>loading...</div>
  ) : (
    <>
      {contextHolder}

      <div style={{ padding: 24 }}>
        {projects?.data?.length === 0 ? (
          <Empty description="No projects found">
          </Empty>
        ) : (
          <Space size={[16, 16]} wrap>
            {projects.data?.map((project) => (
              <Card
                hoverable="true"
                className="card"
                key={project._id}
                style={{ width: 400, cursor: 'pointer' }}
              >
                <Meta
                  avatar={
                    <Avatar
                      style={{ border: 'thin black solid' }}
                      src={`${process.env.REACT_APP_PROJECT_AVATAR_URL}${project?.project.name}`}
                    />
                  }
                  title={
                    <Link to={`/projects/${project?.project._id}`}>
                      {project.project.name}
                    </Link>
                  }
                  description={'Created: ' + moment(project.project?.createdAt).fromNow()}
                />
                {project.role === 'LEADER' ? (
                  <Popconfirm
                    placement="bottom"
                    title="Delete project"
                    description="Are you sure to delete this project?"
                    onConfirm={() => handleDeleteProject(project.project?._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Tooltip title="Move to trash" placement="bottom">
                      <DeleteOutlined key="delete" />
                    </Tooltip>
                  </Popconfirm>
                ) : null}
              </Card>
            ))}
          </Space>
        )}
      </div>
    </>
  );
};

export default Projects;
