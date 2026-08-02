/*
 * Entity Flow: Hibernate maps this class to a normalized database table.
 * Relationships here define how tables connect through foreign keys.
 */
// Short flow: Entity fields become table columns and relationships become foreign keys.
package com.healthclub.api.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
}
