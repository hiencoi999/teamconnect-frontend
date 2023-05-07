import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Input,
  Popconfirm,
  Popover,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import Highlighter from 'react-highlight-words';
import { BASE_URL } from '../../constant';
import { StrictModeDroppable as Droppable } from '../../hooks/useStrictModeDroppable';
import TaskDetail from '../TaskDetail/TaskDetail';
import { getColorPriority } from '../TaskDetail/TaskDetail.config';
import './BoardView.css';
const { Text } = Typography;
dayjs.extend(relativeTime);

const BoardView = ({ project, members, socket }) => {
  let projectId = project._id;
  const [columns, setColumns] = useState([]);
  const [openTask, setOpenTask] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [openGroupPopover, setOpenGroupPopover] = useState(false);
  const [taskTitle, setTaskTitle] = useState();
  const [taskId, setTaskId] = useState();
  const [groupName, setGroupName] = useState();
  const [loading, setLoading] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const groupBy = useRef('STATUS');
  const page = useRef(1);

  const onDragEnd = async (result, columns, setColumns) => {
    if (searchValue !== '' || !result.destination) return;
    // if () return;
    const { source, destination } = result;
    if (result.type === 'group') {
      const [movedItem] = columns.splice(source.index, 1);
      columns.splice(destination.index, 0, movedItem);
      await axios
        .put(`${BASE_URL}/projects/${projectId}/groups`, {
          columns,
          groupBy: groupBy.current,
        })
        .then((res) => {
          if (res.status === 200) fetchTaskGroups();
        })
        .catch((error) => console.log(error));
    } else {
      if (source.droppableId !== destination.droppableId) {
        let [sourceColumn] = columns.filter(
          (column) => column._id === source.droppableId,
        );
        let [destColumn] = columns.filter(
          (column) => column._id === destination.droppableId,
        );
        const [movedItem] = sourceColumn.tasks.splice(source.index, 1);
        destColumn.tasks.splice(destination.index, 0, movedItem);
        await axios
          .put(`${BASE_URL}/projects/${projectId}/tasks`, {
            columns,
            groupBy: groupBy.current,
            taskId: movedItem._id,
            newGroupId: destination.droppableId,
          })
          .then((res) => {
            // if (res.status === 200) fetchTaskGroups();
          })
          .catch((error) => console.log(error));
      } else {
        let [sourceColumn] = columns.filter(
          (column) => column._id === source.droppableId,
        );
        const [movedItem] = sourceColumn.tasks.splice(source.index, 1);
        sourceColumn.tasks.splice(destination.index, 0, movedItem);

        await axios
          .put(`${BASE_URL}/projects/${projectId}/tasks`, {
            columns,
            groupBy: groupBy.current,
            taskId: movedItem._id,
            newGroupId: null,
          })
          .then((res) => {
            if (res.status === 200) fetchTaskGroups();
          })
          .catch((error) => console.log(error));
      }
    }
    setIsUpdated(!isUpdated);
    socket?.emit('updateBoard', members);
  };

  const onTaskTitleChange = (e) => {
    setTaskTitle(e.target.value);
  };

  const onSearch = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCreateTask = async () => {
    await axios
      .post(`${BASE_URL}/projects/${projectId}/tasks`, {
        title: taskTitle,
      })
      .then((res) => {
        if (res.status === 201) {
          setTaskTitle();
          setOpenPopover(false);
          fetchTaskGroups();
        }
      })
      .catch((error) => console.log(error));
  };

  const fetchTaskGroups = async () => {
    await axios
      .get(`${BASE_URL}/projects/${projectId}/tasks`, {
        params: { groupBy: groupBy.current },
      })
      .then((res) => {
        setColumns(res.data.tasks);
        setLoading(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    socket?.on('getNewBoard', (email) => {
      if (email) fetchTaskGroups();
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTaskGroups();
  }, [projectId]);

  const onGroupNameChange = (e) => {
    setGroupName(e.target.value);
  };

  const handleCreateNewGroup = async () => {
    await axios
      .post(`${BASE_URL}/projects/${projectId}/groups`, {
        name: groupName,
      })
      .then((res) => {
        setGroupName();
        setOpenGroupPopover(false);
        fetchTaskGroups();
      })
      .catch((error) => console.log(error));
    socket?.emit('updateBoard', members);
  };

  const onDeleteGroup = async (groupId) => {
    await axios
      .delete(`${BASE_URL}/projects/${projectId}/groups/${groupId}`)
      .then((res) => {
        fetchTaskGroups();
      })
      .catch((error) => {
        console.log(error);
        message.warning('Action failed!');
      });
    socket?.emit('updateBoard', members);
  };

  return (
    <>
      {loading ? (
        <div>Loading</div>
      ) : (
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          <Droppable droppableId="group" type="group" direction="horizontal">
            {(provided) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <>
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="board-background"
                    >
                      {columns?.map((taskGroup, index) => (
                        <Draggable
                          key={taskGroup._id}
                          draggableId={taskGroup._id}
                          index={index}
                        >
                          {(provided) => {
                            return (
                              <div
                                key={index}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="board-column"
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                              >
                                <div className="column-top">
                                  <Badge
                                    color="#3C4040"
                                    count={taskGroup?.tasks.length}
                                    showZero
                                  />
                                  <Typography.Text
                                    style={{
                                      maxWidth: '10rem',
                                      fontSize: '1rem',
                                      color:
                                        taskGroup.type === 'DOING'
                                          ? 'ORANGE'
                                          : taskGroup.type === 'END'
                                          ? 'GREEN'
                                          : 'GREY',
                                    }}
                                    code
                                    strong
                                    ellipsis={true}
                                  >
                                    {taskGroup.name}
                                  </Typography.Text>
                                  {groupBy.current === 'STATUS' &&
                                    taskGroup.type === 'DOING' && (
                                      <Popconfirm
                                        title="You can only delete this status if there are no tasks"
                                        okText="Delete"
                                        placement="bottom"
                                        showCancel={false}
                                        onConfirm={() =>
                                          onDeleteGroup(taskGroup._id)
                                        }
                                      >
                                        <Button type="ghost" danger>
                                          <DeleteOutlined />
                                        </Button>
                                      </Popconfirm>
                                    )}
                                </div>

                                <div className="column-body">
                                  <Droppable
                                    droppableId={taskGroup?._id}
                                    key={taskGroup?._id}
                                  >
                                    {(provided, snapshot) => {
                                      return (
                                        <div
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className="column-content-above"
                                          style={{
                                            background: snapshot.isDraggingOver
                                              ? '#E7F6F2'
                                              : '#A5C9CA',
                                          }}
                                        >
                                          {taskGroup.tasks.map(
                                            (item, index2) => {
                                              return (
                                                <>
                                                  <Draggable
                                                    key={item?._id}
                                                    draggableId={item?._id}
                                                    index={index2}
                                                  >
                                                    {(provided) => {
                                                      return (
                                                        <div
                                                          key={index2}
                                                          ref={
                                                            provided.innerRef
                                                          }
                                                          {...provided.draggableProps}
                                                          {...provided.dragHandleProps}
                                                          style={{
                                                            ...provided
                                                              .draggableProps
                                                              .style,
                                                          }}
                                                        >
                                                          {(item.title.includes(
                                                            searchValue,
                                                          ) ||
                                                            `#${item.key}`.includes(
                                                              searchValue,
                                                            )) && (
                                                            <Badge.Ribbon
                                                              text={
                                                                `#${item.key}` +
                                                                `${
                                                                  item.dueDate
                                                                    ? ' - ' +
                                                                      dayjs(
                                                                        new Date(),
                                                                      ).to(
                                                                        item.dueDate,
                                                                      )
                                                                    : ''
                                                                } `
                                                              }
                                                              color={
                                                                taskGroup.type ===
                                                                'END'
                                                                  ? 'darkgreen'
                                                                  : item.dueDate
                                                                  ? new Date(
                                                                      item.dueDate,
                                                                    ) <
                                                                      new Date() &&
                                                                    taskGroup.type !==
                                                                      'END'
                                                                    ? 'red'
                                                                    : ''
                                                                  : ''
                                                              }
                                                              placement="start"
                                                            >
                                                              <Card
                                                                className="task-body"
                                                                onClick={() => {
                                                                  setOpenTask(
                                                                    true,
                                                                  );
                                                                  setTaskId(
                                                                    item._id,
                                                                  );
                                                                }}
                                                              >
                                                                <Space
                                                                  direction="vertical"
                                                                  style={{
                                                                    width:
                                                                      '100%',
                                                                  }}
                                                                >
                                                                  <div className="flex-row-space-bt">
                                                                    <img
                                                                      src={
                                                                        item
                                                                          .assignee
                                                                          ?.user
                                                                          .picture
                                                                      }
                                                                      alt=""
                                                                      style={{
                                                                        height:
                                                                          '24px',
                                                                        borderRadius:
                                                                          '50%',
                                                                      }}
                                                                    ></img>
                                                                    <Tag
                                                                      color={getColorPriority(
                                                                        item.priority,
                                                                      )}
                                                                    >
                                                                      {
                                                                        item.priority
                                                                      }
                                                                    </Tag>
                                                                  </div>
                                                                  <Text strong>
                                                                    <Highlighter
                                                                      highlightClassName="YourHighlightClass"
                                                                      searchWords={[
                                                                        `${searchValue}`,
                                                                      ]}
                                                                      autoEscape={
                                                                        false
                                                                      }
                                                                      textToHighlight={
                                                                        item.title
                                                                      }
                                                                    />
                                                                  </Text>
                                                                </Space>
                                                              </Card>
                                                            </Badge.Ribbon>
                                                          )}
                                                        </div>
                                                      );
                                                    }}
                                                  </Draggable>
                                                </>
                                              );
                                            },
                                          )}
                                          {provided.placeholder}
                                          {taskGroup.type === 'START' ? (
                                            <div className="column-content-below">
                                              <Popover
                                                content={
                                                  <>
                                                    <TextArea
                                                      required
                                                      value={taskTitle}
                                                      style={{
                                                        height: 120,
                                                        width: 360,
                                                      }}
                                                      showCount
                                                      maxLength={255}
                                                      allowClear="true"
                                                      onChange={
                                                        onTaskTitleChange
                                                      }
                                                      onPressEnter={
                                                        handleCreateTask
                                                      }
                                                    />
                                                    <br></br>
                                                  </>
                                                }
                                                title="What need to be done?"
                                                trigger="click"
                                                open={openPopover}
                                                onOpenChange={(newOpen) =>
                                                  setOpenPopover(newOpen)
                                                }
                                              >
                                                <Button
                                                  type="primary"
                                                  icon={<PlusOutlined />}
                                                  style={{
                                                    width: '100%',
                                                    border: 'solid thin black',
                                                  }}
                                                >
                                                  Add new issue
                                                </Button>
                                              </Popover>
                                            </div>
                                          ) : null}
                                          {provided.placeholder}
                                        </div>
                                      );
                                    }}
                                  </Droppable>
                                </div>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                    <Space
                      direction="vertical"
                      style={{ margin: '8px 0px 0px 8px' }}
                    >
                      <Input
                        allowClear
                        placeholder="Search board"
                        onChange={onSearch}
                        prefix={<SearchOutlined />}
                      />
                      <Select
                        value={groupBy.current}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          groupBy.current = value;
                          fetchTaskGroups();
                        }}
                        options={[
                          { value: 'PRIORITY', label: 'Group By: Priority' },
                          { value: 'ASSIGNEE', label: 'Group By: Assignee' },
                          { value: 'STATUS', label: 'Group By: Status' },
                        ]}
                      />

                      {groupBy.current === 'STATUS' && (
                        <Popover
                          placement="bottom"
                          content={
                            <Input.Group compact>
                              <Input
                                required
                                value={groupName}
                                style={{
                                  width: 'calc(100% - 40px)',
                                }}
                                showCount
                                maxLength={30}
                                allowClear="true"
                                onChange={onGroupNameChange}
                              />
                              <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleCreateNewGroup}
                              />
                            </Input.Group>
                          }
                          title="Column name: "
                          trigger="click"
                          open={openGroupPopover}
                          onOpenChange={(newOpen) =>
                            setOpenGroupPopover(newOpen)
                          }
                        >
                          <Button
                            style={{ width: '100%' }}
                            icon={<PlusOutlined />}
                          >
                            Add more columns
                          </Button>
                        </Popover>
                      )}
                    </Space>
                  </>
                </div>
              );
            }}
          </Droppable>
        </DragDropContext>
      )}
      {taskId && projectId && (
        <TaskDetail
          open={openTask}
          onCancel={() => setOpenTask(false)}
          fetchTaskGroups={fetchTaskGroups}
          page={page}
          taskId={taskId}
          setTaskId={setTaskId}
          projectId={projectId}
          members={members}
          socket={socket}
          isUpdated={isUpdated}
        />
      )}
    </>
  );
};
export default BoardView;
