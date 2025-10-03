export interface IComment {
  id: string;
  text: string;
  userId: string;
  postId: string;
  user : {
    username : string;
    firstname : string;
    lastname : string;
  }
  createdAt: string;
}
