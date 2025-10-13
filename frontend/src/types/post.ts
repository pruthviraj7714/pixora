import { IComment } from "./comment";

export interface IPost {
    id: string;
    userId: string;
    title: string;
    description: string;
    image: string;
    user : {
      username : string;
    },
    savedBy : {
      id : string
    }[],
    likedBy : {
      id : string
    }[],
    likes : number;
    _count : {
      likedBy : number,
      comments : number
    }
    isSaved? : boolean;
    isLiked? : boolean;
    comments  : IComment[],
    category: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
  }


  export interface ISavedPost {
    id: string;
    userId: string;
    postId: string;
    post : IPost
  }