/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/PaymentController.java
 * Controller: PaymentController (Base Endpoint Path: /api/payments)
 * Description: REST Controller exposing endpoints for Razorpay order creation, payment signature verification, and payment transaction logs.
 */
package com.healthclub.api.controller;

import com.healthclub.api.dto.PaymentDtos.CreateOrderRequest;
import com.healthclub.api.dto.PaymentDtos.CreateOrderResponse;
import com.healthclub.api.dto.PaymentDtos.PaymentResponse;
import com.healthclub.api.dto.PaymentDtos.VerifyPaymentRequest;
import com.healthclub.api.service.PaymentService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Endpoint: POST /api/payments/create-order
     * Easy Explanation: Creates a Razorpay Order ID for subscription purchasing.
     */
    @PostMapping("/create-order")
    @ResponseStatus(HttpStatus.CREATED)
    public CreateOrderResponse createOrder(@RequestBody CreateOrderRequest request) {
        return paymentService.createRazorpayOrder(request);
    }

    /**
     * Endpoint: POST /api/payments/verify
     * Easy Explanation: Verifies Razorpay payment signature, logs SUCCESS, and activates member subscription.
     */
    @PostMapping("/verify")
    public PaymentResponse verifyPayment(@RequestBody VerifyPaymentRequest request) {
        return paymentService.verifyRazorpayPayment(request);
    }

    /**
     * Endpoint: GET /api/payments/member/{memberId}
     * Easy Explanation: Fetches payment history for a specific member.
     */
    @GetMapping("/member/{memberId}")
    public List<PaymentResponse> getMemberPayments(@PathVariable("memberId") Long memberId) {
        return paymentService.getMemberPayments(memberId);
    }

    /**
     * Endpoint: GET /api/payments/admin
     * Easy Explanation: Fetches all system payment transactions for Admin audit monitoring.
     */
    @GetMapping("/admin")
    public List<PaymentResponse> getAllPaymentsAdmin() {
        return paymentService.getAllPaymentsAdmin();
    }
}
