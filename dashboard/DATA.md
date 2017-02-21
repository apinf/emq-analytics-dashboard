# Available data for dashboard charts

### Schema

| Field              | Type     | Availability        | Description                    |
| ------------------ | -------- | ------------------- | ------------------------------ |
| **date**           | `String` | Yes                 | timestamp                      |
| **type**           | `String` | Yes                 | log type                       |
| **username**       | `String` | Yes                 | username                       |
| **topic_table**    | `String` | Depends on log type | List of topics to subscribe to |
| **topic_and_opts** | `String` | Depends on log type | Topic and options              |
| **reason**         | `String` | Depends on log type | Reason for session terminate   |
| **message**        | `Object` | Depends on log type | Message send via **publish**   |

#### `type` string possible options:
  - **on_client_connected**
  - **on_client_disconnected**
  - **on_client_subscribe**
  - **on_client_unsubscribe**
  - **on_session_created**
  - **on_session_subscribed**
  - **on_session_unsubscribed**
  - **on_session_terminated**
  - **on_message_publish**
  - **on_message_delivered**
  - **on_message_acked**

#### `message` object contents:
  - **from** - `String` - username
  - **qos** - `Integer` - a number that represents a Quality of Service level which defines the guarantee of the message delivery
  - **retain** - `Boolean` - determines if the message will be saved by the broker for the specified topic as a last known good value.
  - **topic** - `String` - Topic name to publish message to
  - **dup** - `Boolean` - indicates that that the message is a duplicate and is resent due to other end not sending a message of acknowledgment.

#### `topic_table` object contents:
  - **"topic_name"** - `Object`
    - **qos** - `Integer` - Quality of Service level

#### `topic_and_opts` object contains:
  - **opts** - `Object` - Options
    - **qos** - `Integer` - Quality of Service level
  - **topic** - `String` - Topic name
