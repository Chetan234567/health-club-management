/*
 * Application Flow: main() starts Spring Boot -> components are scanned -> REST APIs and Hibernate become active.
 * Run this class to start the service.
 */
// Short flow: Start Spring Boot service and load application context.
package com.healthclub.api.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
