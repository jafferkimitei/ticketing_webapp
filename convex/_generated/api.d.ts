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
import type * as functions_bulkManageTickets from "../functions/bulkManageTickets.js";
import type * as functions_bulkRefundTickets from "../functions/bulkRefundTickets.js";
import type * as functions_createEvent from "../functions/createEvent.js";
import type * as functions_createNotification from "../functions/createNotification.js";
import type * as functions_createPromoCode from "../functions/createPromoCode.js";
import type * as functions_escrow from "../functions/escrow.js";
import type * as functions_exportAnalytics from "../functions/exportAnalytics.js";
import type * as functions_exportTicketsToCSV from "../functions/exportTicketsToCSV.js";
import type * as functions_flagReview from "../functions/flagReview.js";
import type * as functions_generateCalendarLink from "../functions/generateCalendarLink.js";
import type * as functions_getDynamicPrice from "../functions/getDynamicPrice.js";
import type * as functions_getEventReview from "../functions/getEventReview.js";
import type * as functions_getEventTickets from "../functions/getEventTickets.js";
import type * as functions_getEvents from "../functions/getEvents.js";
import type * as functions_getEventsWithFilters from "../functions/getEventsWithFilters.js";
import type * as functions_getNotifications from "../functions/getNotifications.js";
import type * as functions_getOrganizerEvents from "../functions/getOrganizerEvents.js";
import type * as functions_getPayoutByTransactionId from "../functions/getPayoutByTransactionId.js";
import type * as functions_getPayouts from "../functions/getPayouts.js";
import type * as functions_getRecommendedEvents from "../functions/getRecommendedEvents.js";
import type * as functions_getResponse from "../functions/getResponse.js";
import type * as functions_getSalesAnalytics from "../functions/getSalesAnalytics.js";
import type * as functions_getScanningStats from "../functions/getScanningStats.js";
import type * as functions_getUserTickets from "../functions/getUserTickets.js";
import type * as functions_getUserTicketsWithFilters from "../functions/getUserTicketsWithFilters.js";
import type * as functions_joinWaitlist from "../functions/joinWaitlist.js";
import type * as functions_markNotificationRead from "../functions/markNotificationRead.js";
import type * as functions_notifyWaitlist from "../functions/notifyWaitlist.js";
import type * as functions_processRefund from "../functions/processRefund.js";
import type * as functions_purchaseTicket from "../functions/purchaseTicket.js";
import type * as functions_refundTicket from "../functions/refundTicket.js";
import type * as functions_registerPushSubscription from "../functions/registerPushSubscription.js";
import type * as functions_releasePayouts from "../functions/releasePayouts.js";
import type * as functions_searchEvents from "../functions/searchEvents.js";
import type * as functions_sendPushNotification from "../functions/sendPushNotification.js";
import type * as functions_sendWelcomeEmail from "../functions/sendWelcomeEmail.js";
import type * as functions_submitFeedback from "../functions/submitFeedback.js";
import type * as functions_submitResponse from "../functions/submitResponse.js";
import type * as functions_submitReview from "../functions/submitReview.js";
import type * as functions_updateEvent from "../functions/updateEvent.js";
import type * as functions_updatePayoutStatus from "../functions/updatePayoutStatus.js";
import type * as functions_updateUserPreferences from "../functions/updateUserPreferences.js";
import type * as functions_validatePromoCode from "../functions/validatePromoCode.js";
import type * as functions_verifyTicket from "../functions/verifyTicket.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/bulkManageTickets": typeof functions_bulkManageTickets;
  "functions/bulkRefundTickets": typeof functions_bulkRefundTickets;
  "functions/createEvent": typeof functions_createEvent;
  "functions/createNotification": typeof functions_createNotification;
  "functions/createPromoCode": typeof functions_createPromoCode;
  "functions/escrow": typeof functions_escrow;
  "functions/exportAnalytics": typeof functions_exportAnalytics;
  "functions/exportTicketsToCSV": typeof functions_exportTicketsToCSV;
  "functions/flagReview": typeof functions_flagReview;
  "functions/generateCalendarLink": typeof functions_generateCalendarLink;
  "functions/getDynamicPrice": typeof functions_getDynamicPrice;
  "functions/getEventReview": typeof functions_getEventReview;
  "functions/getEventTickets": typeof functions_getEventTickets;
  "functions/getEvents": typeof functions_getEvents;
  "functions/getEventsWithFilters": typeof functions_getEventsWithFilters;
  "functions/getNotifications": typeof functions_getNotifications;
  "functions/getOrganizerEvents": typeof functions_getOrganizerEvents;
  "functions/getPayoutByTransactionId": typeof functions_getPayoutByTransactionId;
  "functions/getPayouts": typeof functions_getPayouts;
  "functions/getRecommendedEvents": typeof functions_getRecommendedEvents;
  "functions/getResponse": typeof functions_getResponse;
  "functions/getSalesAnalytics": typeof functions_getSalesAnalytics;
  "functions/getScanningStats": typeof functions_getScanningStats;
  "functions/getUserTickets": typeof functions_getUserTickets;
  "functions/getUserTicketsWithFilters": typeof functions_getUserTicketsWithFilters;
  "functions/joinWaitlist": typeof functions_joinWaitlist;
  "functions/markNotificationRead": typeof functions_markNotificationRead;
  "functions/notifyWaitlist": typeof functions_notifyWaitlist;
  "functions/processRefund": typeof functions_processRefund;
  "functions/purchaseTicket": typeof functions_purchaseTicket;
  "functions/refundTicket": typeof functions_refundTicket;
  "functions/registerPushSubscription": typeof functions_registerPushSubscription;
  "functions/releasePayouts": typeof functions_releasePayouts;
  "functions/searchEvents": typeof functions_searchEvents;
  "functions/sendPushNotification": typeof functions_sendPushNotification;
  "functions/sendWelcomeEmail": typeof functions_sendWelcomeEmail;
  "functions/submitFeedback": typeof functions_submitFeedback;
  "functions/submitResponse": typeof functions_submitResponse;
  "functions/submitReview": typeof functions_submitReview;
  "functions/updateEvent": typeof functions_updateEvent;
  "functions/updatePayoutStatus": typeof functions_updatePayoutStatus;
  "functions/updateUserPreferences": typeof functions_updateUserPreferences;
  "functions/validatePromoCode": typeof functions_validatePromoCode;
  "functions/verifyTicket": typeof functions_verifyTicket;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
