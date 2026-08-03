/*
 * Entity Flow: Hibernate maps this class to a normalized database table.
 * Relationships here define how tables connect through foreign keys.
 */
// Short flow: Entity fields become table columns and relationships become foreign keys.
package com.healthclub.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 30)
    private RoleName name;

    @Column(length = 180)
    private String description;

    public Role(RoleName name, String description) {
        this.name = name;
        this.description = description;
    }
}
