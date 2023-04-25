import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Tabs } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import BoardView from '../../components/BoardView/BoardView';
import ProjectSetting from '../../components/ProjectSetting/ProjectSetting';
import StatisticPage from '../../components/StatisticPage/StatisticPage';
import { BASE_URL } from '../../constant';
function capitalizeFirstLetter(string) {
  return string ? string.charAt(0).toUpperCase() + string.slice(1) : null;
}

const ProjectDetail = () => {
  const [, fetchProjects, fetchChannels, socket] = useOutletContext();
  const [project, setProject] = useState();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { projectId, source } = useParams();

  const fetchProjectDetail = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}`)
      .then((res) => {
        setProject(res.data.project);
        setMembers(res.data.members);
        setTimeout(() => {
          setLoading(false);
        }, 200);
      })
      .catch((error) => console.log(error));
  };

  const items = [
    {
      key: 'board',
      label: capitalizeFirstLetter(project?.name) + `'s Board`,
      children: project ? (
        <BoardView project={project} members={members} socket={socket} />
      ) : (
        <>Loading...</>
      ),
    },
    {
      key: 'settings',
      label: `Settings`,
      children: (
        <ProjectSetting
          project={project}
          members={members}
          fetchProjects={fetchProjects}
          fetchChannels={fetchChannels}
          fetchProjectDetail={fetchProjectDetail}
          socket={socket}
        />
      ),
    },
    {
      key: 'statistic',
      label: `Statistic`,
      children: <StatisticPage />,
    },
  ];

  const onChange = (key) => {
    navigate(`../${key}`);
  };

  useEffect(() => {
    setLoading(true);
    fetchProjectDetail();
  }, [projectId, source]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
  return (
    <>
      {loading ? (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Spin
            style={{ position: 'absolute', top: '50%', left: '50%' }}
            indicator={antIcon}
          />
        </div>
      ) : (
        project && (
          <div style={{ padding: '0 24px 0 24px', height: '100%' }}>
            <Tabs activeKey={source} items={items} onChange={onChange} />
          </div>
        )
      )}
    </>
  );
};

export default ProjectDetail;
