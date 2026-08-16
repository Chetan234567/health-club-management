/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/dto/PaymentDtos.java
 * Description: Data Transfer Objects for Razorpay order creation, payment signature verification, and admin transaction logs.
 */
package com.healthclub.api.dto;

import java.math.BigDecimal;

public class PaymentDtos {

    public record CreateOrderRequest(
        Long memberId,
        Long planId
    ) {}

    public record CreateOrderResponse(
        String orderId,
        BigDecimal amount,
        String currency,
        String keyId,
        String planName,
        String memberName,
        String memberEmail,
        String memberPhone
    ) {}

    public record VerifyPaymentRequest(
        Long memberId,
        Long planId,
        String razorpayOrderId,
        String razorpayPaymentId,
        String razorpaySignature
    ) {}

    public record PaymentResponse(
        Long id,
        String razorpayOrderId,
        String razorpayPaymentId,
        String memberName,
        String memberEmail,
        String planName,
        BigDecimal amount,
        String currency,
        String paymentStatus,
        String paymentDate
    ) {}
}
