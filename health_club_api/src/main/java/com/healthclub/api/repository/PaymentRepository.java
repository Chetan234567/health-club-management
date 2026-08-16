/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/repository/PaymentRepository.java
 * Description: Spring Data JPA Repository for managing Razorpay Payment entities.
 */
package com.healthclub.api.repository;

import com.healthclub.api.model.Payment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByMember_IdOrderByPaymentDateDesc(Long memberId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
    List<Payment> findAllByOrderByPaymentDateDesc();
}
