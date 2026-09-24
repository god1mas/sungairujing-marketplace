import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export const getAuthenticatedSession = () => getServerSession(authOptions);
