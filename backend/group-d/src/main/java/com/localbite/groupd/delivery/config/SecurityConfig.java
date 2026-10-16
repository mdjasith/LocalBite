package com.localbite.groupd.delivery.config;

import com.localbite.groupd.delivery.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/actuator/**",
                                "/api/deliveries/health",
                                "/api/reviews/health",
                                "/api/invoices/health",
                                "/api/notifications/health",
                                "/api/locations/health",
                                "/api/locations/nearby-sellers",
                                "/api/locations/distance"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/reviews/seller/*",
                                "/api/reviews/food/*",
                                "/api/reviews/seller/*/summary",
                                "/api/reviews/food/*/summary"
                        ).permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/reviews/admin/*/hide").hasRole("ADMIN")
                        .requestMatchers("/api/notifications/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}