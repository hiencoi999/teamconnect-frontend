import { Bar, Pie } from '@ant-design/plots';
import { Card } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../constant';
const StatisticPage = () => {
  const params = useParams();
  const [groups, setGroups] = useState();
  console.log({groups})
  const fetchTaskGroups = async () => {
    await axios
      .get(`${BASE_URL}/projects/${params.projectId}/tasks`, {params: {groupBy: "STATUS"}})
      .then((res) => {
        console.log("A", res.data.tasks)
        setGroups(res.data.tasks);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    fetchTaskGroups();
  }, [params.projectId]);

  const data = [];

  groups?.forEach((group) => {
    data.push({
      type: group.name,
      value: group.tasks.length,
    });
  });

  const data2 = [
    {
      action: '浏览网站',
      pv: 50000,
    },
    {
      action: '放入购物车',
      pv: 35000,
    },
    {
      action: '生成订单',
      pv: 25000,
    },
    {
      action: '支付订单',
      pv: 15000,
    },
    {
      action: '完成交易',
      pv: 8500,
    },
  ];

  const config2 = {
    data: data2,
    xField: 'pv',
    yField: 'action',
    conversionTag: {},
    // legend: {
    //   position: 'top-left',
    // },
  };

  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.5,
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{value} issues',
      style: {
        textAlign: 'center',
        fontSize: 14,
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
    // statistic: {
    //   title: false,
    //   content: {
    //     style: {
    //       whiteSpace: 'pre-wrap',
    //       overflow: 'hidden',
    //       textOverflow: 'ellipsis',
    //     },
    //     content: 'AntV\nG2Plot',
    //   },
    // },
  };
  return (
    <div className='flex-row-center' style={{width: '100%'}}>
      <Card title="Status overview" style={{minWidth: '30vw', marginRight: '24px'}}>
        <Pie {...config} />
      </Card>
      <Card title="Workload overview" style={{minWidth: '30vw'}}>
        <Bar {...config2} />
      </Card>
    </div>
  );
};

export default StatisticPage;
