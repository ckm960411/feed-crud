# 바로팟 채팅 웹소켓 API

바로팟 채팅 기능을 위한 웹소켓 API 문서입니다.

## 연결 정보

- **Namespace**: `/baropot-chat`
- **전송 방식**: WebSocket
- **인증**: JWT 토큰 필요

## 인증 방법

JWT 토큰을 `headers.token`에 전달:

```javascript
const socket = io('/baropot-chat', {
  extraHeaders: {
    token: 'your-jwt-token',
  },
});
```

## 이벤트 목록

### 클라이언트 → 서버 이벤트

#### 1. JOIN_ROOM - 채팅방 입장

**이벤트명**: `JOIN_ROOM`

**요청 데이터**:

```typescript
{
  baropotChatRoomId: number;
}
```

**응답 데이터**:

```typescript
{
  success: boolean,
  message: string
}
```

**설명**: 사용자가 바로팟 채팅방에 입장합니다. 입장 성공 시 해당 소켓이 `room_{baropotChatRoomId}`에 join됩니다.

#### 2. LEAVE_ROOM - 채팅방 나가기

**이벤트명**: `LEAVE_ROOM`

**요청 데이터**:

```typescript
{
  baropotChatRoomId: number;
}
```

**응답 데이터**:

```typescript
{
  success: boolean,
  message: string
}
```

**설명**: 사용자가 바로팟 채팅방에서 나갑니다. 소켓이 해당 채팅방 룸에서 제거됩니다.

#### 3. SEND_MESSAGE - 메시지 전송

**이벤트명**: `SEND_MESSAGE`

**요청 데이터**:

```typescript
{
  baropotChatRoomId: number,
  content: string // 최대 1000자
}
```

**응답 데이터**:

```typescript
{
  success: boolean,
  messageId?: string,
  message?: string
}
```

**설명**: 사용자가 바로팟 채팅방에 메시지를 전송합니다. 메시지는 MongoDB에 저장되고 같은 채팅방의 모든 사용자에게 전송됩니다.

#### 4. MARK_AS_READ - 메시지 읽음 처리

**이벤트명**: `MARK_AS_READ`

**요청 데이터**:

```typescript
{
  baropotChatRoomId: number;
}
```

**응답 데이터**:

```typescript
{
  success: boolean,
  message?: string
}
```

**설명**: 사용자가 바로팟 채팅방의 메시지를 읽음 처리합니다. 읽음 처리는 MongoDB에 저장됩니다.

### 서버 → 클라이언트 이벤트

#### 1. NEW_MESSAGE - 새 메시지 수신

**이벤트명**: `NEW_MESSAGE`

**데이터**:

```typescript
{
  messageId: string,
  baropotChatRoomId: number,
  senderId: number,
  senderName: string,
  content: string,
  timestamp: Date
}
```

**설명**: 같은 채팅방의 다른 사용자가 메시지를 보냈을 때 수신됩니다.

#### 2. MESSAGES_READ - 메시지 읽음 처리 완료

**이벤트명**: `MESSAGES_READ`

**데이터**:

```typescript
{
  baropotChatRoomId: number,
  userId: number,
  timestamp: Date
}
```

**설명**: 메시지 읽음 처리가 완료되었을 때 해당 사용자에게 전송됩니다.

## React 사용 예시

### 기본 연결 및 채팅 기능

```jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function ChatComponent() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // JWT 토큰 가져오기 (예: localStorage, context 등)
    const token = localStorage.getItem('jwt-token');

    // 웹소켓 연결
    const newSocket = io('/baropot-chat', {
      extraHeaders: {
        token: token,
      },
    });

    // 연결 성공 시 채팅방 입장
    newSocket.on('connect', () => {
      console.log('웹소켓 연결 성공');
      newSocket.emit('JOIN_ROOM', { baropotChatRoomId: 1 });
    });

    // 새 메시지 수신
    newSocket.on('NEW_MESSAGE', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      socket.emit('SEND_MESSAGE', {
        baropotChatRoomId: 1,
        content: inputMessage,
      });
      setInputMessage('');
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.senderName}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>전송</button>
    </div>
  );
}
```

## 에러 처리

```jsx
// 연결 실패
socket.on('connect_error', (error) => {
  console.error('웹소켓 연결 실패:', error);
});

// 인증 실패
socket.on('unauthorized', (error) => {
  console.error('인증 실패:', error);
});

// 연결 해제
socket.on('disconnect', (reason) => {
  console.log('웹소켓 연결 해제:', reason);
});
```

## 주의사항

1. **인증**: JWT 토큰을 `headers.token`에 전달해야 합니다.
2. **채팅방 권한**: 채팅방 입장 시 해당 바로팟에 참여한 사용자만 입장할 수 있습니다.
3. **메시지 길이**: 메시지 내용은 최대 1000자로 제한됩니다.
4. **연결 유지**: 컴포넌트 언마운트 시 소켓 연결을 정리해야 합니다.
