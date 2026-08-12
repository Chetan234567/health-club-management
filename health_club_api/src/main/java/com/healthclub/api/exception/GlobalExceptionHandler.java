/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/exception/GlobalExceptionHandler.java
 * Description: Global REST Exception Handler converting Java exceptions to clean JSON HTTP response objects.
 */
package com.healthclub.api.exception;

import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<Map<String, Object>> notFound(ResourceNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(SubscriptionConflictException.class)
    ResponseEntity<Map<String, Object>> conflict(SubscriptionConflictException ex) {
        return error(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, Object>> badRequest(IllegalArgumentException ex) {
        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler({AuthenticationException.class, UsernameNotFoundException.class})
    ResponseEntity<Map<String, Object>> unauthorized(Exception ex) {
        String msg = ex.getMessage() != null && !ex.getMessage().isBlank() ? ex.getMessage() : "Invalid email or password credentials.";
        return error(HttpStatus.UNAUTHORIZED, msg);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .findFirst()
            .map(field -> field.getField() + " " + field.getDefaultMessage())
            .orElse("Validation failed");
        return error(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> generic(Exception ex) {
        System.err.println("[GlobalExceptionHandler] Caught unhandled exception: " + ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, ex.getMessage() != null ? ex.getMessage() : "Request processing error");
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "timestamp", LocalDateTime.now(),
            "status", status.value(),
            "error", status.getReasonPhrase(),
            "message", message
        ));
    }
}
