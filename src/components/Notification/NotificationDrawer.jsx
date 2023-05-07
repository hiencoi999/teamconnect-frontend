import { BellOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Drawer, List, Typography } from "antd";
import axios from "axios";
import moment from "moment/moment";
import { BASE_URL } from "../../constant";
const { Text } = Typography;

const NotificationDrawer = (props) => {
  let result = props.notification;
  const onRefuseInvitation = async (invitationId) => {
    console.log(invitationId);
    await axios
      .delete(`${BASE_URL}/user/invitation/${invitationId}`)
      .then((res) => {
        props.fetchNotifications()
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onAcceptInvitation = async (invitationId) => {
    await axios
      .post(`${BASE_URL}/user/invitation/${invitationId}`)
      .then((res) => {
        props.fetchNotifications()
        props.fetchProjects()
        props.fetchChannels()
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Drawer
      title={
        <>
          <BellOutlined /> Notifications
        </>
      }
      placement="right"
      size="large"
      closable={true}
      onClose={props.onClose}
      open={props.open}
    >
      <List
        itemLayout="horizontal"
        dataSource={result}
        renderItem={(item) => (
          <>
            <List.Item
              // key={index}
              actions={[
                <Button
                  size="small"
                  style={{ color: "red" }}
                  onClick={() => onRefuseInvitation(item._id)}
                >
                  <CloseOutlined />
                </Button>,
                <Button
                  size="small"
                  style={{ color: "green" }}
                  onClick={() => onAcceptInvitation(item._id)}
                >
                  <CheckOutlined />
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<img style={{borderRadius: '50%'}} src={item.from?.picture} referrerPolicy="no-referrer" alt="" />}
                title={
                  <>
                    <Text keyboard>{item.from?.email}</Text> invited you to
                    project{" "}
                    <Text type="success" italic>
                      {item.project?.name}
                    </Text>
                  </>
                }
                description={moment(item?.createdAt).format("LL")}
              />
            </List.Item>
          </>
        )}
      />
    </Drawer>
  );
};

export default NotificationDrawer;
