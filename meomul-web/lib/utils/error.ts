import { CombinedGraphQLErrors, CombinedProtocolErrors } from "@apollo/client/errors";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

const fromErrorLike = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  if ("message" in error && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (CombinedGraphQLErrors.is(error) && error.errors.length > 0) {
    const message = error.errors[0]?.message;
    if (message) {
      return message;
    }
  }

  if (CombinedProtocolErrors.is(error) && error.errors.length > 0) {
    const message = error.errors[0]?.message;
    if (message) {
      return message;
    }
  }

  const directMessage = fromErrorLike(error);
  if (directMessage) {
    return directMessage;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return FALLBACK_ERROR_MESSAGE;
};
