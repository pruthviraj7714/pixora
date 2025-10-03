
export interface IPost {
    id: string;
    userId: string;
    title: string;
    description: string;
    image: string;
    category: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    likes: number;
    createdAt: Date;
  }