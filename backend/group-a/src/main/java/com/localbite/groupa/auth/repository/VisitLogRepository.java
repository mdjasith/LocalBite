package com.localbite.groupa.auth.repository;

import com.localbite.groupa.auth.entity.VisitLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VisitLogRepository extends JpaRepository<VisitLog, Long> {

    @Query("SELECT COUNT(v) FROM VisitLog v WHERE v.eventType = :type AND v.createdAt >= :since")
    long countByTypeSince(@Param("type") String type, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT v.visitorId) FROM VisitLog v WHERE v.createdAt >= :since")
    long uniqueVisitorsSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(v) FROM VisitLog v WHERE v.role = :role AND v.eventType = :type AND v.createdAt >= :since")
    long countByRoleAndTypeSince(@Param("role") String role,
                                  @Param("type") String type,
                                  @Param("since") LocalDateTime since);

    @Query("SELECT v.country, COUNT(v) FROM VisitLog v WHERE v.createdAt >= :since AND v.country IS NOT NULL " +
           "GROUP BY v.country ORDER BY COUNT(v) DESC")
    List<Object[]> topCountriesSince(@Param("since") LocalDateTime since, Pageable pageable);

    @Query("SELECT v.city, v.country, COUNT(v) FROM VisitLog v WHERE v.createdAt >= :since AND v.city IS NOT NULL " +
           "GROUP BY v.city, v.country ORDER BY COUNT(v) DESC")
    List<Object[]> topCitiesSince(@Param("since") LocalDateTime since, Pageable pageable);

    List<VisitLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT v FROM VisitLog v WHERE v.eventType = 'LOGIN' ORDER BY v.createdAt DESC")
    List<VisitLog> recentLogins(Pageable pageable);
}