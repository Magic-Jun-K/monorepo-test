declare namespace Auth {
  interface User {
    id: string;
    name: string;
    roles: string[];
  }

  interface State {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
  }

  interface Credentials {
    username: string;
    password: string;
  }
} 