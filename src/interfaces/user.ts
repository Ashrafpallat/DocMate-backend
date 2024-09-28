// types/user.ts

import { ObjectId } from "mongodb";

export interface User {
    id: ObjectId; // or any appropriate type
    name: string;
    email: string;
    // Add any other properties that should be part of the user object
  }
  