import { Tag } from 'antd';

export const items = [
  {
    title: 'Step 1',
    description: 'This is a Step 1.',
  },
  {
    title: 'Step 2',
    description: 'This is a Step 2.',
  },
  {
    title: 'Step 3',
    description: 'This is a Step 3.',
  },
];

export const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess('ok');
  }, 0);
};



export const priority = [
  { label: <Tag color={'red'}>Highest</Tag>, value: 'Highest' },
  { label: <Tag color={'orange'}>High</Tag>, value: 'High' },
  { label: <Tag color={'grey'}>Medium</Tag>, value: 'Medium' },
  { label: <Tag color={'cyan'}>Low</Tag>, value: 'Low' },
  { label: <Tag color={'blue'}>Lowest</Tag>, value: 'Lowest' },
];

export const getColorPriority = (priority) => {
  switch (priority) {
    case 'Highest':
      return 'red';
    case 'High':
      return 'orange';
    case 'Medium':
      return 'grey';
    case 'Low':
      return 'cyan';
    case 'Lowest':
      return 'blue';
    default:
      break;
  }
};
