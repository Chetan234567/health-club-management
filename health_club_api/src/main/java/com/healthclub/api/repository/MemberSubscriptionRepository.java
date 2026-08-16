package com.healthclub.api.repository;

import com.healthclub.api.model.MemberSubscription;
import com.healthclub.api.model.SubscriptionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberSubscriptionRepository extends JpaRepository<MemberSubscription, Long> {
    Optional<MemberSubscription> findFirstByMemberIdOrderByEndDateDesc(Long memberId);
    Optional<MemberSubscription> findFirstByMemberIdAndStatusOrderByEndDateDesc(Long memberId, SubscriptionStatus status);
    List<MemberSubscription> findByMemberId(Long memberId);
}
