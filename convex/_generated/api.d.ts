/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as achievements from "../achievements.js";
import type * as budgets from "../budgets.js";
import type * as challenges from "../challenges.js";
import type * as contacts from "../contacts.js";
import type * as dashboard from "../dashboard.js";
import type * as email from "../email.js";
import type * as emailTest from "../emailTest.js";
import type * as expenses from "../expenses.js";
import type * as gamification from "../gamification.js";
import type * as groups from "../groups.js";
import type * as inngest from "../inngest.js";
import type * as notifications from "../notifications.js";
import type * as personalFinance from "../personalFinance.js";
import type * as seed from "../seed.js";
import type * as settlements from "../settlements.js";
import type * as social from "../social.js";
import type * as testEmail from "../testEmail.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  budgets: typeof budgets;
  challenges: typeof challenges;
  contacts: typeof contacts;
  dashboard: typeof dashboard;
  email: typeof email;
  emailTest: typeof emailTest;
  expenses: typeof expenses;
  gamification: typeof gamification;
  groups: typeof groups;
  inngest: typeof inngest;
  notifications: typeof notifications;
  personalFinance: typeof personalFinance;
  seed: typeof seed;
  settlements: typeof settlements;
  social: typeof social;
  testEmail: typeof testEmail;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
