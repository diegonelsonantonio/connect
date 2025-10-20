// Define la estructura de nuestros datos para mantener el código limpio y predecible.

export interface Post {
  _id: string;
  user_id: string;
  username: string;
  image_url: string;
  description: string;
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
}

export interface Comment {
    comment_id: string;
    user_id: string;
    username: string;
    text: string;
    createdAt: string;
}
