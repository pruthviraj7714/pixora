export interface INotification {
  id: string;
  userId: string;
  type: "MEDIA_APPROVED" | "MEDIA_REJECTED";
  read: boolean;
  createdAt: string;
  message?: string;
  postId: string;
  user : {
    username : string;
  }
  mediaUrl: string;
  mediaTitle: string;
}
