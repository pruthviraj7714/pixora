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
    comments  : IComment[],
    category: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    likes: number;
    createdAt: Date;
  }