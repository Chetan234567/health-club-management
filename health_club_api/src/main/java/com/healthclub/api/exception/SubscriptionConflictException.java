/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/exception/SubscriptionConflictException.java
 * Description: Exception thrown when a member attempts to purchase a plan while already having an ACTIVE subscription (HTTP 409 Conflict).
 */
package com.healthclub.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SubscriptionConflictException extends RuntimeException {
    public SubscriptionConflictException(String message) {
        super(message);
    }
}
