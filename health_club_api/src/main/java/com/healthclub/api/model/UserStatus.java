/*
 * Entity Flow: Hibernate maps this class to a normalized database table.
 * Relationships here define how tables connect through foreign keys.
 */
// Short flow: Entity fields become table columns and relationships become foreign keys.
package com.healthclub.api.model;

public enum UserStatus {
    ACTIVE,
    INACTIVE
}
