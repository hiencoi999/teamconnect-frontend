import { Bar, Column, Pie } from '@ant-design/plots';
import { Card } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../constant';

const colors = [
  '#F7C04A',
  '#3F497F',
  '#DF7857',
  '#617143',
  '#D864A9',
  '#C1AEFC',
];
const StatisticPage = () => {
  const { projectId } = useParams();
  const [groups, setGroups] = useState();
  const [assigneeGroups, setAssigneeGroup] = useState();
  const [priorityGroups, setPriorityGroups] = useState();
  const fetchTaskGroups = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}/tasks`, {
        params: { groupBy: 'STATUS' },
      })
      .then((res) => {
        setGroups(res.data.tasks);
      })
      .catch((error) => console.log(error));
  };

  const fetchTaskGroupsByAssignee = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}/tasks`, {
        params: { groupBy: 'ASSIGNEE' },
      })
      .then((res) => {
        setAssigneeGroup(res.data.tasks);
      })
      .catch((error) => console.log(error));
  };

  const fetchTaskGroupsByPriority = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}/tasks`, {
        params: { groupBy: 'PRIORITY' },
      })
      .then((res) => {
        setPriorityGroups(res.data.tasks);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchTaskGroups();
    fetchTaskGroupsByAssignee();
    fetchTaskGroupsByPriority();
  }, [projectId]);

  const status = [];

  groups?.forEach((group) => {
    if (group.tasks.length) {
      status.push({
        name: group.name,
        value: group.tasks.length,
      });
    }
  });

  // const pieColors = colors.slice(0, groups?.length - 2);
  const assignees = [];

  assigneeGroups?.forEach((group) => {
    if (group.tasks.length) {
      assignees.push({
        name: group.name,
        count: group.tasks.length,
      });
    }
  });

  const priorities = [];

  priorityGroups?.forEach((group) => {
    if (group.tasks.length) {
      priorities.push({
        priority: group.name,
        count: group.tasks.length,
      });
    }
  });

  const statusConfig = {
    appendPadding: 10,
    data: status,
    angleField: 'value',
    colorField: 'name',
    legend: {
      position: 'top',
    },
    color: ({ name }) => {
      if (name === 'To Do') {
        return 'grey';
      }
      if (name === 'Done') {
        return 'darkgreen';
      }
      return 'orange';
    },
    radius: 1,
    innerRadius: 0.3,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{name} {value}',
      style: {
        textAlign: 'center',
        fontSize: 12,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
  };

  const assigneeConfig = {
    data: assignees,
    minBarWidth: 40,
    maxBarWidth: 100,
    xField: 'count',
    yField: 'name',
    seriesField: 'name',
    colors: colors,
    marginRatio: 0,
    legend: {
      position: 'top',
      offsetX: 0,
    },
    label: {
      content: (obj) => {
        if (obj.count < 2) return obj.count + ' task';
        return obj.count + ' tasks';
      },
      style: {
        autoEllipsis: false,
      },
    },
  };

  const priorityConfig = {
    data: priorities,
    maxColumnWidth: 100,
    xField: 'priority',
    yField: 'count',
    colorField: 'priority',
    color: ({priority}) => {
      if(priority === 'Highest') return 'red';
      if(priority === 'High') return 'orange';
      if(priority === 'Medium') return 'grey';
      if(priority === 'Low') return 'cyan';
      return 'blue'
    },
    // marginRatio: 0,
    label: {
      content: (obj) => {
        if (obj.count < 2) return obj.count + ' task';
        return obj.count + ' tasks';
      },
    },
  };

  return (
    <>
      <div className="flex-row-space-bt" style={{ width: '100%' }}>
        <Card
          title="Status overview"
          style={{
            width: '48%',
            background: '#E7F6F2',
          }}
        >
          <Pie {...statusConfig} />
        </Card>
        <Card
          title="Workload overview"
          style={{ width: '48%', background: '#E7F6F2' }}
        >
          <Bar {...assigneeConfig} />
        </Card>
      </div>
      <Card
        title="Priority overview"
        style={{ width: '100%', marginTop: '24px', background: '#E7F6F2' }}
      >
        <Column {...priorityConfig} />
      </Card>
    </>
  );
};

export default StatisticPage;
