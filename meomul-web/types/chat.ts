export type ChatStatus = "WAITING" | "ACTIVE" | "CLOSED";
export type ChatScope = "HOTEL" | "SUPPORT";
export type SenderType = "GUEST" | "AGENT";
export type MessageType = "TEXT" | "IMAGE" | "FILE";
export type ChatGuestMemberType =
  | "USER"
  | "AGENT"
  | "ADMIN"
  | "ADMIN_OPERATOR"
  | "OWNER";

export interface PaginationInput {
  page: number;
  limit: number;
  sort: string;
  direction: 1 | -1;
}

export interface MetaCounterDto {
  total: number;
}

export interface MessageDto {
  senderId: string;
  senderType: SenderType;
  messageType: MessageType;
  content?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  read: boolean;
  timestamp: string;
}

export interface ChatDto {
  _id: string;
  guestId: string;
  guestNick?: string | null;
  guestImage?: string | null;
  guestMemberType?: ChatGuestMemberType | null;
  hotelId?: string | null;
  bookingId?: string | null;
  chatScope: ChatScope;
  supportTopic?: string | null;
  sourcePath?: string | null;
  assignedAgentId?: string | null;
  chatStatus: ChatStatus;
  unreadGuestMessages: number;
  unreadAgentMessages: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: MessageDto | null;
  messages?: MessageDto[];
}

export interface ChatsDto {
  list: ChatDto[];
  metaCounter: MetaCounterDto;
}

export interface GetMyChatsQueryData {
  getMyChats: ChatsDto;
}

export interface GetMyChatsQueryVars {
  input: PaginationInput;
}

export interface GetHotelChatsQueryData {
  getHotelChats: ChatsDto;
}

export interface GetHotelChatsQueryVars {
  hotelId: string;
  input: PaginationInput;
  statusFilter?: ChatStatus;
}

export interface GetOperatorChatsQueryData {
  getOperatorChats: ChatsDto;
}

export interface GetOperatorChatsQueryVars {
  input: PaginationInput;
  scopeFilter?: ChatScope;
  statusFilter?: ChatStatus;
  hotelId?: string;
}

export interface GetChatQueryData {
  getChat: ChatDto;
}

export interface GetChatQueryVars {
  chatId: string;
}

export interface GetMyUnreadChatCountQueryData {
  getMyUnreadChatCount: number;
}

export interface StartChatInput {
  hotelId: string;
  initialMessage: string;
  bookingId?: string;
}

export interface StartChatMutationData {
  startChat: ChatDto;
}

export interface StartChatMutationVars {
  input: StartChatInput;
}

export interface StartSupportChatInput {
  initialMessage: string;
  bookingId?: string;
  topic?: string;
  sourcePath?: string;
}

export interface StartSupportChatMutationData {
  startSupportChat: ChatDto;
}

export interface StartSupportChatMutationVars {
  input: StartSupportChatInput;
}

export interface SendMessageInput {
  chatId: string;
  messageType: MessageType;
  content?: string;
  imageUrl?: string;
  fileUrl?: string;
}

export interface SendMessageMutationData {
  sendMessage: ChatDto;
}

export interface SendMessageMutationVars {
  input: SendMessageInput;
}

export interface MarkChatMessagesAsReadMutationData {
  markChatMessagesAsRead: ChatDto;
}

export interface MarkChatMessagesAsReadMutationVars {
  chatId: string;
}

export interface ClaimChatMutationData {
  claimChat: ChatDto;
}

export interface ClaimChatMutationVars {
  input: {
    chatId: string;
  };
}

export interface CloseChatMutationData {
  closeChat: ChatDto;
}

export interface CloseChatMutationVars {
  chatId: string;
}

export interface ReassignChatMutationData {
  reassignChat: ChatDto;
}

export interface ReassignChatMutationVars {
  chatId: string;
  newAgentId: string;
}
