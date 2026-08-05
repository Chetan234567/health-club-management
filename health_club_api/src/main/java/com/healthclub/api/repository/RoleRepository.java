/*
 * Repository Flow: Service -> Spring Data JPA repository -> Hibernate -> database table.
 * Derived query methods here keep database access clean and reusable.
 */
// Short flow: Spring Data converts method names into SQL through Hibernate.
package com.healthclub.api.repository;

import com.healthclub.api.model.Role;
import com.healthclub.api.model.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
