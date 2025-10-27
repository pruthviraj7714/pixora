interface IPost {
  id: string;
  userId: string;
  title: string;
  description: string;
  image: string;
  category: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
  _count: {
    likedBy: number;
    comments: number;
  };
}

export interface IAdminDashboardData {
  overview: {
    totalUsers: number;
    totalPosts: number;
    totalComments: number;
    approvedPosts: number;
    pendingPosts: number;
    totalLikes: number;
  };
  recentPosts: IPost[];
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  _count: {
    posts: number;
    comments: number;
    savedPosts: number;
  };
}

export interface IAdminMedia {
  totalPosts: number;
  approvedPosts: number;
  pendingPosts: number;
  totalLikes: number;
  totalComments: number;
  postsByCategory: [
    {
      _count: number;
      category: string;
    }
  ];
  topPosts: {
    id: string;
    userId: string;
    title: string;
    description: string;
    image: string;
    category: string;
    status: "APPROVED" | "REJECTED" | "PENDING";
    createdAt: string;
    user: {
      username: string;
    };
    _count: {
      likedBy: number;
    };
  }[];
  uploadsOverTime: {
    _count: number;
    createdAt: string;
  }[];
}

export interface IUsersData {
  totalUsers: number;
  adminCount: number;
  regularUsers: number;
  activeUsers: number;
  userGrowth: {
    _count: number;
    createdAt: string;
  }[];
}

export interface IReportsData {
  id: string;
  reporterId: string;
  createdAt: Date;
  postId: string;
  reason: string;
  status: "REVIEWED" | "PENDING";
  post: {
    id: string;
    title: string;
    image: string;
  };
  reporter: {
    username: string;
  };
}
